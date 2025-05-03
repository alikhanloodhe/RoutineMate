import fs from 'fs';
import path from 'path';

/**
 * Ensures that required directories exist, creating them if necessary
 */
export const ensureDirectoriesExist = () => {
  const requiredDirectories = [
    'uploads',
  ];

  requiredDirectories.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  console.log('Directory check completed');
};

export default ensureDirectoriesExist; 