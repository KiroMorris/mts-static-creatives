'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'gradient-pink' | 'gradient-cyan' | 'neon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
  secondary:
    'bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-800 hover:from-white hover:to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-600 border border-zinc-200 dark:border-zinc-600',
  outline:
    'border-2 border-violet-400/50 text-violet-600 hover:bg-violet-50 hover:border-violet-500 dark:border-violet-500/50 dark:text-violet-400 dark:hover:bg-violet-500/10 dark:hover:border-violet-400',
  ghost:
    'text-zinc-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 hover:text-violet-700 dark:text-zinc-400 dark:hover:from-violet-500/10 dark:hover:to-pink-500/10 dark:hover:text-violet-300',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
  gradient:
    'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 bg-[length:200%_100%] hover:bg-right transition-all duration-300',
  'gradient-pink':
    'bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 text-white hover:from-pink-400 hover:via-rose-400 hover:to-violet-500 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 bg-[length:200%_100%] hover:bg-right transition-all duration-300',
  'gradient-cyan':
    'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white hover:from-cyan-400 hover:via-teal-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 bg-[length:200%_100%] hover:bg-right transition-all duration-300',
  neon:
    'bg-transparent border-2 border-violet-500 text-violet-500 hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.5),inset_0_0_20px_rgba(139,92,246,0.1)] dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-400/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
  xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glow = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const glowClasses = glow
    ? 'hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
    : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-semibold
        transition-all duration-300 ease-out
        transform hover:-translate-y-0.5 active:translate-y-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glowClasses}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5">{leftIcon}</span>}
          <span className="relative">{children}</span>
          {rightIcon && <span className="flex-shrink-0 transition-transform group-hover:translate-x-0.5">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        fill="url(#spinner-gradient)"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Button;
