const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // required to mail the user

// This file is exporting two modules/functions signup and login
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"RoutineMate" <your-email@gmail.com>',
    to: email,
    subject: "Verify your email",
    html: `<p>Click the link to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`,
  });
}

exports.signup = async (req, res) => {
    pool.connect()
  .then(() => console.log('Connected to Supabase!'))
  .catch(err => console.error('Connection error:', err));
  
  const { name, email, password } = req.body; // Extracts name, email, password from request body
  try {
    // Check if user exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // Query from the database that either that email already registered await causes the prgram to wait until the query is fininsed

    if (userExist.rows.length > 0) return res.status(400).json({ msg: "User already exists" }); // If user already exists return 400 bad request response along with the message in json format and returns through the arrow function

    // Hash password using library bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user using pool.query pool is the connection to the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    // Create JWT Token
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    sendVerificationEmail(email,token);

    res.status(201).json({ token, user: newUser.rows[0] }); // Respond with status 201 means created along with user details
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ msg: "Invalid credentials" }); // If user doesn't exit


  if (!user.rows[0].is_verified) {
  return res.status(401).json({ msg: 'Please verify your email first.' });
  }
    // Compare password // bcrypt Library automatically create hash of this password and compare it with hashed password stored in the db
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT Token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
