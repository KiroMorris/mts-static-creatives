'use client';

import React, { useState, useEffect } from 'react';

interface SetupModalProps {
  onComplete: () => void;
}

export function SetupModal({ onComplete }: SetupModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('Invalid API key. It should start with "AIza"');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key');
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">MTS</span>
            </div>
            <h1 className="text-2xl font-bold text-white">MTS Static Creative Studio</h1>
          </div>
          <p className="text-white/80">Let&apos;s get you set up in 3 easy steps</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {saved ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">API Key Saved!</h2>
              <p className="text-zinc-400 mb-6">Click the button below to restart and start creating.</p>
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Restart App
              </button>
            </div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <button
                      onClick={() => setCurrentStep(step)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep === step
                          ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white scale-110'
                          : currentStep > step
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {currentStep > step ? '✓' : step}
                    </button>
                    {step < 3 && (
                      <div className={`w-12 h-1 rounded ${currentStep > step ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Get a Card */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Step 1: Get a Payment Card</h2>
                  <p className="text-zinc-400">
                    Google requires a payment card to use the Gemini API (don&apos;t worry, there&apos;s a free tier!).
                  </p>

                  <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
                    <p className="text-zinc-300 mb-4">
                      <strong>Don&apos;t have a card?</strong> Get a virtual Mastercard instantly:
                    </p>
                    <a
                      href="https://app.card-y.com/register?code=JAGB-JSUL-VAMP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Get Virtual Mastercard
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <p className="text-zinc-500 text-sm">
                    Already have a card? Click Next to continue.
                  </p>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Set Up Billing */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Step 2: Set Up Google Cloud Billing</h2>
                  <p className="text-zinc-400">
                    Add your card to Google Cloud to enable the API.
                  </p>

                  <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <p className="text-zinc-300">
                        Go to{' '}
                        <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                          console.cloud.google.com
                        </a>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <p className="text-zinc-300">Sign in with your Google account</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <p className="text-zinc-300">Click the menu (☰) → <strong>Billing</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <p className="text-zinc-300">Click &quot;Link a billing account&quot; and add your card</p>
                    </div>
                  </div>

                  <a
                    href="https://console.cloud.google.com/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Open Google Cloud Billing
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2.5 text-zinc-400 font-semibold hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Get API Key */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Step 3: Get Your API Key</h2>
                  <p className="text-zinc-400">
                    Create your free Gemini API key and paste it below.
                  </p>

                  <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <p className="text-zinc-300">
                        Go to{' '}
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                          aistudio.google.com/apikey
                        </a>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <p className="text-zinc-300">Click <strong>&quot;Create API Key&quot;</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <p className="text-zinc-300">Select <strong>&quot;Create API key in new project&quot;</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <p className="text-zinc-300">Copy the key (starts with <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-emerald-400">AIza...</code>)</p>
                    </div>
                  </div>

                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Get API Key from Google AI Studio
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* API Key Input */}
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Paste your API Key here:
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setError('');
                      }}
                      placeholder="AIza..."
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
                    />
                    {error && (
                      <p className="mt-2 text-red-400 text-sm">{error}</p>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 text-zinc-400 font-semibold hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !apiKey.trim()}
                      className="px-8 py-2.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save & Continue'}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Info */}
              <div className="mt-6 pt-6 border-t border-zinc-700">
                <p className="text-center text-zinc-500 text-sm">
                  Free tier: ~500 image generations per day • No charges for free tier usage
                </p>
              </div>
            </>
          )}
        </div>

        {/* Branding */}
        <div className="px-6 py-4 bg-zinc-800/50 border-t border-zinc-700">
          <p className="text-center text-zinc-500 text-sm">
            Built by <a href="https://myturtle.store" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Kiro Morris</a> • <a href="https://instagram.com/kiro.morris" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">@kiro.morris</a>
          </p>
        </div>
      </div>
    </div>
  );
}
