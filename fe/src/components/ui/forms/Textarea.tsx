'use client';

import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className = '', ...props }: TextareaProps) {
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
      <textarea
        id={id}
        className={`w-full border border-outline-variant rounded-lg px-4 py-2.5 body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
