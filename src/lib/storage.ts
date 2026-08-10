import { supabase } from './supabase';

const BUCKET_NAME = 'product-images';

/**
 * Uploads a file (File or Base64 data string) to Supabase Storage bucket 'product-images'.
 * Returns the public CDN URL of the uploaded image.
 */
export async function uploadProductImage(fileOrBase64: File | string): Promise<string> {
  if (!supabase) {
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
  }

  try {
    let fileToUpload: Blob;
    let fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

    if (typeof fileOrBase64 === 'string') {
      // If Base64 string, convert to Blob
      if (fileOrBase64.startsWith('data:')) {
        const response = await fetch(fileOrBase64);
        fileToUpload = await response.blob();
      } else {
        // Already a HTTP URL
        return fileOrBase64;
      }
    } else {
      fileToUpload = fileOrBase64;
      const ext = fileOrBase64.name.split('.').pop() || 'jpg';
      fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    }

    // Upload to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('[Storage upload fallback]:', error.message);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image to Supabase storage:', e);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
  }
}
