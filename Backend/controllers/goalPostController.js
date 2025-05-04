import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Add a post to a group goal with optional photo
 */
export const addPost = async (req, res) => {
  const { content } = req.body;
  const user_id = req.user.id;
  const goal_id = req.params.goalId;
  
  console.log('------ POST REQUEST DEBUG ------');
  console.log(`Processing post request for goal ${goal_id}`);
  console.log('Request headers:', req.headers);
  console.log('Request file:', req.file);
  console.log('Request files array:', req.files);
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('--------------------------------');
  
  // Validate required fields
  if (!goal_id || !content) {
    return res.status(400).json({ error: 'Goal ID and content are required' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if the user is a member of this goal
    const memberCheck = await client.query(
      'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
      [goal_id, user_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this goal' });
    }
    
    // Insert the post
    const postResult = await client.query(
      `INSERT INTO goal_posts (goal_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [goal_id, user_id, content]
    );
    
    const post = postResult.rows[0];
    let photo_url = null;
    
    // Process photo if it exists
    if (req.file) {
      try {
        console.log(`Uploading file: ${req.file.path}`);
        console.log('File details:', {
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Check if file exists before attempting to upload
        if (!fs.existsSync(req.file.path)) {
          console.error(`File not found: ${req.file.path}`);
          throw new Error('File not found');
        }
        
        let cloudinarySuccess = false;
        
        try {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'goal_posts',
          });
          
          console.log('Cloudinary upload result:', result);
          photo_url = result.secure_url;
          cloudinarySuccess = true;
        } catch (cloudinaryError) {
          console.error('Error uploading to Cloudinary:', cloudinaryError);
          
          // If Cloudinary upload fails, create a temporary local URL
          // This is not ideal for production but helps with debugging
          const filename = req.file.filename;
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          photo_url = `${baseUrl}/uploads/${filename}`;
          console.log('Using local fallback URL:', photo_url);
        }
        
        // Update the post with the photo URL
        await client.query(
          `UPDATE goal_posts SET photo_url = $1 WHERE post_id = $2`,
          [photo_url, post.post_id]
        );
        
        // Delete local temp file if Cloudinary upload succeeded
        if (cloudinarySuccess) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error(`Error deleting temporary file ${req.file.path}:`, unlinkError);
          }
        }
      } catch (uploadError) {
        console.error('Error handling photo upload:', uploadError);
        // Continue even if photo upload fails
      }
    }
    
    // Get user info for the response
    const userResult = await client.query(
      'SELECT name, email FROM users WHERE id = $1',
      [user_id]
    );
    
    const user = userResult.rows[0];
    
    await client.query('COMMIT');
    
    // Format response
    const formattedPost = {
      ...post,
      photo_url,
      user_name: user.name,
      user_email: user.email,
      likes_count: 0,
      comments_count: 0,
      liked_by_user: false,
      comments: []
    };
    
    res.status(201).json({ 
      message: 'Post added successfully', 
      post: formattedPost
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding post:', err);
    res.status(500).json({ error: 'Server error while adding post' });
  } finally {
    client.release();
  }
};

/**
 * Get all posts for a group goal
 */
export const getPosts = async (req, res) => {
  const user_id = req.user.id;
  const goal_id = req.params.goalId;
  
  try {
    // Check if the user is a member of this goal
    const memberCheck = await pool.query(
      'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
      [goal_id, user_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this goal' });
    }
    
    // Get all posts for this goal with user info
    const postsResult = await pool.query(
      `SELECT gp.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM goal_likes WHERE post_id = gp.post_id) as likes_count,
        EXISTS(SELECT 1 FROM goal_likes WHERE post_id = gp.post_id AND user_id = $1) as liked_by_user,
        (SELECT COUNT(*) FROM goal_comments WHERE post_id = gp.post_id) as comments_count
       FROM goal_posts gp
       JOIN users u ON gp.user_id = u.id
       WHERE gp.goal_id = $2
       ORDER BY gp.created_at DESC`,
      [user_id, goal_id]
    );
    
    const posts = postsResult.rows;
    console.log('Posts from database:', posts);
    
    // For each post, get its comments
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentsResult = await pool.query(
          `SELECT gc.*, u.name as user_name, u.email as user_email
           FROM goal_comments gc
           JOIN users u ON gc.user_id = u.id
           WHERE gc.post_id = $1
           ORDER BY gc.created_at ASC`,
          [post.post_id]
        );
        
        return {
          ...post,
          comments: commentsResult.rows
        };
      })
    );
    
    res.status(200).json({ posts: postsWithComments });
  } catch (err) {
    console.error('Error getting posts:', err);
    res.status(500).json({ error: 'Server error while getting posts' });
  }
};

/**
 * Delete a post
 */
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const user_id = req.user.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify the post exists and belongs to the user
    const postCheck = await client.query(
      'SELECT post_id, user_id, photo_url, goal_id FROM goal_posts WHERE post_id = $1',
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    
    // Check if user is post owner
    if (post.user_id !== user_id) {
      // Check if user is a goal admin
      const isAdmin = await client.query(
        `SELECT gm.* FROM goal_members gm
         WHERE gm.goal_id = $1 AND gm.user_id = $2 AND gm.role = 'admin'`,
        [post.goal_id, user_id]
      );
      
      if (isAdmin.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have permission to delete this post' });
      }
    }
    
    // Delete photo from Cloudinary if it exists
    if (post.photo_url) {
      try {
        // Extract the public_id from the URL
        const urlParts = post.photo_url.split('/');
        const publicIdIndex = urlParts.findIndex(part => part === 'goal_posts');
        
        if (publicIdIndex !== -1 && publicIdIndex < urlParts.length - 1) {
          const publicId = `goal_posts/${urlParts[publicIdIndex + 1].split('.')[0]}`;
          console.log(`Attempting to delete Cloudinary image with public ID: ${publicId}`);
          
          // Delete from Cloudinary
          const deletionResult = await cloudinary.uploader.destroy(publicId);
          console.log(`Cloudinary deletion result:`, deletionResult);
        } else {
          console.error('Could not extract public_id from URL:', post.photo_url);
        }
      } catch (cloudinaryErr) {
        console.error('Error deleting photo from Cloudinary:', cloudinaryErr);
      }
    }
    
    // Delete the post (this will cascade to comments and likes)
    await client.query(
      'DELETE FROM goal_posts WHERE post_id = $1',
      [postId]
    );
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Server error while deleting post' });
  } finally {
    client.release();
  }
};

/**
 * Update a post
 */
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;
  
  console.log(`Processing update request for post ${postId}`);
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify the post exists and belongs to the user
    const postCheck = await client.query(
      'SELECT post_id, user_id, photo_url FROM goal_posts WHERE post_id = $1',
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    
    // Only the post owner can edit the post
    if (post.user_id !== user_id) {
      return res.status(403).json({ error: 'You do not have permission to update this post' });
    }
    
    // Update content
    const updateResult = await client.query(
      `UPDATE goal_posts 
       SET content = $1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE post_id = $2 
       RETURNING *`,
      [content, postId]
    );
    
    let photo_url = post.photo_url;
    
    // Process new photo if it exists
    if (req.file) {
      try {
        console.log(`Uploading new file: ${req.file.path}`);
        console.log('File details:', {
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Check if file exists before attempting to upload
        if (!fs.existsSync(req.file.path)) {
          console.error(`File not found: ${req.file.path}`);
          throw new Error('File not found');
        }
        
        // Delete old photo from Cloudinary if it exists
        if (photo_url) {
          try {
            // Extract the public_id from the URL
            const urlParts = photo_url.split('/');
            const publicIdIndex = urlParts.findIndex(part => part === 'goal_posts');
            
            if (publicIdIndex !== -1 && publicIdIndex < urlParts.length - 1) {
              const publicId = `goal_posts/${urlParts[publicIdIndex + 1].split('.')[0]}`;
              console.log(`Attempting to delete old Cloudinary image with public ID: ${publicId}`);
              
              // Delete from Cloudinary
              await cloudinary.uploader.destroy(publicId);
            } else {
              console.error('Could not extract public_id from URL:', photo_url);
            }
          } catch (cloudinaryErr) {
            console.error('Error deleting old photo from Cloudinary:', cloudinaryErr);
          }
        }
        
        let cloudinarySuccess = false;
        
        try {
          // Upload new photo to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'goal_posts',
          });
          
          console.log('Cloudinary upload result:', result);
          photo_url = result.secure_url;
          cloudinarySuccess = true;
        } catch (cloudinaryError) {
          console.error('Error uploading to Cloudinary:', cloudinaryError);
          
          // If Cloudinary upload fails, create a temporary local URL
          const filename = req.file.filename;
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          photo_url = `${baseUrl}/uploads/${filename}`;
          console.log('Using local fallback URL:', photo_url);
        }
        
        // Update the post with the new photo URL
        await client.query(
          `UPDATE goal_posts SET photo_url = $1 WHERE post_id = $2`,
          [photo_url, postId]
        );
        
        // Delete local temp file if Cloudinary upload succeeded
        if (cloudinarySuccess) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error(`Error deleting temporary file ${req.file.path}:`, unlinkError);
          }
        }
      } catch (uploadError) {
        console.error('Error handling photo upload:', uploadError);
      }
    }
    
    // Get updated post with user info, likes count, and comments count
    const updatedPostResult = await client.query(
      `SELECT gp.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM goal_likes WHERE post_id = gp.post_id) as likes_count,
        EXISTS(SELECT 1 FROM goal_likes WHERE post_id = gp.post_id AND user_id = $1) as liked_by_user,
        (SELECT COUNT(*) FROM goal_comments WHERE post_id = gp.post_id) as comments_count
       FROM goal_posts gp
       JOIN users u ON gp.user_id = u.id
       WHERE gp.post_id = $2`,
      [user_id, postId]
    );
    
    // Get comments for this post
    const commentsResult = await client.query(
      `SELECT gc.*, u.name as user_name, u.email as user_email
       FROM goal_comments gc
       JOIN users u ON gc.user_id = u.id
       WHERE gc.post_id = $1
       ORDER BY gc.created_at ASC`,
      [postId]
    );
    
    const updatedPost = {
      ...updatedPostResult.rows[0],
      comments: commentsResult.rows
    };
    
    await client.query('COMMIT');
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Server error while updating post' });
  } finally {
    client.release();
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (req, res) => {
  const { content } = req.body;
  const user_id = req.user.id;
  const { postId } = req.params;
  
  // Validate required fields
  if (!postId || !content) {
    return res.status(400).json({ error: 'Post ID and content are required' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if the post exists
    const postCheck = await client.query(
      'SELECT post_id, goal_id FROM goal_posts WHERE post_id = $1',
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    
    // Check if the user is a member of the goal this post belongs to
    const memberCheck = await client.query(
      'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
      [post.goal_id, user_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this goal' });
    }
    
    // Insert the comment
    const commentResult = await client.query(
      `INSERT INTO goal_comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [postId, user_id, content]
    );
    
    const comment = commentResult.rows[0];
    
    // Get user info
    const userResult = await client.query(
      'SELECT name, email FROM users WHERE id = $1',
      [user_id]
    );
    
    const user = userResult.rows[0];
    
    await client.query('COMMIT');
    
    // Format response
    const formattedComment = {
      ...comment,
      user_name: user.name,
      user_email: user.email
    };
    
    res.status(201).json({ 
      message: 'Comment added successfully', 
      comment: formattedComment
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error while adding comment' });
  } finally {
    client.release();
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const user_id = req.user.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify the comment exists
    const commentCheck = await client.query(
      `SELECT gc.*, gp.goal_id, gp.user_id as post_owner_id
       FROM goal_comments gc
       JOIN goal_posts gp ON gc.post_id = gp.post_id
       WHERE gc.comment_id = $1`,
      [commentId]
    );
    
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const comment = commentCheck.rows[0];
    
    // Check if user is comment owner, post owner, or goal admin
    if (comment.user_id !== user_id && comment.post_owner_id !== user_id) {
      // Check if user is a goal admin
      const isAdmin = await client.query(
        `SELECT * FROM goal_members
         WHERE goal_id = $1 AND user_id = $2 AND role = 'admin'`,
        [comment.goal_id, user_id]
      );
      
      if (isAdmin.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have permission to delete this comment' });
      }
    }
    
    // Delete the comment
    await client.query(
      'DELETE FROM goal_comments WHERE comment_id = $1',
      [commentId]
    );
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Server error while deleting comment' });
  } finally {
    client.release();
  }
};

/**
 * Toggle like on a post
 */
export const toggleLike = async (req, res) => {
  const user_id = req.user.id;
  const { postId } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if the post exists
    const postCheck = await client.query(
      'SELECT post_id, goal_id FROM goal_posts WHERE post_id = $1',
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postCheck.rows[0];
    
    // Check if the user is a member of this goal
    const memberCheck = await client.query(
      'SELECT * FROM goal_members WHERE goal_id = $1 AND user_id = $2',
      [post.goal_id, user_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this goal' });
    }
    
    // Check if user has already liked the post
    const likeCheck = await client.query(
      'SELECT * FROM goal_likes WHERE post_id = $1 AND user_id = $2',
      [postId, user_id]
    );
    
    let liked;
    
    if (likeCheck.rows.length > 0) {
      // User has already liked - remove the like
      await client.query(
        'DELETE FROM goal_likes WHERE post_id = $1 AND user_id = $2',
        [postId, user_id]
      );
      liked = false;
    } else {
      // User has not liked - add the like
      await client.query(
        'INSERT INTO goal_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, user_id]
      );
      liked = true;
    }
    
    // Get updated likes count
    const likesCountResult = await client.query(
      'SELECT COUNT(*) as likes_count FROM goal_likes WHERE post_id = $1',
      [postId]
    );
    
    const likesCount = likesCountResult.rows[0].likes_count;
    
    await client.query('COMMIT');
    
    res.status(200).json({ 
      message: liked ? 'Post liked successfully' : 'Post unliked successfully',
      liked,
      likes_count: parseInt(likesCount)
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Server error while toggling like' });
  } finally {
    client.release();
  }
}; 