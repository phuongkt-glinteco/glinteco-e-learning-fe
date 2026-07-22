'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Textarea } from '@/components/ui/default/textarea';

interface ExerciseHintProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseHint({ register, t }: ExerciseHintProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <span className="material-symbols-outlined text-primary">lightbulb</span>
        <CardTitle className="text-lg">{t('hintTitle')}</CardTitle>
        <span className="text-sm text-muted-foreground ml-1">{t('hintOptional')}</span>
      </CardHeader>
      <CardContent>
        <Textarea
          className="resize-none"
          rows={3}
          placeholder={t('hintPlaceholder')}
          {...register('hint')}
        />
      </CardContent>
    </Card>
  );
}
