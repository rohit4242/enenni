import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import prisma from '../lib/prisma';
import { 
  s3Client, 
  s3Config,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  generateUniqueFilename
} from '../config/s3.config';
import type { ImageUploadMetadata } from '../schemas/image-upload.schema';

// Upload image to S3
export const uploadImage = async (c: Context) => {
  try {
    const userId = c.get('user')?.id;
    
    // Parse the multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    // Validate the file
    if (!file) {
      throw new HTTPException(400, { message: 'No file provided' });
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new HTTPException(400, { message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new HTTPException(400, { 
        message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
      });
    }
    
    // Parse metadata from form data
    const metadata: ImageUploadMetadata = {
      folder: formData.get('folder')?.toString() || 'general',
      isPrivate: formData.get('isPrivate') === 'true',
      description: formData.get('description')?.toString(),
      referenceType: formData.get('referenceType')?.toString() as any || 'GENERAL',
      referenceId: formData.get('referenceId')?.toString(),
      userId
    };
    
    // Generate a unique filename
    const originalFilename = file.name;
    const filename = generateUniqueFilename(originalFilename);
    
    // Define the key (path) in the S3 bucket
    const key = `${metadata.folder}/${filename}`;
    
    // Get the file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a reference to the S3 file
    const s3File = s3Client.file(key);
    
    // Upload to S3 using Bun's write method
    await s3File.write(buffer, {
      type: file.type,
      acl: metadata.isPrivate ? 'private' : (s3Config.acl as 'public-read' | 'private')
    });
    
    // Generate the URL
    const url = metadata.isPrivate 
      ? null 
      : `${s3Config.endpoint}/${s3Config.bucket}/${key}`;
   
    // Return the upload details
    return c.json({
      success: true,
      data: {
        key,
        filename,
        originalFilename,
        mimeType: file.type,
        size: file.size,
        url,
        isPrivate: metadata.isPrivate,
        folder: metadata.folder,
        referenceType: metadata.referenceType,
        referenceId: metadata.referenceId,
      }
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error uploading image to S3:', error);
    throw new HTTPException(500, { message: 'Failed to upload image' });
  }
};

// Delete image from S3
export const deleteImage = async (c: Context) => {
  try {
    const userId = c.get('user')?.id;
    const { key } = await c.req.json();
    
    // Delete from S3 using Bun's delete method
    const s3File = s3Client.file(key);
    await s3File.delete();
    
    return c.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new HTTPException(500, { message: 'Failed to delete image' });
  }
};

// Get a presigned URL for client-side uploads
export const getPresignedUrl = async (c: Context) => {
  try {
    const userId = c.get('user')?.id;
    const { fileType, fileName, folder = 'general', referenceType = 'GENERAL', referenceId } = await c.req.json();
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
      throw new HTTPException(400, { 
        message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
      });
    }
    
    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename(fileName);
    
    // Define the key (path) in the S3 bucket
    const key = `${folder}/${uniqueFilename}`;
    
    // Create a reference to the S3 file
    const s3File = s3Client.file(key);
    
    // Generate a presigned URL with 1 hour expiration
    const expiresIn = 3600; // 1 hour
    const uploadUrl = s3File.presign({
      expiresIn,
      method: 'PUT',
      acl: s3Config.acl as 'public-read' | 'private'
    });
    
    return c.json({
      success: true,
      data: {
        uploadUrl,
        key,
        fileName: uniqueFilename,
        folder,
        expiresIn,
        // Include these so the client can update the URL after uploading
        fileUrl: `${s3Config.endpoint}/${s3Config.bucket}/${key}`,
        referenceType,
        referenceId
      }
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new HTTPException(500, { message: 'Failed to generate presigned URL' });
  }
}; 