'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/utils/api';
import CircleMeter from '@/components/ui/CircleMeter';
import HPBar from '@/components/ui/HPBar';
import { StatusBadge, Tag, TimeBadge } from '@/components/ui/Badge';
import { Icon } from '@iconify/react';

interface Lesson {
  id: string;
  name: string;
  order: number;
  content: string;
  isCompleted: boolean;
}

interface Track {
  id: string;
  name: string;
  order: number;
  lessonsCount: number;
  progress: {
    lessonsCompleted: number;
    status: 'locked' | 'in_progress' | 'completed';
  };
}

interface ExerciseSubmission {
  id: string;
  prUrl: string;
  status: 'pending' | 'approved' | 'changes';
  submittedAt: string;
}

interface Exercise {
  id: string;
  title: string;
  objectives: string[] | Record<string, string>;
  steps: string[] | Record<string, string>;
  submission: ExerciseSubmission | null;
  tag?: string;
  difficulty?: string;
  estimatedTime?: string;
  xp?: number;
  brief?: string;
  hint?: string;
  resources?: Array<{ id: string; title: string; url?: string }>;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = params.trackId as string;
  const lessonId = params.lessonId as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exercise variant specific state
  const [prUrlInput, setPrUrlInput] = useState('');
  const [submittingPr, setSubmittingPr] = useState(false);
  const [prSuccessMessage, setPrSuccessMessage] = useState<string | null>(null);

  // Lesson complete transition state
  const [completingLesson, setCompletingLesson] = useState(false);
  const [unlockedNextTrack, setUnlockedNextTrack] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quiz variant state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  // Video variant state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Fetch track, lessons, and exercises on load
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get track info
      const trackRes = await apiClient.get<Track>(`/tracks/${trackId}`);
      setTrack(trackRes);

      // 2. Get lessons in track
      const lessonsRes = await apiClient.get<{ data: Lesson[] }>(`/tracks/${trackId}/lessons`);
      const resolvedLessons = lessonsRes.data || [];
      setLessons(resolvedLessons);

      // 3. Get exercises in track
      const exercisesRes = await apiClient.get<{ data: Exercise[] }>(`/tracks/${trackId}/exercises`);
      const resolvedExercises = exercisesRes.data || [];
      setExercises(resolvedExercises);

      // Set initial value for PR input if already submitted
      const activeExercise = resolvedExercises[0];
      if (activeExercise?.submission?.prUrl) {
        setPrUrlInput(activeExercise.submission.prUrl);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackId && lessonId) {
      fetchData();
    }
  }, [trackId, lessonId]);

  const activeLesson = lessons.find((l) => l.id === lessonId);
  const activeExercise = exercises[0]; // Usually 1 exercise per track

  // Determine variant dynamically
  const getLessonVariant = () => {
    if (!activeLesson) return 'reading';
    const nameLower = activeLesson.name.toLowerCase();
    const contentLower = activeLesson.content.toLowerCase();

    // Last lesson in track + there is an exercise = exercise variant
    const isLastLesson = lessons.length > 0 && activeLesson.id === lessons[lessons.length - 1].id;
    if (isLastLesson && activeExercise) {
      return 'exercise';
    }

    if (nameLower.includes('video') || contentLower.includes('video') || nameLower.includes('pattern') || nameLower.includes('modules')) {
      return 'video';
    }
    if (nameLower.includes('quiz') || contentLower.includes('quiz') || nameLower.includes('test')) {
      return 'quiz';
    }
    if (nameLower.includes('checkpoint') || contentLower.includes('checkpoint')) {
      return 'checkpoint';
    }
    return 'reading';
  };

  const variant = getLessonVariant();

  // Simple Markdown Parser helper
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-on-surface mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-on-surface mt-6 mb-2.5">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-on-surface mt-7 mb-3">$1</h1>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">$1</code>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-sm text-on-surface-variant my-1.5">$1</li>');
    html = html.replace(/\n\n/g, '</p><p class="text-sm text-on-surface-variant leading-relaxed my-3.5">');
    return `<p class="text-sm text-on-surface-variant leading-relaxed my-3.5">${html}</p>`;
  };

  // Complete lesson handler
  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    try {
      setCompletingLesson(true);
      const res = await apiClient.post<any>(`/lessons/${activeLesson.id}/complete`);

      setToastMessage(`Congratulations! +${res.xpAwarded || 40} XP Claimed.`);

      // If checkpoint or track complete unlocks a next track
      if (res.unlockedTrackId) {
        setUnlockedNextTrack(res.unlockedTrackId);
      }

      // Proactively update local state for snappy responsive UI
      setLessons((prev) =>
        prev.map((l) => (l.id === activeLesson.id ? { ...l, isCompleted: true } : l))
      );
      if (track) {
        const updatedCompletedCount = Math.min(track.progress.lessonsCompleted + 1, track.lessonsCount);
        setTrack({
          ...track,
          progress: {
            ...track.progress,
            lessonsCompleted: updatedCompletedCount,
            status: updatedCompletedCount === track.lessonsCount ? 'completed' : 'in_progress',
          },
        });
      }

      // Automatically clear toast after 4 seconds
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to complete lesson');
    } finally {
      setCompletingLesson(false);
    }
  };

  // Exercise Submission handler
  const handleSubmitExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExercise || !prUrlInput.trim()) return;
    try {
      setSubmittingPr(true);
      setPrSuccessMessage(null);

      const hasSubmittedBefore = !!activeExercise.submission;
      const endpoint = `/exercises/${activeExercise.id}/submissions`;

      let submissionResult;
      if (hasSubmittedBefore) {
        // PUT for re-submission
        submissionResult = await apiClient.put<any>(endpoint, { prUrl: prUrlInput });
      } else {
        // POST for initial submission
        submissionResult = await apiClient.post<any>(endpoint, { prUrl: prUrlInput });
      }

      setPrSuccessMessage('Pull Request link submitted successfully!');

      // Update local exercises submission state
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === activeExercise.id
            ? {
                ...ex,
                submission: {
                  id: submissionResult.id || 'temp-id',
                  prUrl: prUrlInput,
                  status: 'pending',
                  submittedAt: new Date().toISOString(),
                },
              }
            : ex
        )
      );

      setTimeout(() => setPrSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit PR link');
    } finally {
      setSubmittingPr(false);
    }
  };

  // Interactive Quiz questions generator
  const quizQuestions = activeLesson ? [
    {
      question: `What is the primary topic of the lesson "${activeLesson.name}"?`,
      options: [
        'Running server-side build steps and dev container optimizations',
        'Implementing clean layered boundaries with inversion of control',
        'Direct connection database migrations with raw SQL query bindings',
        'Configuring static stylesheet loaders and Next.js asset builds'
      ],
      answer: 1,
    },
    {
      question: 'Which software engineering design rule helps minimize tight coupling between application modules?',
      options: [
        'Global state variables mapping',
        'Strict dependency injection and interfaces isolation',
        'Direct import of concrete class instances across files',
        'Enforcing large monolith files consolidation'
      ],
      answer: 1,
    }
  ] : [];

  const handleQuizAnswerSelect = (qIdx: number, oIdx: number) => {
    if (quizChecked) return;
    setQuizAnswers({
      ...quizAnswers,
      [qIdx]: oIdx,
    });
  };

  const checkQuizAnswers = () => {
    setQuizChecked(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizChecked(false);
  };

  const isQuizCorrect =
    quizQuestions.length > 0 &&
    quizQuestions.every((q, i) => quizAnswers[i] === q.answer);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant text-sm mt-2 font-medium">Loading lesson details...</p>
      </div>
    );
  }

  if (error || !activeLesson) {
    return (
      <div className="p-lg bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto my-8">
        <h3 className="font-bold flex items-center gap-2">
          <Icon icon="lucide:alert-circle" /> Lesson Not Found
        </h3>
        <p className="text-sm mt-1">{error || 'The requested lesson or track was not found.'}</p>
        <button
          onClick={() => router.push('/courses')}
          className="mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const trackProgressPercent = track ? Math.round((track.progress.lessonsCompleted / track.lessonsCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-[1280px] mx-auto py-2">
      {/* Toast Notification for XP claim */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] text-white border border-slate-700 shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
            <Icon icon="lucide:zap" className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300">Level Cleared!</div>
            <div className="text-sm font-black text-white">{toastMessage}</div>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header bar with Track summary */}
      <div className="bg-surface border border-outline-variant rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/courses')}
            className="w-9 h-9 border border-outline-variant hover:bg-slate-50 rounded-lg flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Milestone Track
            </span>
            <h2 className="text-base font-bold text-on-surface">{track?.name}</h2>
          </div>
        </div>

        {unlockedNextTrack && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <Icon icon="lucide:unlock" className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="font-semibold">Next track unlocked!</span>
            <button
              onClick={() => router.push('/courses')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px] transition-colors"
            >
              View dashboard
            </button>
          </div>
        )}
      </div>

      {/* 3-Pane Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* PANE 1: Left Navigation Sidebar (1 Column) */}
        <div className="lg:col-span-1 bg-surface border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Lessons Playlist
            </h3>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
              <span>Progress</span>
              <span>
                {track?.progress.lessonsCompleted}/{track?.lessonsCount} done
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto pr-1">
            {lessons.map((l, i) => {
              const isActive = l.id === lessonId;
              const isComp = l.isCompleted;

              return (
                <button
                  key={l.id}
                  onClick={() => router.push(`/tracks/${trackId}/lessons/${l.id}`)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/5 text-primary border-primary/20 shadow-sm'
                      : 'border-transparent text-on-surface-variant hover:bg-slate-50 hover:text-on-surface'
                  }`}
                >
                  <Icon
                    icon={
                      isComp
                        ? 'lucide:check-circle-2'
                        : isActive
                        ? 'lucide:play-circle'
                        : 'lucide:circle'
                    }
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isComp ? 'text-green-600' : isActive ? 'text-primary' : 'text-slate-400'
                    }`}
                  />
                  <span className="leading-normal flex-1 truncate">
                    {String(i + 1).padStart(2, '0')}. {l.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Middle Main Content Pane (2 Columns) */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-lg p-6 shadow-sm flex flex-col gap-6">
          {/* Active Lesson Header Info */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase bg-primary-container/20 text-primary border border-primary-container/30">
                {variant} Lesson
              </span>
              <TimeBadge time={variant === 'exercise' ? activeExercise?.estimatedTime || '2h' : '15m'} />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-amber-500 fill-current" />
                {variant === 'exercise' ? activeExercise?.xp || 120 : 40} XP
              </span>
              {activeLesson.isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                  <Icon icon="lucide:check" className="w-3 h-3" /> COMPLETED
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-on-surface leading-snug">{activeLesson.name}</h1>
          </div>

          {/* Render Markdown Content */}
          <div
            className="prose prose-sm max-w-none text-on-surface-variant"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(activeLesson.content) }}
          />

          {/* ACTIVE CONTENT VARIANT PANEL */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            
            {/* VARIANT A: Video Content Variant */}
            {variant === 'video' && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Video Presentation
                </h4>

                <div className="relative aspect-video rounded-xl bg-[#0f172a] overflow-hidden flex items-center justify-center border border-slate-800">
                  {isVideoPlaying ? (
                    <div className="w-full h-full relative flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                      {/* Public sample programming animation */}
                      <video
                        src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34281-large.mp4"
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        controls
                        onEnded={() => {
                          setIsVideoEnded(true);
                          setIsVideoPlaying(false);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-6">
                      <div className="w-16 h-16 bg-primary/10 border border-primary/20 hover:scale-105 transition-transform rounded-full flex items-center justify-center text-primary cursor-pointer shadow-lg"
                        onClick={() => setIsVideoPlaying(true)}>
                        <Icon icon="lucide:play" className="w-8 h-8 fill-current ml-1" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Watch Lesson Overview</div>
                        <div className="text-xs text-slate-400 mt-1">Duration: 8 mins • Code design patterns walkthrough</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transcript Drawer */}
                <div className="border border-slate-200 rounded-lg bg-white mt-1 overflow-hidden">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-on-surface-variant hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <Icon icon="lucide:file-text" className="w-4 h-4 text-primary" />
                      Show Video Transcript
                    </span>
                    <Icon icon={showTranscript ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-4 h-4" />
                  </button>
                  {showTranscript && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs text-on-surface-variant leading-relaxed font-normal">
                      &ldquo;In this session, we walk through the design logic of decoupling core business entities from external transport layers. We detail standard constructor injection configurations, structure modules layout folders, and review unit test setups. Pay close attention to interface bindings as they represent strict integration boundaries.&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4 pt-2">
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completingLesson || activeLesson.isCompleted}
                    className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none ${
                      activeLesson.isCompleted
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    <Icon icon="lucide:check-circle" className="w-4 h-4" />
                    {activeLesson.isCompleted ? 'Video Cleared' : 'Mark Video Complete'}
                  </button>
                </div>
              </div>
            )}

            {/* VARIANT B: Interactive Quiz Content Variant */}
            {variant === 'quiz' && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Topic Quiz
                </h4>

                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2.5">
                      <div className="text-xs font-bold text-on-surface">
                        Question {qIdx + 1}: {q.question}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          const isAnswerCorrect = q.answer === oIdx;
                          const showWrong = quizChecked && isSelected && !isAnswerCorrect;
                          const showRight = quizChecked && isAnswerCorrect;

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswerSelect(qIdx, oIdx)}
                              className={`w-full text-left px-3 py-2 rounded border text-xs font-medium transition-all ${
                                showRight
                                  ? 'bg-green-50 border-green-400 text-green-800'
                                  : showWrong
                                  ? 'bg-red-50 border-red-400 text-red-800'
                                  : isSelected
                                  ? 'bg-primary/5 border-primary text-primary font-semibold'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 text-[8px] ${
                                  isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && '✓'}
                                </span>
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-2">
                  {quizChecked ? (
                    <>
                      {!isQuizCorrect && (
                        <button
                          onClick={resetQuiz}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors text-on-surface-variant cursor-pointer"
                        >
                          Retry Quiz
                        </button>
                      )}
                      <button
                        onClick={handleCompleteLesson}
                        disabled={completingLesson || !isQuizCorrect || activeLesson.isCompleted}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none ${
                          !isQuizCorrect || activeLesson.isCompleted
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                        }`}
                      >
                        <Icon icon="lucide:award" className="w-4 h-4" />
                        {activeLesson.isCompleted ? 'Quiz Completed' : 'Submit Quiz Answers'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={checkQuizAnswers}
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      className="px-5 py-2.5 bg-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      Check Answers
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VARIANT C: Exercise / Assignment Submission Content Variant */}
            {variant === 'exercise' && activeExercise && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Milestone Exercise Submission
                </h4>

                {/* Status Indicator Banner */}
                {activeExercise.submission ? (
                  <div className={`p-4 border rounded-lg flex items-start gap-3 ${
                    activeExercise.submission.status === 'approved'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : activeExercise.submission.status === 'changes'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      <Icon
                        icon={
                          activeExercise.submission.status === 'approved'
                            ? 'lucide:check-square'
                            : activeExercise.submission.status === 'changes'
                            ? 'lucide:alert-triangle'
                            : 'lucide:clock'
                        }
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-bold uppercase tracking-wide">
                        {activeExercise.submission.status === 'approved'
                          ? 'Approved & Merged'
                          : activeExercise.submission.status === 'changes'
                          ? 'Changes Requested'
                          : 'Awaiting Admin Review'}
                      </div>
                      <p className="mt-1 leading-normal font-medium opacity-90">
                        {activeExercise.submission.status === 'approved'
                          ? 'Fantastic work! The review team approved this assignment. XP has been fully awarded.'
                          : activeExercise.submission.status === 'changes'
                          ? 'The reviewer left some feedback requests. Please update your PR and submit again.'
                          : 'Your GitHub PR link has been logged. Our tech leads will review it shortly.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-slate-200 bg-white rounded-lg text-slate-500 text-xs flex items-center gap-2">
                    <Icon icon="lucide:info" className="w-4 h-4 text-slate-400" />
                    <span>No assignment has been submitted yet for this track.</span>
                  </div>
                )}

                {/* GitHub PR URL Form */}
                <form onSubmit={handleSubmitExercise} className="mt-2 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                      <Icon icon="lucide:git-pull-request" className="w-3.5 h-3.5" />
                      Submit GitHub PR / Branch Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={prUrlInput}
                        onChange={(e) => setPrUrlInput(e.target.value)}
                        disabled={activeExercise.submission?.status === 'approved'}
                        placeholder="https://github.com/username/project/pull/1"
                        required
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:bg-slate-50"
                      />
                      <button
                        type="submit"
                        disabled={
                          submittingPr ||
                          !prUrlInput.trim() ||
                          activeExercise.submission?.status === 'approved'
                        }
                        className="px-4 py-2 bg-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-lg shadow-sm shrink-0 transition-colors cursor-pointer"
                      >
                        {submittingPr ? 'Sending...' : activeExercise.submission ? 'Resubmit' : 'Submit'}
                      </button>
                    </div>
                  </div>
                  {prSuccessMessage && (
                    <div className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                      <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                      {prSuccessMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* VARIANT D: Reading Content Variant */}
            {variant === 'reading' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Required Reading Resources
                </h4>

                <div className="flex flex-col gap-2">
                  <a
                    href="https://nestjs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:file-text" className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                        NestJS Architecture Best Practices Documentation
                      </span>
                    </div>
                    <Icon icon="lucide:external-link" className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <a
                    href="https://google.github.io/styleguide/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:file-text" className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                        Google Clean Code Styling Guidelines
                      </span>
                    </div>
                    <Icon icon="lucide:external-link" className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>

                <div className="flex justify-end mt-4 pt-2">
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completingLesson || activeLesson.isCompleted}
                    className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none ${
                      activeLesson.isCompleted
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    <Icon icon="lucide:check-circle" className="w-4 h-4" />
                    {activeLesson.isCompleted ? 'Reading Cleared' : 'Completed Reading'}
                  </button>
                </div>
              </div>
            )}

            {/* VARIANT E: Checkpoint / Milestone Variant */}
            {variant === 'checkpoint' && (
              <div className="flex flex-col items-center justify-center text-center p-4 gap-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white ring-4 ring-amber-100 animate-pulse shadow-lg">
                  <Icon icon="lucide:trophy" className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Milestone Checkpoint Reached</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mt-1 mx-auto leading-relaxed">
                    Great work! You have finished all core modules in this learning milestone. Hit the button below to confirm unlock requirements.
                  </p>
                </div>

                <button
                  onClick={handleCompleteLesson}
                  disabled={completingLesson || activeLesson.isCompleted}
                  className="px-6 py-3 bg-secondary text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  {completingLesson ? 'Unlocking...' : activeLesson.isCompleted ? 'Track Complete!' : 'Unlock Next Track'}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* PANE 3: Right Sidebar Stats & Exercise Brief (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Conic progress gauge */}
          <div className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col items-center gap-3">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center border-b border-slate-100 w-full pb-2">
              Track Progress
            </h4>
            <div className="py-2">
              <CircleMeter value={trackProgressPercent} size={144} label="COMPLETED" />
            </div>
            <div className="text-[11px] font-semibold text-slate-500 text-center leading-normal">
              Keep finishing lessons to level up. XP unlocks advanced topics.
            </div>
          </div>

          {/* Active exercise brief summary panel */}
          {activeExercise && (
            <div className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Exercise Info
                </h4>
                <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {activeExercise.xp || 120} XP
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-on-surface leading-tight">{activeExercise.title}</h5>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {activeExercise.brief || 'Complete track assignments to test knowledge boundaries.'}
                </p>
              </div>

              {/* Steps or Objectives list */}
              {activeExercise.objectives && (
                <div className="pt-2 border-t border-slate-100">
                  <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Evaluation Criteria
                  </h6>
                  <div className="flex flex-col gap-1.5">
                    {Array.isArray(activeExercise.objectives) ? (
                      activeExercise.objectives.slice(0, 3).map((obj, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-start text-[11px] font-medium text-on-surface-variant leading-relaxed">
                          <Icon icon="lucide:check-square" className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))
                    ) : (
                      Object.values(activeExercise.objectives).slice(0, 3).map((obj: any, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-start text-[11px] font-medium text-on-surface-variant leading-relaxed">
                          <Icon icon="lucide:check-square" className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related documents list */}
          <div className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-100 pb-2">
              Helpful Docs
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                <Icon icon="lucide:external-link" className="w-3.5 h-3.5 text-slate-400" />
                Next.js Documentation
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                <Icon icon="lucide:external-link" className="w-3.5 h-3.5 text-slate-400" />
                GitHub Pull Request Flow
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
