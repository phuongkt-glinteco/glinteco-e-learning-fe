'use client';

import type { CreateExerciseFormInput } from '@/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';

interface FillBlankQuestionBuilderProps {
  questions: CreateExerciseFormInput['questionsData'];
  onChange: (questions: CreateExerciseFormInput['questionsData']) => void;
  error?: string;
  t: (key: string) => string;
}

const createBlankQuestion = (index: number): CreateExerciseFormInput['questionsData'][number] => ({
  id: `blank-${Date.now()}-${index}`,
  prompt: '',
  options: [],
  correctAnswer: '',
  explanation: '',
});

export default function FillBlankQuestionBuilder({
  questions,
  onChange,
  error,
  t,
}: FillBlankQuestionBuilderProps) {
  const safeQuestions = questions.length > 0 ? questions : [createBlankQuestion(0)];

  function updateQuestion(index: number, nextQuestion: CreateExerciseFormInput['questionsData'][number]) {
    const nextQuestions = safeQuestions.map((question, questionIndex) => (
      questionIndex === index ? nextQuestion : question
    ));
    onChange(nextQuestions);
  }

  function addQuestion() {
    onChange([...safeQuestions, createBlankQuestion(safeQuestions.length)]);
  }

  function removeQuestion(index: number) {
    const nextQuestions = safeQuestions.filter((_, questionIndex) => questionIndex !== index);
    onChange(nextQuestions);
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">short_text</span>
          <CardTitle className="text-lg">{t('fillBlankBuilderTitle')}</CardTitle>
        </div>
        <Button type="button" variant="outline" onClick={addQuestion}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t('addQuestion')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeQuestions.map((question, questionIndex) => (
          <div key={question.id} className="rounded-lg border border-outline-variant p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="label-lg text-on-surface">
                {t('questionLabel')} {questionIndex + 1}
              </h3>
              {safeQuestions.length > 1 && (
                <Button type="button" variant="ghost" onClick={() => removeQuestion(questionIndex)}>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {t('removeQuestion')}
                </Button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor={`blank-prompt-${question.id}`} className="mb-2 block">{t('blankPromptLabel')}</Label>
                <textarea
                  id={`blank-prompt-${question.id}`}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  value={question.prompt}
                  onChange={(event) => updateQuestion(questionIndex, { ...question, prompt: event.target.value })}
                  placeholder={t('blankPromptPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor={`blank-answer-${question.id}`} className="mb-2 block">{t('blankAnswerLabel')}</Label>
                <Input
                  id={`blank-answer-${question.id}`}
                  value={question.correctAnswer}
                  onChange={(event) => updateQuestion(questionIndex, { ...question, correctAnswer: event.target.value })}
                  placeholder={t('blankAnswerPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor={`blank-explanation-${question.id}`} className="mb-2 block">{t('explanationLabel')}</Label>
                <textarea
                  id={`blank-explanation-${question.id}`}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  value={question.explanation}
                  onChange={(event) => updateQuestion(questionIndex, { ...question, explanation: event.target.value })}
                  placeholder={t('explanationPlaceholder')}
                />
              </div>
            </div>
          </div>
        ))}

        {error && (
          <p className="text-destructive text-[12px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
            {t(error)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
