const express = require('express'); // Express

const { signup, login } = require('../controllers/authController');
const {verifyEmail} = require('../utils/verifyEmail');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);

module.exports = router;
