import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { 
  addPost, 
  getPosts, 
  deletePost, 
  updatePost, 
  addComment, 
  deleteComment, 
  toggleLike 
} from '../controllers/goalPostController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Setting destination for file: ${file.originalname} to ${uploadsDir}`);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    console.log(`Generated filename: ${uniqueFilename} for original file: ${file.originalname}`);
    cb(null, uniqueFilename);
  }
});

// Filter function to allow only images
const fileFilter = (req, file, cb) => {
  console.log(`Received file: ${file.originalname}, mimetype: ${file.mimetype}`);
  if (file.mimetype.startsWith('image/')) {
    console.log(`Accepted image file: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`Rejected non-image file: ${file.originalname}`);
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    console.error('Upload middleware error:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Apply authentication middleware to all routes
router.use(authenticate);

// Post routes with error handling for uploads
router.post('/add/:goalId', (req, res, next) => {
  console.log('Processing /add/:goalId request');
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    }
    console.log('File upload successful, proceeding to controller');
    next();
  });
}, addPost);

router.get('/all/:goalId', getPosts);
router.delete('/delete/:postId', deletePost);

router.put('/update/:postId', (req, res, next) => {
  console.log('Processing /update/:postId request');
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Upload error in update:', err);
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    }
    console.log('File upload successful for update, proceeding to controller');
    next();
  });
}, updatePost);

// Comment routes
router.post('/comment/:postId', addComment);
router.delete('/comment/:commentId', deleteComment);

// Like routes
router.post('/like/:postId', toggleLike);

export default router; 