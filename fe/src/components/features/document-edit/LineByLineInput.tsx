'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';

interface LineByLineInputProps {
  label?: string;
  value?: string[];
  onChange?: (items: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
  emptyText?: string;
}

export function LineByLineInput({
  label,
  value = [],
  onChange,
  placeholder,
  addButtonText,
  emptyText,
}: LineByLineInputProps) {
  const t = useTranslations('DocumentEdit');

  const handleItemChange = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange?.(next);
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (pastedData.includes('\n')) {
      e.preventDefault();
      const lines = pastedData
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      
      const next = [...value];
      next.splice(index, 1, ...lines);
      onChange?.(next);
    }
  };

  const handleAddItem = () => {
    onChange?.([...value, '']);
  };

  const handleRemoveItem = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  return (
    <div className="space-y-sm">
      {label && (
        <Label className="text-sm font-semibold text-on-surface">
          {label}
        </Label>
      )}

      {value.length > 0 ? (
        <div className="space-y-xs">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-xs">
              <Input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onPaste={(e) => handlePaste(index, e)}
                placeholder={placeholder || t('itemPlaceholder')}
                className="flex-1 bg-surface-container-lowest"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-on-surface-variant hover:text-error p-2 rounded-md hover:bg-error-container/20 transition-colors flex-shrink-0"
                title={t('removeItem')}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant italic">
          {emptyText || t('emptyList')}
        </p>
      )}

      <div className="pt-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="flex items-center gap-xs text-primary border-primary/30 hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>{addButtonText || t('addItem')}</span>
        </Button>
      </div>
    </div>
  );
}
