'use client';

import * as React from 'react';
import { Input } from '@/components/ui/default/input';
import { cn } from '@/lib/utils';

export interface DurationValue {
  value?: number;
  unit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

interface DurationPickerProps {
  value: DurationValue;
  onChange: (value: DurationValue) => void;
  className?: string;
}

export function DurationPicker({ value, onChange, className }: DurationPickerProps) {
  const { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } = require('@/components/ui/default/select');

  const handleNumberChange = (val: string) => {
    if (val === '') {
      onChange({ ...value, value: undefined });
      return;
    }
    const num = parseInt(val, 10);
    onChange({ ...value, value: isNaN(num) ? undefined : num });
  };

  const handleUnitChange = (unit: string) => {
    onChange({ ...value, unit: unit as DurationValue['unit'] });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        type="number"
        min="0"
        value={value.value ?? ''}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="h-10 w-24 text-center"
        placeholder="0"
      />
      <Select value={value.unit || 'minutes'} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-[120px] h-10">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minutes">Minutes</SelectItem>
          <SelectItem value="hours">Hours</SelectItem>
          <SelectItem value="days">Days</SelectItem>
          <SelectItem value="weeks">Weeks</SelectItem>
          <SelectItem value="months">Months</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
