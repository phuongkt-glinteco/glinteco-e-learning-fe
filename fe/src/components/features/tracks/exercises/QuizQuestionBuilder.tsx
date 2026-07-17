'use client';

import type { CreateExerciseFormInput } from '@/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';

interface QuizQuestionBuilderProps {
  questions: CreateExerciseFormInput['questionsData'];
  onChange: (questions: CreateExerciseFormInput['questionsData']) => void;
  error?: string;
  t: (key: string) => string;
}

function normalizeQuizOptions(options: string[] | undefined) {
  const safeOptions = Array.isArray(options) ? [...options] : [];
  while (safeOptions.length < 4) {
    safeOptions.push('');
  }
  return safeOptions.slice(0, 4);
}

const createQuizQuestion = (index: number): CreateExerciseFormInput['questionsData'][number] => ({
  id: `quiz-${Date.now()}-${index}`,
  prompt: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
});

export default function QuizQuestionBuilder({
  questions,
  onChange,
  error,
  t,
}: QuizQuestionBuilderProps) {
  const safeQuestions = questions.length > 0 ? questions : [createQuizQuestion(0)];

  function updateQuestion(index: number, nextQuestion: CreateExerciseFormInput['questionsData'][number]) {
    const nextQuestions = safeQuestions.map((question, questionIndex) => (
      questionIndex === index ? nextQuestion : question
    ));
    onChange(nextQuestions);
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const question = safeQuestions[questionIndex];
    const nextOptions = normalizeQuizOptions(question.options);
    nextOptions[optionIndex] = value;
    const trimmedCorrectAnswer = question.correctAnswer.trim();
    updateQuestion(questionIndex, {
      ...question,
      options: nextOptions,
      correctAnswer: trimmedCorrectAnswer && trimmedCorrectAnswer === (question.options?.[optionIndex] ?? '')
        ? value
        : question.correctAnswer,
    });
  }

  function addQuestion() {
    onChange([...safeQuestions, createQuizQuestion(safeQuestions.length)]);
  }

  function removeQuestion(index: number) {
    const nextQuestions = safeQuestions.filter((_, questionIndex) => questionIndex !== index);
    onChange(nextQuestions);
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">quiz</span>
          <CardTitle className="text-lg">{t('quizBuilderTitle')}</CardTitle>
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

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor={`quiz-prompt-${question.id}`} className="mb-2 block">{t('questionPromptLabel')}</Label>
                <textarea
                  id={`quiz-prompt-${question.id}`}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  value={question.prompt}
                  onChange={(event) => updateQuestion(questionIndex, { ...question, prompt: event.target.value })}
                  placeholder={t('questionPromptPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {normalizeQuizOptions(question.options).map((option, optionIndex) => (
                  <div key={`${question.id}-option-${optionIndex}`}>
                    <Label htmlFor={`${question.id}-option-${optionIndex}`} className="mb-2 block">
                      {t('optionLabel')} {String.fromCharCode(65 + optionIndex)}
                    </Label>
                    <Input
                      id={`${question.id}-option-${optionIndex}`}
                      value={option}
                      onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                      placeholder={t('optionPlaceholder')}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor={`quiz-answer-${question.id}`} className="mb-2 block">{t('correctAnswerLabel')}</Label>
                <select
                  id={`quiz-answer-${question.id}`}
                  value={question.correctAnswer}
                  onChange={(event) => updateQuestion(questionIndex, { ...question, correctAnswer: event.target.value })}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">{t('correctAnswerPlaceholder')}</option>
                  {normalizeQuizOptions(question.options)
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                </select>
              </div>

              <div>
                <Label htmlFor={`quiz-explanation-${question.id}`} className="mb-2 block">{t('explanationLabel')}</Label>
                <textarea
                  id={`quiz-explanation-${question.id}`}
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
