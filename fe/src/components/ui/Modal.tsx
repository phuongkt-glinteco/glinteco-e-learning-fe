'use client';

import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 520 }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent 
        style={{ maxWidth: width }} 
        className="p-0 overflow-hidden flex flex-col max-h-[90vh] bg-surface gap-0"
      >
        <DialogHeader className="px-6 py-4 border-b border-border m-0">
          <DialogTitle className="text-[18px] font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
