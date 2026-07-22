'use client';

import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/default/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  delay = 500,
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [localValue, value, delay, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(localValue);
    }
    props.onKeyDown?.(e);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
      <Input
        className={cn("w-full pl-10 py-6 text-base rounded-xl", className)}
        {...props}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
