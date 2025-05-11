import pool from '../config/db.js';
import { getClientAdjustedTime } from '../utils/timeUtils.js';

export const searchAddFriend = async (req, res) => {
  const { query } = req.query; // GET params
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE email ILIKE $1 and id != $2', 
      [`%${query}%`,user_id]
    );

    res.status(200).json({ users: result.rows }); // Return array of users
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const AddFriend = async (req, res) => {
  const user_id = req.user.id;
  const { friend_id } = req.body;
  const status = 'pending';
  const client = await pool.connect();
  
  // Get timezone-adjusted timestamp
  const { now } = getClientAdjustedTime(req.clientTimezone?.name);
  
  try {
    const checkResult = await client.query('SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ', [user_id, friend_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ msg: 'Friend request already sent or already friends' });
    }
    
    await client.query(
      `INSERT INTO friend_requests(sender_id, receiver_id, status, created_at) 
       VALUES ($1, $2, $3, ${now})`,
      [user_id, friend_id, status]
    );

    res.status(201).json({ msg: 'Friend request successfully sent' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'An error occurred' });
  }finally{
    client.release();
  }
};

export const getSentRequests = async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();
  const status = 'pending';

  try {
    // Use adjustColumn for proper timezone display
    const { adjustColumn } = getClientAdjustedTime(req.clientTimezone?.name);
    
    const result = await client.query(
      `SELECT fr.id, u.name, u.email, fr.status, 
       ${adjustColumn('fr.created_at')} AS created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.receiver_id
       WHERE fr.sender_id = $1 AND fr.status = $2`,
      [user_id, status]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Error fetching sent requests' });
  } finally {
    client.release();
  }
};

export const getReceivedRequests = async (req, res) => {
  const user_id = req.user.id;
  const status = 'pending';
  const client = await pool.connect();

  try {
    // Use adjustColumn for proper timezone display
    const { adjustColumn } = getClientAdjustedTime(req.clientTimezone?.name);
    
    const result = await client.query(`
      SELECT fr.id, u.name, u.email, fr.status,
      ${adjustColumn('fr.created_at')} AS created_at
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = $1 AND fr.status = $2
    `, [user_id, status]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};


export const acceptFriend = async (req, res) => {
  const user_id = req.user.id;
  const { requestId } = req.body;
  const client = await pool.connect();
  
  // Get timezone-adjusted timestamp
  const { now } = getClientAdjustedTime(req.clientTimezone?.name);

  try {
    const result = await client.query(
      'SELECT sender_id FROM friend_requests WHERE id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Friend request not found' });
    }

    const friend_id = result.rows[0].sender_id;

    // Add friendship (bi-directional) with timestamp
    await client.query(
      `INSERT INTO friends(user_id, friend_id, created_at) 
       VALUES ($1, $2, ${now})`, 
      [user_id, friend_id]
    );
    
    await client.query(
      `INSERT INTO friends(user_id, friend_id, created_at) 
       VALUES ($1, $2, ${now})`, 
      [friend_id, user_id]
    );

    // Update the friend request status to accepted with timestamp
    await client.query(
      `UPDATE friend_requests 
       SET status = $1, updated_at = ${now} 
       WHERE id = $2`, 
      ['accepted', requestId]
    );

    res.status(201).json({ msg: 'Friend Added Successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Failed to accept friend request' });
  } finally {
    client.release();
  }
};


export const declineFriend = async (req, res) => {
  const user_id = req.user.id;
  const { requestId } = req.body;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'DELETE FROM friend_requests WHERE id = $1 AND receiver_id = $2 AND status = $3',
      [requestId, user_id, 'pending']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Request not found or already handled' });
    }

    res.status(200).json({ msg: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining request:', error);
    res.status(500).json({ msg: 'Failed to decline request' });
  } finally {
    client.release();
  }
};

export const cancelFriend = async (req, res) => {
  const user_id = req.user.id;
  const { requestId } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM friend_requests WHERE id = $1 AND sender_id = $2 AND status = $3',
      [requestId, user_id, 'pending']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Request not found or already handled' });
    }

    res.status(200).json({ msg: 'Friend request canceled' });
  } catch (error) {
    console.error('Error canceling request:', error);
    res.status(500).json({ msg: 'Failed to cancel request' });
  } finally {
    client.release();
  }
};

export const getAllFriends = async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();
  try {
    // Use adjustColumn for proper timezone display
    const { adjustColumn } = getClientAdjustedTime(req.clientTimezone?.name);
    
    const result = await client.query(`
      SELECT u.id, u.name, u.email, ${adjustColumn('f.created_at')} AS friend_since
      FROM friends f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = $1
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ msg: 'Failed to fetch friends' });
  } finally {
    client.release();
  }
};
