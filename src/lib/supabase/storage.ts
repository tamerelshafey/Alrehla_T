import { createClient } from './client';
export type StorageBucket = 'Rehla'; // As per the image provided
export type StorageFolder = 'products' | 'blog' | 'profiles' | 'attachments' | 'publishers';

interface UploadResult {
  url: string;
  path: string;
  error: Error | null;
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFile(
  file: File, 
  bucket: StorageBucket, 
  folder: StorageFolder
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Generate a unique file name to prevent overwrites
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: '', path: '', error };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { 
      url: publicUrl, 
      path: data.path, 
      error: null 
    };
  } catch (error) {
    return { 
      url: '', 
      path: '', 
      error: error instanceof Error ? error : new Error('Unknown upload error') 
    };
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(
  path: string, 
  bucket: StorageBucket
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Storage delete error:', error);
    return { error: error instanceof Error ? error : new Error('Unknown delete error') };
  }
}
