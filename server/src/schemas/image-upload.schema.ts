import { z } from 'zod';

// Schema for validating metadata in multipart form data
export const imageUploadMetadataSchema = z.object({
  folder: z.string().optional().default('general'),
  isPrivate: z.boolean().optional().default(false),
  description: z.string().optional(),
  userId: z.string().optional(), // This will be set from authenticated user
  referenceType: z.enum(['USER_PROFILE', 'BANK_PROOF', 'KYC_DOCUMENT', 'GENERAL']).optional().default('GENERAL'),
  referenceId: z.string().optional(),
});

// Schema for validating image deletion
export const imageDeleteSchema = z.object({
  key: z.string().min(1, { message: 'Image key is required' }),
});

// Schema for validating the response of get presigned URL
export const presignedUrlSchema = z.object({
  fileType: z.string().min(1, { message: 'File type is required' }),
  fileName: z.string().min(1, { message: 'File name is required' }),
  folder: z.string().optional().default('general'),
  referenceType: z.enum(['USER_PROFILE', 'BANK_PROOF', 'KYC_DOCUMENT', 'GENERAL']).optional().default('GENERAL'),
  referenceId: z.string().optional(),
});

export type ImageUploadMetadata = z.infer<typeof imageUploadMetadataSchema>;
export type ImageDeleteInput = z.infer<typeof imageDeleteSchema>;
export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>; 