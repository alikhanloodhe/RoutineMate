// controllers/activityController.js
import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const addActivityWithPhoto = async (req, res) => {
  const { goal_id, title, description, mood } = req.body;
  const user_id = req.user.id; // Assuming you have auth 
  console.log(req.body);

  try {
    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'activities',
    });

    // 2. Insert activity into DB
    const activityRes = await pool.query(
      `INSERT INTO activities (goal_id, user_id, title, description, mood)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [goal_id, user_id, title, description, mood]
    );

    const activityId = activityRes.rows[0].id;

    // 3. Insert photo into activity_photos table
    await pool.query(
      `INSERT INTO activity_photos (activity_id, photo_url)
       VALUES ($1, $2)`,
      [activityId, result.secure_url]
    );

    // 4. Delete local temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Activity added successfully', activityId });
  } catch (err) {
    console.error('Error uploading activity:', err);
    res.status(500).json({ error: 'Server error while uploading activity' });
  }
};
