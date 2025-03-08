import { S3Client } from 'bun';

// Load environment variables for S3 configuration
export const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  bucket: process.env.S3_BUCKET_NAME || '',
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.AWS_S3_ENDPOINT || `https://s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
  acl: process.env.AWS_S3_ACL || 'public-read',
};

// Create S3 client
export const s3Client = new S3Client({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  bucket: s3Config.bucket,
  endpoint: s3Config.endpoint,
});

// Define allowed mime types for image uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Generate a unique filename for uploaded images
export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}; 