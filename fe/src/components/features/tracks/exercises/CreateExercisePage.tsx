'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { exercisesControllerCreate, exercisesControllerFindOne, exercisesControllerUpdate } from '@/services/api-client';
import type { DocumentResponseDto, ExerciseDetailDto } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import { createExerciseFormSchema, type CreateExerciseFormInput } from '@/schemas';
import ExerciseBasicInfo from './ExerciseBasicInfo';
import ExerciseDescription from './ExerciseDescription';
import ExerciseListEditor from './ExerciseListEditor';
import ExerciseHint from './ExerciseHint';
import ResourceDocumentPickerDialog from './ResourceDocumentPickerDialog';

export default function CreateExercisePage({ trackId, lessonId, exerciseId }: { trackId: string; lessonId?: string; exerciseId?: string }) {
  const t = useTranslations('CreateExercisePage');
  const router = useRouter();
  const isEditMode = !!exerciseId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resourceDocIds, setResourceDocIds] = useState<string[]>([]);
  const [resourceDocs, setResourceDocs] = useState<DocumentResponseDto[]>([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    reset,
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

  useEffect(() => {
    if (!exerciseId) return;
    setLoading(true);
    exercisesControllerFindOne({ path: { id: exerciseId }, throwOnError: true })
      .then((res) => {
        const data = res.data as unknown as ExerciseDetailDto;
        const objectives = Array.isArray(data.objectives) ? data.objectives : [];
        const steps = Array.isArray(data.steps) ? data.steps : [];
        const docs = data.resources ?? [];
        const docIds = docs.map((d) => d.id);
        setResourceDocIds(docIds);
        setResourceDocs(docs);
        reset({
          title: data.title,
          tag: data.tag,
          difficulty: data.difficulty,
          estimatedTime: data.estimatedTime,
          xp: String(data.xp),
          brief: data.brief,
          overview: data.overview,
          objectives,
          steps,
          resourceDocIds: docIds,
          hint: data.hint ?? '',
        });
      })
      .catch((e) => {
        if (e instanceof UiShowError) {
          setServerError(e.errorCode);
        } else {
          setServerError('UNKNOWN_ERROR');
        }
      })
      .finally(() => setLoading(false));
  }, [exerciseId, reset]);

  async function onSubmit(data: CreateExerciseFormInput) {
    setSaving(true);
    setServerError(null);
    try {
      const body = {
        title: data.title.trim(),
        trackId,
        lessonId,
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
      };
      if (isEditMode) {
        await exercisesControllerUpdate({ path: { id: exerciseId }, body, throwOnError: true });
      } else {
        await exercisesControllerCreate({ body, throwOnError: true });
      }
      router.push(lessonId ? `/admin/tracks/${trackId}/lessons/${lessonId}` : `/admin/tracks/${trackId}`);
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
        <span className="text-primary">{isEditMode ? t('breadcrumbEdit') : t('breadcrumbCreate')}</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-8">{isEditMode ? t('editTitle') : t('title')}</h1>
      {lessonId && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-container/30 px-4 py-3 text-primary font-label-sm">
          <span className="material-symbols-outlined text-[18px]">link</span>
          {t('linkedToLesson')}
        </div>
      )}

      {serverError && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px]">error</span>
          <p className="text-error text-body-sm font-medium">{t(serverError)}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
        </div>
      ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-lg">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-8 space-y-lg">
                <ExerciseBasicInfo register={register} errors={errors} setValue={setValue} getValues={getValues} t={t} />

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
              control={control}
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
              control={control}
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
                          <span className="text-label-sm text-on-surface flex-1 truncate">
                            {resourceDocs.find((doc) => doc.id === id)?.title ?? t('selectedDocument')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setResourceDocIds((prev) => prev.filter((i) => i !== id));
                              setResourceDocs((prev) => prev.filter((doc) => doc.id !== id));
                            }}
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
                  {saving ? t('saving') : isEditMode ? t('update') : t('submit')}
                </button>
              </div>
            </footer>
          </form>
      )}

      <ResourceDocumentPickerDialog
        open={showResourcePicker}
        selectedIds={resourceDocIds}
        onClose={() => setShowResourcePicker(false)}
        onConfirm={(ids, docs) => {
          setResourceDocIds(ids);
          setResourceDocs(docs ?? []);
        }}
      />
    </div>
  );
}
