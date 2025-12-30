'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCreativeStore } from '@/store/useCreativeStore';
import { UPLOAD, API } from '@/lib/constants';

interface ProductUploaderProps {
  onUploadComplete?: () => void;
}

export function ProductUploader({ onUploadComplete }: ProductUploaderProps) {
  const {
    productImage,
    setProductImage,
    isUploading,
    setLoading,
    setError,
    error,
    nextStep,
  } = useCreativeStore();

  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string> => {
    setLoading('isUploading', true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(API.upload, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.data.imageUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      throw err;
    } finally {
      setLoading('isUploading', false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > UPLOAD.maxFileSize) {
        setError('File size exceeds 10MB limit');
        return;
      }

      // Validate file type
      if (!(UPLOAD.supportedFormats as readonly string[]).includes(file.type)) {
        setError('Please upload a JPG, PNG, or WebP image');
        return;
      }

      try {
        // Create local preview immediately
        const localUrl = URL.createObjectURL(file);
        setProductImage(localUrl, file);

        // Upload to server
        const serverUrl = await uploadFile(file);
        setProductImage(serverUrl, file);

        onUploadComplete?.();
      } catch {
        // Error already set in uploadFile
      }
    },
    [setProductImage, setError, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleContinue = () => {
    if (productImage) {
      nextStep();
    }
  };

  const handleRemove = () => {
    setProductImage('', null as unknown as File);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Upload Your Product Image
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload a flat product photo of your hoodie or sweatshirt
        </p>
      </div>

      {/* Dropzone or Preview */}
      {!productImage ? (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-12
            transition-all duration-200 cursor-pointer
            ${
              isDragActive && !isDragReject
                ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800'
                : isDragReject
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" label="Uploading..." showProgress progress={uploadProgress} />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <UploadIcon className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {isDragActive
                  ? isDragReject
                    ? 'This file type is not supported'
                    : 'Drop your image here'
                  : 'Drag & drop your image here'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Supported: JPG, PNG, WebP (max 10MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Preview */}
          <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-lg">
            <Image
              src={productImage}
              alt="Uploaded product"
              fill
              className="object-contain"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center">
                <Spinner size="lg" label="Processing..." showProgress progress={uploadProgress} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleRemove} disabled={isUploading}>
              Change Image
            </Button>
            <Button onClick={handleContinue} disabled={isUploading}>
              Continue
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default ProductUploader;
