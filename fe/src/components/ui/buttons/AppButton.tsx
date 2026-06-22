'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '@iconify/react';

const variants = {
  primary:
    'bg-primary text-on-primary shadow-sm hover:opacity-95 active:scale-95',
  secondary:
    'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
  outline:
    'border border-outline-variant text-secondary hover:bg-surface-variant',
  outlinePrimary:
    'border border-primary/20 text-primary hover:bg-primary/10',
  ghost: 'text-secondary hover:bg-surface-variant',
  text: 'text-primary hover:underline',
  destructive: 'text-secondary hover:text-error',
} as const;

type ButtonVariant = keyof typeof variants;

const variantSizes: Record<ButtonVariant, string> = {
  primary: 'px-8 py-2',
  secondary: 'w-full py-2.5',
  outline: 'px-6 py-2',
  outlinePrimary: 'px-6 py-2',
  ghost: 'p-2',
  text: '',
  destructive: '',
};

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  children?: ReactNode;
}

export function AppButton({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: AppButtonProps) {
  const base =
    'rounded-lg font-label-md text-label-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';
  const size = variantSizes[variant];

  return (
    <button
      className={`${base} ${size} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon icon={icon} className="text-[20px]" />}
      {children}
    </button>
  );
}
