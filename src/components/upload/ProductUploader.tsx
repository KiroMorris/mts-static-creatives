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
        <h2 className="text-2xl font-bold mb-2">
          <span className="gradient-text">Upload Your Product Image</span>
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
            relative rounded-2xl p-12 upload-zone-gradient
            transition-all duration-300 cursor-pointer
            bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/50
            dark:from-violet-950/20 dark:via-zinc-900 dark:to-cyan-950/20
            ${
              isDragActive && !isDragReject
                ? 'scale-[1.02] shadow-2xl shadow-violet-500/20'
                : isDragReject
                ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'hover:shadow-xl hover:shadow-violet-500/10'
            }
            ${isUploading ? 'pointer-events-none opacity-80' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center relative z-10">
              <div className="p-6 rounded-2xl glass-card mb-4">
                <Spinner size="lg" label="Uploading..." showProgress progress={uploadProgress} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <UploadIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                {isDragActive
                  ? isDragReject
                    ? 'This file type is not supported'
                    : 'Drop your image here'
                  : 'Drag & drop your image here'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                or <span className="text-violet-600 dark:text-violet-400 font-medium hover:underline">click to browse</span>
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30">
                <SparkleIcon className="w-4 h-4 text-violet-500" />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  JPG, PNG, WebP (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Preview with gradient border */}
          <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden gradient-border p-1">
            <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={productImage}
                alt="Uploaded product"
                fill
                className="object-contain"
              />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Spinner size="lg" label="Processing..." showProgress progress={uploadProgress} />
              </div>
            )}
          </div>

          {/* Success indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Image uploaded successfully</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleRemove} disabled={isUploading} className="group">
              <RefreshIcon className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Change Image
            </Button>
            <Button onClick={handleContinue} disabled={isUploading} className="btn-gradient text-white border-0">
              Continue
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Error message with premium styling */}
      {error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/50 rounded-xl shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <XIcon className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default ProductUploader;
