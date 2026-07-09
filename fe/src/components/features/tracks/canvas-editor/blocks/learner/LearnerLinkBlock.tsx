'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

export function LearnerLinkBlock({ block }: { block: CanvasBlock }) {
  const altText = block.props.altText || block.content || block.props.url || 'Liên kết';
  const url = block.props.url || '#';
  const linkId = block.props.linkId;

  return (
    <a
      href={url}
      id={linkId}
      target={url.startsWith('http') ? '_blank' : undefined}
      rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-1 font-semibold text-primary underline decoration-primary/40 hover:decoration-primary hover:opacity-85 transition-all"
    >
      <span>{altText}</span>
      <Icon icon="lucide:external-link" className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
