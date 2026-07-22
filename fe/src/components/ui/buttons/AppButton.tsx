'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { cn } from '@/lib/utils';

const variantsMapping = {
  primary: { variant: 'default' as const, className: 'shadow-sm hover:opacity-95 active:scale-95 px-8 py-2' },
  secondary: { variant: 'outline' as const, className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 w-full py-2.5' },
  outline: { variant: 'outline' as const, className: 'border-outline-variant text-secondary hover:bg-surface-variant px-6 py-2' },
  outlinePrimary: { variant: 'outline' as const, className: 'border-primary/20 text-primary hover:bg-primary/10 px-6 py-2' },
  ghost: { variant: 'ghost' as const, className: 'text-secondary hover:bg-surface-variant p-2' },
  text: { variant: 'link' as const, className: 'text-primary hover:underline px-0 py-0 h-auto' },
  destructive: { variant: 'ghost' as const, className: 'text-secondary hover:text-error hover:bg-transparent px-0 py-0 h-auto' },
} as const;

export type AppButtonVariant = keyof typeof variantsMapping;

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
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
  const mapped = variantsMapping[variant];
  
  return (
    <Button
      variant={mapped.variant}
      className={cn('font-label-md text-label-md gap-2 rounded-lg transition-all', mapped.className, className)}
      {...props}
    >
      {icon && <Icon icon={icon} className="text-[20px]" />}
      {children}
    </Button>
  );
}
