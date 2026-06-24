'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { postExercises } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import { createExerciseFormSchema, type CreateExerciseFormInput } from '@/schemas';
import ExerciseBasicInfo from './ExerciseBasicInfo';
import ExerciseDescription from './ExerciseDescription';
import ExerciseListEditor from './ExerciseListEditor';
import ExerciseHint from './ExerciseHint';
import ResourceDocumentPickerDialog from './ResourceDocumentPickerDialog';

export default function CreateExercisePage({ trackId }: { trackId: string }) {
  const t = useTranslations('CreateExercisePage');
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resourceDocIds, setResourceDocIds] = useState<string[]>([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<CreateExerciseFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createExerciseFormSchema) as any,
    defaultValues: {
      title: '',
      tag: '',
      difficulty: '' as CreateExerciseFormInput['difficulty'],
      estimatedTime: '',
      xp: '',
      brief: '',
      overview: '',
      objectives: [],
      steps: [],
      resourceDocIds: [],
      hint: '',
    },
  });

  async function onSubmit(data: CreateExerciseFormInput) {
    setSaving(true);
    setServerError(null);
    try {
      await postExercises({
        body: {
          title: data.title.trim(),
          trackId,
          tag: data.tag.trim(),
          difficulty: data.difficulty,
          estimatedTime: data.estimatedTime.trim(),
          xp: parseInt(data.xp, 10),
          brief: data.brief.trim(),
          overview: data.overview.trim(),
          objectives: data.objectives.filter((o) => o.trim()),
          steps: data.steps.filter((s) => s.trim()),
          resourceDocIds: resourceDocIds.length > 0 ? resourceDocIds : undefined,
          hint: data.hint?.trim() || undefined,
        },
        throwOnError: true,
      });
      router.push(`/admin/tracks/${trackId}`);
    } catch (e) {
      if (e instanceof UiShowError) {
        setServerError(e.errorCode);
      } else {
        setServerError('UNKNOWN_ERROR');
      }
      setSaving(false);
    }
  }

  return (
    <div className="px-gutter py-6 max-w-[1200px] mx-auto w-full pb-32">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-outline font-label-sm mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin/tracks')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {t('breadcrumbTracks')}
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button
          type="button"
          onClick={() => router.push(`/admin/tracks/${trackId}`)}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {t('breadcrumbDetail')}
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary">{t('breadcrumbCreate')}</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-8">{t('title')}</h1>

      {serverError && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px]">error</span>
          <p className="text-error text-body-sm font-medium">{t(serverError)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-lg">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <ExerciseBasicInfo register={register} errors={errors} t={t} />

            <ExerciseDescription register={register} errors={errors} t={t} />

            <ExerciseListEditor
              fieldName="objectives"
              label={t('objectivesTitle')}
              icon="flag"
              placeholder={t('objectivesPlaceholder')}
              emptyText={t('objectivesEmpty')}
              addLabel={t('objectivesAdd')}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              t={t}
            />

            <ExerciseListEditor
              fieldName="steps"
              label={t('stepsTitle')}
              icon="format_list_numbered"
              placeholder={t('stepsPlaceholder')}
              emptyText={t('stepsEmpty')}
              addLabel={t('stepsAdd')}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              t={t}
            />
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-lg">
            {/* Resource Documents */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder</span>
                  <h3 className="font-headline-sm text-on-surface">{t('resourcesTitle')}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResourcePicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 text-primary font-label-sm rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {t('resourcesAdd')}
                </button>
              </div>

              {resourceDocIds.length === 0 ? (
                <p className="text-label-sm text-outline">{t('resourcesEmpty')}</p>
              ) : (
                <div className="space-y-2">
                  {resourceDocIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                      <span className="text-label-sm text-on-surface flex-1 truncate">{id}</span>
                      <button
                        type="button"
                        onClick={() => setResourceDocIds((prev) => prev.filter((i) => i !== id))}
                        className="material-symbols-outlined text-[16px] text-outline hover:text-error cursor-pointer"
                      >
                        close
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <ExerciseHint register={register} t={t} />
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 z-40 bg-surface-container-lowest border-t border-outline-variant px-gutter py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-outline-variant rounded-lg font-label-md text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-95 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {saving ? t('saving') : t('submit')}
            </button>
          </div>
        </footer>
      </form>

      <ResourceDocumentPickerDialog
        open={showResourcePicker}
        selectedIds={resourceDocIds}
        onClose={() => setShowResourcePicker(false)}
        onConfirm={(ids) => setResourceDocIds(ids)}
      />
    </div>
  );
}
