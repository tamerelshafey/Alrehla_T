'use client';

import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import { uploadFile, StorageFolder, StorageBucket } from '@/lib/supabase/storage';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  folder: StorageFolder;
  bucket?: StorageBucket;
  accept?: string;
  maxSize?: number; // In MB
  className?: string;
  label?: string;
  currentFileUrl?: string;
}

export function FileUpload({
  onUploadSuccess,
  folder,
  bucket = 'Rehla',
  accept = 'image/*',
  maxSize = 10,
  className = '',
  label = 'قم برفع ملف',
  currentFileUrl
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم الملف يجب أن لا يتجاوز ${maxSize}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const { url, error: uploadError } = await uploadFile(file, bucket, folder);
      
      if (uploadError) {
        throw uploadError;
      }
      
      if (url) {
        onUploadSuccess(url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('فشل في رفع الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 text-sm font-medium text-gray-700">{label}</div>
      
      {currentFileUrl && !isUploading ? (
        <div className="relative mb-4 group rounded-xl overflow-hidden border border-gray-200 w-full h-40 bg-gray-50 flex items-center justify-center">
          {accept.includes('image') ? (
            <img 
              src={currentFileUrl} 
              alt="Current upload" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <FileIcon className="w-10 h-10 text-brand-teal mb-2" />
              <span className="text-sm text-gray-500">تم رفع الملف</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              تغيير الملف
            </button>
          </div>
        </div>
      ) : null}

      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center w-full h-32 
          border-2 border-dashed rounded-xl transition-colors
          ${isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'}
          ${error ? 'border-red-400 bg-red-50' : ''}
          ${currentFileUrl && !isUploading ? 'hidden' : 'flex'}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mb-2" />
            <span className="text-sm text-gray-500">جاري الرفع...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className={`w-8 h-8 mb-2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-500 font-medium">
              اضغط لرفع الملف
            </span>
            <span className="text-xs text-gray-400 mt-1">
              أقصى حجم {maxSize}MB
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
    </div>
  );
}
