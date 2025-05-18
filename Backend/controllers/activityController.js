// controllers/activityController.js
import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const addActivityWithPhoto = async (req, res) => {
  const { title, description, mood } = req.body;
  const user_id = req.user.id;
  const goalId = req.params.goalId;
  
  // Validate required fields
  if (!goalId || !title) {
    return res.status(400).json({ error: 'Goal ID and title are required' });
  }

  // Validate mood if provided
  const validMoods = ['happy', 'motivated', 'tired', 'stressed', 'neutral'];
  if (mood && !validMoods.includes(mood)) {
    return res.status(400).json({ 
      error: 'Invalid mood value. Valid options are: happy, motivated, tired, stressed, neutral' 
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify the goal exists and belongs to the user
    const goalCheck = await client.query(
      'SELECT goal_id FROM goals WHERE goal_id = $1 AND creator_id = $2',
      [goalId, user_id]
    );

    if (goalCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Goal not found or you do not have permission to add activities to it' });
    }

    // Check if uploads directory exists, if not create it
    if (req.files && req.files.length > 0) {
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
      }
    }

    // Insert activity into DB
    const activityRes = await client.query(
      `INSERT INTO activities (goal_id, user_id, title, description, mood)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, goal_id, user_id, title, description, mood, created_at`,
      [goalId, user_id, title, description || null, mood || 'neutral']
    );

    const activity = activityRes.rows[0];

    
    // Store photo URLs
    const uploadedPhotos = [];
    
    // Process multiple photos if they exist
    if (req.files && req.files.length > 0) { 
      for (const file of req.files) {
        try {
          // Check if file exists before attempting to upload
          if (!fs.existsSync(file.path)) {
            console.error(`File not found: ${file.path}`);
            continue;
          }
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'activities',
          });

          // Save photo URL to database
          const photoRes = await client.query(
            `INSERT INTO activity_photos (activity_id, photo_url)
             VALUES ($1, $2)
             RETURNING id, photo_url, uploaded_at`,
            [activity.id, result.secure_url]
          );
          
          uploadedPhotos.push(photoRes.rows[0]);
          
          // Delete local temp file
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error(`Error deleting temporary file ${file.path}:`, unlinkError);
          }
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          // Continue with other photos even if one fails
        }
      }
    }
    
    // Add photos to activity object
    activity.photos = uploadedPhotos;

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Activity added successfully', 
      activity: {
        ...activity,
        activity_id: activity.id // Map database id to activity_id for frontend
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Server error while adding activity' });
  } finally {
    client.release();
  }
};

/**
 * Get all activities for a specific goal
 */
export const getActivitiesByGoal = async (req, res) => {
  const { goalId } = req.params;
  const user_id = req.user.id;

  try {
    // Verify the goal exists and belongs to the user
    const goalCheck = await pool.query(
      'SELECT goal_id FROM goals WHERE goal_id = $1 AND creator_id = $2',
      [goalId, user_id]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found or you do not have permission to view it' });
    }

    // Get all activities for this goal
    const activities = await pool.query(
      `SELECT a.id, a.goal_id, a.title, a.description, a.mood, a.created_at, a.updated_at
       FROM activities a
       WHERE a.goal_id = $1 AND a.user_id = $2
       ORDER BY a.created_at DESC`,
      [goalId, user_id]
    );

    // For each activity, get its photos
    const activitiesWithPhotos = await Promise.all(
      activities.rows.map(async (activity) => {
        const photos = await pool.query(
          `SELECT id, photo_url, uploaded_at FROM activity_photos 
           WHERE activity_id = $1`,
          [activity.id]
        );

        return {
          ...activity,
          photos: photos.rows
        };
      })
    );

    res.status(200).json(activitiesWithPhotos);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};

/**
 * Get a specific activity by ID
 */
export const getActivityById = async (req, res) => {
  const { activityId } = req.params;
  const user_id = req.user.id;

  try {
    // Get the activity with its associated photos
    const activityResult = await pool.query(
      `SELECT a.id, a.goal_id, a.title, a.description, a.mood, a.created_at, a.updated_at,
              g.title as goal_title
       FROM activities a
       JOIN goals g ON a.goal_id = g.goal_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [activityId, user_id]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found or you do not have permission to view it' });
    }

    const activity = activityResult.rows[0];

    // Get the photos for this activity
    const photosResult = await pool.query(
      `SELECT id, photo_url, uploaded_at 
       FROM activity_photos 
       WHERE activity_id = $1`,
      [activityId]
    );

    activity.photos = photosResult.rows;
    res.status(200).json(activity);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ error: 'Server error while fetching activity' });
  }
};

/**
 * Delete an activity
 */
export const deleteActivity = async (req, res) => {
  const { activityId } = req.params;
  const user_id = req.user.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify the activity exists and belongs to the user
    const activityCheck = await client.query(
      'SELECT id FROM activities WHERE id = $1 AND user_id = $2',
      [activityId, user_id]
    );

    if (activityCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Activity not found or you do not have permission to delete it' });
    }

    // Get photo URLs for Cloudinary deletion
    const photos = await client.query(
      'SELECT photo_url FROM activity_photos WHERE activity_id = $1',
      [activityId]
    );

    // Delete photos from Cloudinary if there are any
    if (photos.rows.length > 0) {
      for (const photo of photos.rows) {
        try {

          const urlParts = photo.photo_url.split('/');
          const publicIdWithVersion = urlParts.slice(-2).join('/'); // Get 'v1234567890/activities/abcdef123456'
          
          const publicId = publicIdWithVersion.includes('v') && publicIdWithVersion.includes('/')
            ? publicIdWithVersion.split('/').slice(1).join('/') // Get 'activities/abcdef123456'
            : publicIdWithVersion;
          
          
          // Delete from Cloudinary
          const deletionResult = await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryErr) {
          // Log error but continue with deletion process
          console.error('Error deleting photo from Cloudinary:', cloudinaryErr);
        }
      }
    }

    // Photos will be deleted automatically from the database via CASCADE constraint

    // Delete the activity (this will cascade to photos)
    await client.query(
      'DELETE FROM activities WHERE id = $1',
      [activityId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Server error while deleting activity' });
  } finally {
    client.release();
  }
};

/**
 * Update an activity
 */
export const updateActivity = async (req, res) => {
  const { activityId } = req.params;
  const user_id = req.user.id;
  
  // FormData fields
  const title = req.body.title;
  const description = req.body.description;
  const mood = req.body.mood;
  const photos = req.files; // New photos to add

  let removedPhotoIds = [];
  
  // Check if there are photo IDs to remove
  if (req.body.removedPhotoIds) {
    try {
      removedPhotoIds = JSON.parse(req.body.removedPhotoIds);
    } catch (e) {
      console.error('Error parsing removedPhotoIds:', e);
    }
  }

  // Validate mood if provided
  if (mood) {
    const validMoods = ['happy', 'motivated', 'tired', 'stressed', 'neutral'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ 
        error: 'Invalid mood value. Valid options are: happy, motivated, tired, stressed, neutral' 
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Verify the activity exists and belongs to the user
    const activityCheck = await client.query(
      'SELECT id, goal_id FROM activities WHERE id = $1 AND user_id = $2',
      [activityId, user_id]
    );

    if (activityCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Activity not found or you do not have permission to update it' 
      });
    }
    
    const activityData = activityCheck.rows[0];
    const goalId = activityData.goal_id;

    // Update activity basic information
    const updateResult = await client.query(
      `UPDATE activities 
      SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          mood = COALESCE($3, mood),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING id, goal_id, user_id, title, description, mood, created_at, updated_at`,
      [
        title || null, 
        description || null, 
        mood || null,
        activityId, 
        user_id
      ]
    );

    const updatedActivity = updateResult.rows[0];
    
    // Delete removed photos if any
    if (removedPhotoIds && removedPhotoIds.length > 0) {
      // First, get the photo URLs for potential Cloudinary cleanup
      const photosToRemove = await client.query(
        `SELECT id, photo_url FROM activity_photos 
         WHERE id = ANY($1)`,
        [removedPhotoIds]
      );
      
      
      // Delete photos from Cloudinary
      for (const photo of photosToRemove.rows) {
        try {
          // Extract the public_id from the URL
          const urlParts = photo.photo_url.split('/');
          const publicIdWithVersion = urlParts.slice(-2).join('/'); // Get 'v1234567890/activities/abcdef123456'
          
          // Remove version number if present
          const publicId = publicIdWithVersion.includes('v') && publicIdWithVersion.includes('/')
            ? publicIdWithVersion.split('/').slice(1).join('/') // Get 'activities/abcdef123456'
            : publicIdWithVersion;
          
          
          // Delete from Cloudinary
          const deletionResult = await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryErr) {
          console.error('Error deleting photo from Cloudinary:', cloudinaryErr);
        }
      }
      
      // Then delete from the database
      await client.query(
        `DELETE FROM activity_photos 
         WHERE id = ANY($1) AND activity_id = $2`,
        [removedPhotoIds, activityId]
      );
    }
    
    // Process new photos if any
    if (photos && photos.length > 0) {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
      }
      
      for (const file of photos) {
        try {
          
          // Check if file exists
          if (!fs.existsSync(file.path)) {
            console.error(`File not found: ${file.path}`);
            continue;
          }
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'activities',
          });
          
          // Save photo URL to database
          await client.query(
            `INSERT INTO activity_photos (activity_id, photo_url)
             VALUES ($1, $2)`,
            [activityId, result.secure_url]
          );
          
          // Delete temp file
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error(`Error deleting temporary file: ${unlinkError}`);
          }
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
        }
      }
    }
    
    // Get updated photos list
    const photosResult = await client.query(
      `SELECT id, photo_url, uploaded_at 
       FROM activity_photos 
       WHERE activity_id = $1`,
      [activityId]
    );
    
    updatedActivity.photos = photosResult.rows;
    
    // Format response to match frontend expectations
    const formattedActivity = {
      ...updatedActivity,
      activity_id: updatedActivity.id  // Map database id to activity_id for frontend
    };
    
    await client.query('COMMIT');
    
    res.status(200).json({
      message: 'Activity updated successfully',
      activity: formattedActivity
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating activity:', err);
    res.status(500).json({ error: 'Server error while updating activity' });
  } finally {
    client.release();
  }
};

/**
 * Get all activities for the current user across all goals
 */
export const getAllUserActivities = async (req, res) => {
  const user_id = req.user.id;
  
  try {
    // Get all activities for this user
    const activities = await pool.query(
      `SELECT a.id, a.goal_id, a.title, a.description, a.mood, a.created_at, a.updated_at,
              g.title as goal_title
       FROM activities a
       JOIN goals g ON a.goal_id = g.goal_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [user_id]
    );

    // For each activity, get its photos
    const activitiesWithPhotos = await Promise.all(
      activities.rows.map(async (activity) => {
        const photos = await pool.query(
          `SELECT id, photo_url, uploaded_at 
           FROM activity_photos 
           WHERE activity_id = $1`,
          [activity.id]
        );
        
        return {
          ...activity,
          photos: photos.rows
        };
      })
    );

    res.status(200).json(activitiesWithPhotos);
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};
