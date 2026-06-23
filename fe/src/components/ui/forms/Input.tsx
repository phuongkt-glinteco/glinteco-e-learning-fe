'use client';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block label-md text-on-surface mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full border border-outline-variant rounded-lg px-4 py-2.5 body-base font-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
