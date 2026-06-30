'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';
import { authForgotPasswordRequestSchema, type AuthForgotPasswordInput } from '@/schemas';
import { requestPasswordReset } from '@/services/auth-recovery';
import { UiShowError } from '@/services/errors';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthForgotPasswordInput>({
    resolver: zodResolver(authForgotPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: AuthForgotPasswordInput) => {
    const email = data.email.trim();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSubmittedEmail(email);
    } catch (err) {
      setError(err instanceof UiShowError ? err.errorCode : 'UNKNOWN_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
      <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />

      <div className="flex w-full h-full min-h-screen">
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RAMP UP Logo"
              width={40}
              height={40}
              className="rounded-lg shadow-lg border border-white/10"
              priority
            />
            <h1 className="text-[32px] font-bold text-white tracking-tight">RAMP UP</h1>
          </div>
          <div className="relative z-10 max-w-md">
            <h2 className="text-[24px] font-semibold text-white mb-2">{t('brandSubtitle')}</h2>
            <p className="text-[16px] text-white/80">{t('brandTagline')}</p>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-96 h-96 rounded-full border border-white/20 opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/3 w-[30rem] h-[30rem] rounded-full border border-white/20 opacity-10 pointer-events-none" />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
          <div className="w-full max-w-md bg-surface border border-outline shadow-sm rounded-xl p-8">
            <div className="lg:hidden mb-8 flex flex-col items-center">
              <Image
                src="/logo.png"
                alt="RAMP UP Logo"
                width={48}
                height={48}
                className="mb-2 rounded-xl shadow-md border border-outline"
                priority
              />
              <h1 className="text-[24px] font-bold text-on-surface tracking-tight">RAMP UP</h1>
              <p className="text-[14px] text-on-surface-variant mt-1">{t('brandSubtitle')}</p>
            </div>

            {submittedEmail ? (
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                      check_circle
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-3">{t('successTitle')}</h2>
                <p className="text-sm text-on-surface-variant mb-8">
                  {t('successDescription', { email: submittedEmail })}
                </p>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 text-left">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{t(error)}</span>
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    className="w-full bg-surface border border-outline text-on-surface text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-background transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={() => void onSubmit({ email: submittedEmail })}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        {t('sendingButton')}
                      </span>
                    ) : t('resendButton')}
                  </button>
                  <Link
                    href="/login"
                    className="w-full bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
                  >
                    {t('backToLogin')}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-[20px] font-semibold text-on-surface">{t('title')}</h3>
                  <p className="text-[14px] text-on-surface-variant mt-1">{t('description')}</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{t(error)}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="email">{t('emailLabel')}</label>
                    <input
                      className={`w-full bg-surface border ${errors.email ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400`}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t('emailPlaceholder')}
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-error text-[12px] mt-1 flex items-center gap-1" role="alert">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {t(errors.email.message as string)}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      className="w-full bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading || !isValid}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                          {t('sendingButton')}
                        </span>
                      ) : t('sendButton')}
                    </button>
                    <Link className="block text-center text-[14px] font-medium text-primary hover:underline" href="/login">
                      {t('backToLogin')}
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
