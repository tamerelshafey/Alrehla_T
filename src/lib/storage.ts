export async function uploadImage(file: File, path: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return URL.createObjectURL(file);
}
