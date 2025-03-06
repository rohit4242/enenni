import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as imageUploadHandler from '../handlers/image-upload.handler';
import { imageDeleteSchema, presignedUrlSchema } from '../schemas/image-upload.schema';
import { authenticate } from '../middleware/auth';

const imageUploadRouter = new Hono();

// All routes require authentication
imageUploadRouter.use('/*', authenticate);

// Upload image route
imageUploadRouter.post('/', imageUploadHandler.uploadImage);

// Delete image route
imageUploadRouter.delete('/', zValidator('json', imageDeleteSchema), imageUploadHandler.deleteImage);

// Get presigned URL for direct S3 uploads from client
imageUploadRouter.post('/presigned-url', zValidator('json', presignedUrlSchema), imageUploadHandler.getPresignedUrl);

export default imageUploadRouter; 