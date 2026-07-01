'use client';

import { useWatch } from 'react-hook-form';
import type { FieldErrors, UseFormSetValue, Control } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';

interface ExerciseListEditorProps {
  fieldName: keyof CreateExerciseFormInput;
  label: string;
  icon: string;
  placeholder: string;
  emptyText: string;
  addLabel: string;
  errors: FieldErrors<CreateExerciseFormInput>;
  setValue: UseFormSetValue<CreateExerciseFormInput>;
  control: Control<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseListEditor({
  fieldName,
  label,
  icon,
  placeholder,
  emptyText,
  addLabel,
  errors,
  setValue,
  control,
  t,
}: ExerciseListEditorProps) {
  const items: string[] = (useWatch({ control, name: fieldName }) as string[]) ?? [];

  function addItem() {
    setValue(fieldName, [...items, ''], { shouldValidate: false });
  }

  function updateItem(index: number, val: string) {
    const next = [...items];
    next[index] = val;
    setValue(fieldName, next, { shouldDirty: true });
  }

  function removeItem(index: number) {
    setValue(fieldName, items.filter((_, i) => i !== index), { shouldDirty: true });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <CardTitle className="text-lg">{label}</CardTitle>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="text-primary border-primary/20 hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-[16px] mr-1">add</span>
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div
            onClick={addItem}
            className="border-2 border-dashed border-outline-variant rounded-lg py-8 text-center text-muted-foreground font-label-sm hover:border-primary/40 hover:text-primary/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[32px] block mb-1">playlist_add</span>
            {emptyText}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-sm text-secondary shrink-0">
                  {i + 1}
                </span>
                <Input
                  className={errors[fieldName] ? 'border-destructive focus-visible:ring-destructive flex-1' : 'flex-1'}
                  placeholder={placeholder}
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                  className="opacity-0 group-hover:opacity-100 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {errors[fieldName] && (
          <p className="text-destructive text-[12px] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {t((errors[fieldName] as { message?: string })?.message ?? '')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
