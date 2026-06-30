'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';
import { authResetPasswordFormSchema, type AuthResetPasswordFormInput } from '@/schemas';
import { resetPassword } from '@/services/auth-recovery';
import { UiShowError } from '@/services/errors';

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage');
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const hasToken = token.length > 0;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthResetPasswordFormInput>({
    resolver: zodResolver(authResetPasswordFormSchema),
    mode: 'onChange',
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: AuthResetPasswordFormInput) => {
    if (!hasToken) return;

    setLoading(true);
    setError(null);

    try {
      await resetPassword({ token: data.token, password: data.password });
      setIsReset(true);
    } catch (err) {
      setError(err instanceof UiShowError ? err.errorCode : 'UNKNOWN_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusCard = (variant: 'invalid' | 'success') => {
    const isSuccess = variant === 'success';

    return (
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/20'} flex items-center justify-center`}>
            <span className={`material-symbols-outlined text-5xl ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isSuccess ? 'check_circle' : 'error'}
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-3">
          {isSuccess ? t('successTitle') : t('invalidLinkTitle')}
        </h2>
        <p className="text-sm text-on-surface-variant mb-8">
          {isSuccess ? t('successDescription') : t('invalidLinkDescription')}
        </p>
        <div className="space-y-3">
          {!isSuccess && (
            <Link
              href="/forgot-password"
              className="w-full bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
            >
              {t('requestNewLink')}
            </Link>
          )}
          <Link
            href="/login"
            className={`${isSuccess ? 'bg-primary text-white hover:bg-blue-700' : 'bg-surface border border-outline text-on-surface hover:bg-background'} w-full text-[14px] font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center`}
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
      <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />

      <div className="flex w-full h-full min-h-screen">
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }} />
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary opacity-20 rounded-full blur-3xl pointer-events-none" />
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
            <h2 className="text-[48px] font-extrabold text-white mb-4 leading-tight">
              {t('brandSubtitle')}
            </h2>
            <p className="text-[16px] text-white/80 max-w-md">
              {t('brandTagline')}
            </p>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] text-white/60">RAMP UP Engineering Portal</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-container-low">
          <div className="w-full max-w-[480px] bg-surface border border-outline-variant shadow-sm rounded-xl p-8">
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
            </div>

            {!hasToken ? renderStatusCard('invalid') : isReset ? renderStatusCard('success') : (
              <>
                <div className="mb-6 text-center md:text-left">
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
                  <input type="hidden" {...register('token')} value={token} />

                  <div>
                    <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="password">{t('passwordLabel')}</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-surface border ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={t('passwordPlaceholder')}
                        aria-invalid={Boolean(errors.password)}
                        {...register('password')}
                      />
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-error text-[12px] mt-1 flex items-center gap-1" role="alert">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {t(errors.password.message as string)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="confirmPassword">{t('confirmPasswordLabel')}</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-surface border ${errors.confirmPassword ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={t('confirmPasswordPlaceholder')}
                        aria-invalid={Boolean(errors.confirmPassword)}
                        {...register('confirmPassword')}
                      />
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-error text-[12px] mt-1 flex items-center gap-1" role="alert">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {t(errors.confirmPassword.message as string)}
                      </p>
                    )}
                  </div>

                  <button
                    className="w-full h-12 bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    type="submit"
                    disabled={loading || !isValid}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        {t('submittingButton')}
                      </span>
                    ) : t('submitButton')}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link className="text-[14px] font-medium text-primary hover:underline" href="/login">
                    {t('backToLogin')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
