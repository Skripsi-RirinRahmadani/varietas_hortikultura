import { supabase } from './supabase';

export const STORAGE_BUCKETS = {
  COMMODITIES: 'commodities',
  VARIETIES: 'varieties',
  AVATARS: 'avatars',
} as const;

type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Upload file to Supabase Storage
 * @param bucket - Bucket name (commodities, varieties, avatars)
 * @param file - File to upload
 * @param folderPath - Optional folder path within bucket
 * @returns Public URL if successful, null if failed
 */
export async function uploadFileToStorage(
  bucket: BucketName,
  file: File,
  folderPath: string = 'public'
): Promise<string | null> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${random}-${file.name}`;
    const filePath = `${folderPath}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (err) {
    console.error('Exception uploading file:', err);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromStorage(
  bucket: BucketName,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting from ${bucket}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting file:', err);
    return false;
  }
}

/**
 * Get public URL for file in storage
 */
export function getStoragePublicUrl(
  bucket: BucketName,
  filePath: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Extract file path from public URL
 */
export function extractFilePathFromUrl(
  bucket: BucketName,
  publicUrl: string
): string {
  const baseUrl = supabase.storage.from(bucket).getPublicUrl('');
  return publicUrl.replace(baseUrl.data.publicUrl, '');
}
