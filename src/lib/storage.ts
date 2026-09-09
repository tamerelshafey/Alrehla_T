/**
 * Simulated storage service.
 * In the future, this will upload to Cloudinary or Supabase Storage and return a permanent URL.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // Mock delay to simulate network upload
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return a local Object URL as a temporary solution.
  // Note: Components using this mock should ideally clean up with URL.revokeObjectURL
  // to prevent memory leaks during testing, as was done in previous memory leak fixes.
  // Once this returns a real cloud URL, revokeObjectURL will just safely do nothing.
  return URL.createObjectURL(file);
}
