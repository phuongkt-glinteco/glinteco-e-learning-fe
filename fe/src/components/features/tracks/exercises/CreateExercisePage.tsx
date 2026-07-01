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
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import ResourceDocumentPickerDialog from './ResourceDocumentPickerDialog';

export default function CreateExercisePage({ trackId, lessonId, exerciseId }: { trackId: string; lessonId?: string; exerciseId?: string }) {
  const t = useTranslations('CreateExercisePage');
  const router = useRouter();
  const isEditMode = !!exerciseId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { pushNode, setTree, tree } = useBreadcrumbStore();
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

  useEffect(() => {
    if (tree.length === 0) {
      setTree([
        { label: t('breadcrumbTracks', { defaultValue: 'Tracks' }), href: '/admin/tracks' },
        { label: t('breadcrumbDetail', { defaultValue: 'Detail' }), href: `/admin/tracks/${trackId}` }
      ]);
    }
    pushNode({ label: isEditMode ? t('breadcrumbEdit', { defaultValue: 'Edit' }) : t('breadcrumbCreate', { defaultValue: 'Create' }), href: window.location.pathname });
  }, [isEditMode, trackId, t, setTree, pushNode, tree.length]);

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
      <div className="mb-4">
        <DynamicBreadcrumbs />
      </div>

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
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">folder</span>
                      <CardTitle className="text-lg">{t('resourcesTitle')}</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResourcePicker(true)}
                      className="text-primary border-primary/20 hover:bg-primary/5"
                    >
                      <span className="material-symbols-outlined text-[16px] mr-1">add</span>
                      {t('resourcesAdd')}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {resourceDocIds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('resourcesEmpty')}</p>
                    ) : (
                      <div className="space-y-2">
                        {resourceDocIds.map((id) => (
                          <div
                            key={id}
                            className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-border"
                          >
                            <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                            <span className="text-sm text-foreground flex-1 truncate">
                              {resourceDocs.find((doc) => doc.id === id)?.title ?? t('selectedDocument')}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setResourceDocIds((prev) => prev.filter((i) => i !== id));
                                setResourceDocs((prev) => prev.filter((doc) => doc.id !== id));
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <ExerciseHint register={register} t={t} />
              </div>
            </div>

            {/* Sticky Footer */}
            <footer className="fixed bottom-0 left-0 md:left-[256px] right-0 z-40 bg-surface-container-lowest border-t border-outline-variant px-gutter py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-6"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-8"
                >
                  {saving ? t('saving') : isEditMode ? t('update') : t('submit')}
                </Button>
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
