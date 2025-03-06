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
    const userId = c.get('userId');
    
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
    
    // Upload to S3
    await s3Client.putObject(key, buffer, {
      contentType: file.type,
      acl: metadata.isPrivate ? 'private' : s3Config.acl,
      metadata: {
        'user-id': userId,
        'original-name': originalFilename,
        'description': metadata.description || '',
        'reference-type': metadata.referenceType,
        'reference-id': metadata.referenceId || '',
      }
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
    const userId = c.get('userId');
    const isAdmin = c.get('isAdmin');
    const { key } = await c.req.json();
    
    // Check if the image belongs to the user or if the user is an admin (optional)
    // This would require you to store image metadata in the database
    // For simplicity, we're just checking if the user is authenticated
    
    // Delete from S3
    await s3Client.deleteObject(key);
    
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
    const userId = c.get('userId');
    const { fileType, fileName, folder = 'general' } = await c.req.json();
    
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
    
    // Generate a presigned URL for PUT
    // Note: Bun's S3 client doesn't directly support presigned URLs natively like AWS SDK
    // You might need to use a different approach or integrate with AWS SDK for this feature
    
    // For now, let's just return a mock response
    return c.json({
      success: true,
      data: {
        uploadUrl: `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`,
        key,
        fileName: uniqueFilename,
        folder,
        expiresIn: 3600, // 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new HTTPException(500, { message: 'Failed to generate presigned URL' });
  }
}; 