/**
 * Uploading an image to Cloudinary from the browser.
 *
 * The personalisation wizard used to store only the file's NAME, discarding
 * the file itself — so a customer paid for a book whose hero was drawn from a
 * photo the platform never received, while the screen said "تم إرفاق صورة
 * شخصية".
 *
 * The preset is unsigned, so no secret is involved and nothing here needs a
 * server round-trip; the cloud name and preset are public by design.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwg0hr34g';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'alreha';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadImage(file: File, folder = 'alrehla'): Promise<UploadedImage> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم — استخدم صورة JPG أو PNG');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('حجم الصورة كبير — الحد الأقصى 10 ميجابايت');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Cloudinary upload failed', response.status, detail);
    throw new Error('تعذّر رفع الصورة، برجاء المحاولة مرة أخرى');
  }

  const data = (await response.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url) throw new Error('تعذّر رفع الصورة');

  return { url: data.secure_url, publicId: data.public_id ?? '' };
}
