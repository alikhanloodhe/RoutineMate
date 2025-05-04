// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if all required environment variables are set
if (!cloudName || !apiKey || !apiSecret) {
  console.error('------------------------------------------');
  console.error('CLOUDINARY CONFIGURATION ERROR:');
  console.error('One or more Cloudinary environment variables are missing:');
  console.error(`CLOUDINARY_CLOUD_NAME: ${cloudName ? 'Set' : 'MISSING'}`);
  console.error(`CLOUDINARY_API_KEY: ${apiKey ? 'Set' : 'MISSING'}`);
  console.error(`CLOUDINARY_API_SECRET: ${apiSecret ? 'Set' : 'MISSING'}`);
  console.error('------------------------------------------');
  console.error('Will use local file storage fallback for uploads.');
} else {
  console.log('Cloudinary configuration loaded successfully.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
