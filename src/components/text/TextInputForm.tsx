'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useCreativeStore } from '@/store/useCreativeStore';

const MAX_HEADLINE_LENGTH = 50;
const MAX_SUBTITLE_LENGTH = 50;

export function TextInputForm() {
  const {
    heroImage,
    headline: storedHeadline,
    subtitle: storedSubtitle,
    setText,
    nextStep,
    prevStep,
  } = useCreativeStore();

  const [headline, setHeadline] = useState(storedHeadline || '');
  const [subtitle, setSubtitle] = useState(storedSubtitle || '');
  const [errors, setErrors] = useState<{ headline?: string; subtitle?: string }>({});

  // Sync with store
  useEffect(() => {
    setHeadline(storedHeadline || '');
    setSubtitle(storedSubtitle || '');
  }, [storedHeadline, storedSubtitle]);

  const validate = (): boolean => {
    const newErrors: { headline?: string; subtitle?: string } = {};

    if (!headline.trim()) {
      newErrors.headline = 'Headline is required';
    } else if (headline.length > MAX_HEADLINE_LENGTH) {
      newErrors.headline = `Maximum ${MAX_HEADLINE_LENGTH} characters`;
    }

    if (!subtitle.trim()) {
      newErrors.subtitle = 'Subtitle is required';
    } else if (subtitle.length > MAX_SUBTITLE_LENGTH) {
      newErrors.subtitle = `Maximum ${MAX_SUBTITLE_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setText(headline.trim(), subtitle.trim().toUpperCase());
      nextStep();
    }
  };

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeadline(value);
    if (errors.headline) {
      setErrors((prev) => ({ ...prev, headline: undefined }));
    }
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubtitle(value);
    if (errors.subtitle) {
      setErrors((prev) => ({ ...prev, subtitle: undefined }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Add Your Text
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your headline and subtitle for the final creative
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview with text overlay */}
        <div className="order-2 md:order-1">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            Preview
          </h3>
          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-lg">
            {heroImage && (
              <Image
                src={heroImage}
                alt="Hero preview"
                fill
                className="object-cover"
              />
            )}

            {/* Text overlay preview */}
            <div className="absolute inset-0 flex flex-col justify-center p-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 max-w-[85%]">
                <h3
                  className="text-white font-bold text-xl md:text-2xl leading-tight drop-shadow-lg"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {headline || 'Your headline here'}
                </h3>
                <p
                  className="text-white/90 text-xs md:text-sm font-medium uppercase tracking-widest mt-2 drop-shadow-md"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {subtitle || 'YOUR SUBTITLE HERE'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="order-1 md:order-2">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            Text Content
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Headline Input */}
            <div>
              <label
                htmlFor="headline"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Headline
              </label>
              <input
                type="text"
                id="headline"
                value={headline}
                onChange={handleHeadlineChange}
                placeholder="New colors just dropped"
                maxLength={MAX_HEADLINE_LENGTH}
                className={`
                  w-full px-4 py-3 rounded-lg border
                  bg-white dark:bg-zinc-800
                  text-zinc-900 dark:text-white
                  placeholder-zinc-400 dark:placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-zinc-500
                  ${
                    errors.headline
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }
                `}
              />
              <div className="flex justify-between mt-1">
                {errors.headline ? (
                  <span className="text-xs text-red-500">{errors.headline}</span>
                ) : (
                  <span className="text-xs text-zinc-400">
                    Catchy phrase or announcement
                  </span>
                )}
                <span
                  className={`text-xs ${
                    headline.length > MAX_HEADLINE_LENGTH
                      ? 'text-red-500'
                      : 'text-zinc-400'
                  }`}
                >
                  {headline.length}/{MAX_HEADLINE_LENGTH}
                </span>
              </div>
            </div>

            {/* Subtitle Input */}
            <div>
              <label
                htmlFor="subtitle"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Subtitle (Product Name)
              </label>
              <input
                type="text"
                id="subtitle"
                value={subtitle}
                onChange={handleSubtitleChange}
                placeholder="THE ULTRA SOFT HOODIE"
                maxLength={MAX_SUBTITLE_LENGTH}
                className={`
                  w-full px-4 py-3 rounded-lg border
                  bg-white dark:bg-zinc-800
                  text-zinc-900 dark:text-white
                  placeholder-zinc-400 dark:placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-zinc-500
                  ${
                    errors.subtitle
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }
                `}
              />
              <div className="flex justify-between mt-1">
                {errors.subtitle ? (
                  <span className="text-xs text-red-500">{errors.subtitle}</span>
                ) : (
                  <span className="text-xs text-zinc-400">
                    Will be displayed in uppercase
                  </span>
                )}
                <span
                  className={`text-xs ${
                    subtitle.length > MAX_SUBTITLE_LENGTH
                      ? 'text-red-500'
                      : 'text-zinc-400'
                  }`}
                >
                  {subtitle.length}/{MAX_SUBTITLE_LENGTH}
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Suggestions
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'New colors just dropped',
                  'Limited edition',
                  'Back in stock',
                  'Best seller',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setHeadline(suggestion)}
                    className="px-3 py-1 text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={prevStep} fullWidth>
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button type="submit" fullWidth>
                Generate Final Creative
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default TextInputForm;
