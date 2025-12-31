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
        <h2 className="text-2xl font-bold mb-2">
          <span className="gradient-text">Add Your Text</span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your headline and subtitle for the final creative
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview with text overlay */}
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse"></div>
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Live Preview
            </h3>
          </div>
          <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-2xl shadow-violet-500/10 ring-1 ring-violet-500/10">
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
          <div className="flex items-center gap-2 mb-4">
            <TextIcon className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Text Content
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-2xl p-6">
            {/* Headline Input */}
            <div>
              <label
                htmlFor="headline"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >
                <HeadlineIcon className="w-4 h-4 text-violet-500" />
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
                  w-full px-4 py-3 rounded-xl text-lg font-medium
                  premium-input
                  ${
                    errors.headline
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }
                `}
              />
              <div className="flex justify-between mt-2">
                {errors.headline ? (
                  <span className="text-xs text-red-500 font-medium">{errors.headline}</span>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Catchy phrase or announcement
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    headline.length > MAX_HEADLINE_LENGTH - 10
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
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
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >
                <SubtitleIcon className="w-4 h-4 text-pink-500" />
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
                  w-full px-4 py-3 rounded-xl uppercase tracking-widest font-medium
                  premium-input
                  ${
                    errors.subtitle
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }
                `}
              />
              <div className="flex justify-between mt-2">
                {errors.subtitle ? (
                  <span className="text-xs text-red-500 font-medium">{errors.subtitle}</span>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Will be displayed in uppercase
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    subtitle.length > MAX_SUBTITLE_LENGTH - 10
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                  }`}
                >
                  {subtitle.length}/{MAX_SUBTITLE_LENGTH}
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gradient-to-br from-violet-50/50 to-pink-50/50 dark:from-violet-900/10 dark:to-pink-900/10 rounded-xl p-4 border border-violet-200/30 dark:border-violet-500/10">
              <div className="flex items-center gap-2 mb-3">
                <SparkleIcon className="w-4 h-4 text-violet-500" />
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Quick Suggestions
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'New colors just dropped', icon: '🎨' },
                  { text: 'Limited edition', icon: '✨' },
                  { text: 'Back in stock', icon: '🔥' },
                  { text: 'Best seller', icon: '⭐' },
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => setHeadline(suggestion.text)}
                    className="premium-chip px-4 py-2 text-sm cursor-pointer"
                  >
                    <span className="mr-1.5">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={prevStep} fullWidth className="group">
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <Button type="submit" fullWidth className="btn-gradient text-white border-0 group">
                <SparkleIcon className="w-4 h-4 mr-2 animate-sparkle" />
                Generate Final Creative
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function HeadlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function SubtitleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
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

export default TextInputForm;
