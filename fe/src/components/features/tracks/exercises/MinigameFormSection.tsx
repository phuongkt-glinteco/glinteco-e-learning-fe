'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';
import { Label } from '@/components/ui/default/label';

const MINIGAME_TYPES = [
  { value: 'puzzle', icon: '🧩', labelKey: 'puzzle' },
  { value: 'matching', icon: '🔗', labelKey: 'matching' },
  { value: 'quiz_battle', icon: '⚔️', labelKey: 'quizBattle' },
  { value: 'code_order', icon: '📋', labelKey: 'codeOrder' },
] as const;

interface MinigameFormSectionProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  errors: FieldErrors<CreateExerciseFormInput>;
  setValue: UseFormSetValue<CreateExerciseFormInput>;
  getValues: UseFormGetValues<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function MinigameFormSection({
  register,
  errors,
  setValue,
  getValues,
  t,
}: MinigameFormSectionProps) {
  const tu = useTranslations('MinigameForm');
  const [gameType, setGameType] = useState('puzzle');

  return (
    <>
      {/* Game Configuration Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-primary/5">
          <span className="text-lg">🎮</span>
          <h3 className="font-semibold text-foreground text-sm">
            {tu('configTitle')}
          </h3>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <Label className="mb-2 block text-xs font-medium text-foreground">
              {tu('gameTypeLabel')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {MINIGAME_TYPES.map((game) => (
                <button
                  key={game.value}
                  type="button"
                  onClick={() => setGameType(game.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    gameType === game.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-surface-container-low text-secondary hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <span className="text-base">{game.icon}</span>
                  <span>{tu(game.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="timeLimit" className="mb-1.5 block text-xs font-medium text-foreground">
                {tu('timeLimitLabel')}
              </Label>
              <input
                id="timeLimit"
                type="number"
                min={0}
                defaultValue={5}
                className="w-full h-9 rounded-lg border border-border bg-surface-container-lowest px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{tu('timeLimitHint')}</p>
            </div>
            <div>
              <Label htmlFor="maxAttempts" className="mb-1.5 block text-xs font-medium text-foreground">
                {tu('maxAttemptsLabel')}
              </Label>
              <input
                id="maxAttempts"
                type="number"
                min={0}
                defaultValue={3}
                className="w-full h-9 rounded-lg border border-border bg-surface-container-lowest px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="3"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{tu('maxAttemptsHint')}</p>
            </div>
            <div>
              <Label htmlFor="scoringMethod" className="mb-1.5 block text-xs font-medium text-foreground">
                {tu('scoringLabel')}
              </Label>
              <select
                id="scoringMethod"
                defaultValue="points"
                className="w-full h-9 rounded-lg border border-border bg-surface-container-lowest px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="points">{tu('scoringPoints')}</option>
                <option value="star">{tu('scoringStar')}</option>
                <option value="time">{tu('scoringTime')}</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">{tu('scoringHint')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-primary/5">
          <span className="text-lg">📝</span>
          <h3 className="font-semibold text-foreground text-sm">
            {tu('contentTitle')}
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="brief" className="mb-1.5 block text-xs font-medium text-foreground">
              {t('briefLabel')}
            </Label>
            <textarea
              id="brief"
              rows={2}
              className={`w-full rounded-lg border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none transition-colors ${
                errors.brief ? 'border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
              placeholder={t('briefPlaceholder')}
              {...register('brief')}
            />
            {errors.brief && (
              <p className="text-destructive text-[11px] mt-1">{t(errors.brief.message as string)}</p>
            )}
          </div>

          <div>
            <Label htmlFor="overview" className="mb-1.5 block text-xs font-medium text-foreground">
              {tu('instructionsLabel')}
            </Label>
            <textarea
              id="overview"
              rows={4}
              className={`w-full rounded-lg border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none transition-colors ${
                errors.overview ? 'border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
              placeholder={tu('instructionsPlaceholder')}
              {...register('overview')}
            />
            {errors.overview && (
              <p className="text-destructive text-[11px] mt-1">{t(errors.overview.message as string)}</p>
            )}
          </div>

          <div>
            <Label htmlFor="hint" className="mb-1.5 block text-xs font-medium text-foreground">
              {tu('rulesLabel')}
            </Label>
            <textarea
              id="hint"
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={tu('rulesPlaceholder')}
              {...register('hint')}
            />
            <p className="text-[10px] text-muted-foreground mt-1">{tu('rulesHint')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
