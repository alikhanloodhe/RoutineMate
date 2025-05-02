const express = require('express');

const {signUp, login} = require('../controllers/authController.js');
const router = express.Router();   

// Route for user registration
router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;