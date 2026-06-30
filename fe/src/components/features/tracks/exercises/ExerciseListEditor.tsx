'use client';

import { useWatch } from 'react-hook-form';
import type { FieldErrors, UseFormSetValue, Control } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';

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
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <h3 className="font-headline-sm text-on-surface">{label}</h3>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 text-primary font-label-sm rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div
          onClick={addItem}
          className="border-2 border-dashed border-outline-variant rounded-lg py-8 text-center text-outline font-label-sm hover:border-primary/40 hover:text-primary/60 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[32px] block mb-1">playlist_add</span>
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <span className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-label-sm text-outline shrink-0">
                {i + 1}
              </span>
              <input
                className={`flex-1 border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
                  errors[fieldName] ? 'border-error' : 'border-outline-variant focus:border-primary'
                }`}
                placeholder={placeholder}
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-1.5 text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {errors[fieldName] && (
        <p className="text-error text-[12px] mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {t((errors[fieldName] as { message?: string })?.message ?? '')}
        </p>
      )}
    </section>
  );
}
