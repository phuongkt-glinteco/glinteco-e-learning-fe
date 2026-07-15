'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { authResetPasswordFormSchema, type AuthResetPasswordFormInput } from '@/schemas';
import { resetPassword } from '@/services/auth-recovery';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Button } from '@/components/ui/default/button';
import { Label } from '@/components/ui/default/label';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage');
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const hasToken = token.length > 0;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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

  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';
  const isLengthValid = passwordValue.length >= 6;
  const isMatchValid = passwordValue.length > 0 && passwordValue === confirmPasswordValue;

  const onSubmit = async (data: AuthResetPasswordFormInput) => {
    if (!hasToken) return;

    setLoading(true);
    setError(null);
    setStatusError(null);

    try {
      await resetPassword({ token: data.token, password: data.password });
      setIsReset(true);
    } catch (err: any) {
      const errCode = isUiShowError(err) ? err.errorCode : err?.errorCode || 'UNKNOWN_ERROR';
      const isTokenOrFatalError = ['NOT_FOUND', 'FORBIDDEN', 'RESET_TOKEN_INVALID', 'RESET_TOKEN_EXPIRED', 'USER_NOT_FOUND'].includes(errCode) || err?.status === 400 || err?.status === 404 || err?.status === 403;
      if (isTokenOrFatalError || errCode !== 'VALIDATION_ERROR') {
        setStatusError(errCode);
      } else {
        setError(errCode);
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. SUCCESS STATE: Breezy, open, non-boxed layout ("phong cách thoáng và không bị bó card")
  if (isReset) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 px-6 text-center animate-fade-in relative">
        <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500/15 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10">
            <span className="material-symbols-outlined text-6xl">check_circle</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface mb-4 tracking-tight">
          {t('successTitle')}
        </h2>
        <p className="text-base text-on-surface-variant max-w-md mx-auto mb-10 leading-relaxed">
          {t('successSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Button asChild className="w-full sm:w-auto min-w-[240px] h-13 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all cursor-pointer">
            <Link href="/login" className="flex items-center justify-center gap-2">
              <span>{t('loginNowButton')}</span>
              <span className="material-symbols-outlined text-lg">login</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Determine current step index for the multi-step header
  const currentStep = !hasToken || statusError ? 1 : loading ? 3 : 2;

  // Render error/invalid status view inside the card
  const renderStatusCardContent = (variant: 'invalid' | 'error', errorCode?: string) => {
    const isInvalidOrExpired = variant === 'invalid' || ['NOT_FOUND', 'FORBIDDEN', 'RESET_TOKEN_INVALID', 'RESET_TOKEN_EXPIRED'].includes(errorCode || '');

    return (
      <div className="text-center py-4">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-200 dark:border-red-800/40">
            <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400">
              error
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-3">
          {isInvalidOrExpired ? t('invalidLinkTitle') : t('errorTitle')}
        </h2>
        <p className="text-sm text-on-surface-variant mb-8 max-w-sm mx-auto leading-relaxed">
          {isInvalidOrExpired 
            ? (errorCode && ['RESET_TOKEN_INVALID', 'RESET_TOKEN_EXPIRED'].includes(errorCode) ? t(errorCode) : t('invalidLinkDescription'))
            : (errorCode ? t(errorCode) : t('UNKNOWN_ERROR'))}
        </p>
        <div className="space-y-3 max-w-xs mx-auto">
          <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold cursor-pointer">
            <Link href="/forgot-password">
              {t('requestNewLink')}
            </Link>
          </Button>
          {variant === 'error' && !isInvalidOrExpired && (
            <Button variant="outline" className="w-full h-12 cursor-pointer" onClick={() => { setStatusError(null); setError(null); }}>
              {t('tryAgain')}
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full h-12 text-on-surface-variant hover:text-on-surface cursor-pointer">
            <Link href="/login">
              {t('backToLogin')}
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  // 2. MULTI-STEP CARD LAYOUT: Distinct, elevated Card layout ("có card multi step")
  return (
    <Card className="w-full max-w-[540px] border border-outline-variant/60 shadow-lg rounded-2xl overflow-hidden bg-surface transition-all duration-300 relative">
      <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
      
      {/* Multi-Step Header Indicator */}
      <div className="bg-surface-container-lowest/80 border-b border-outline-variant/50 px-8 pt-6 pb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
          <span>{t('stepTracker', { step: currentStep, total: 3 })}</span>
          <span className="text-primary font-bold">
            {currentStep === 1 && t('step1Title')}
            {currentStep === 2 && t('step2Title')}
            {currentStep === 3 && t('step3Title')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= 1 ? 'bg-primary' : 'bg-outline-variant/40'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-primary' : 'bg-outline-variant/40'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-primary' : 'bg-outline-variant/40'}`} />
        </div>
      </div>

      <CardContent className="p-8">
        <div className="lg:hidden mb-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="RAMP UP Logo"
            width={44}
            height={44}
            className="mb-2 rounded-xl shadow-md border border-outline"
            priority
          />
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">RAMP UP</h1>
        </div>

        {!hasToken ? renderStatusCardContent('invalid') : statusError ? renderStatusCardContent('error', statusError) : (
          <>
            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-on-surface tracking-tight">{t('title')}</h3>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">{t('description')}</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span className="font-medium">{t(error)}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...register('token')} value={token} />

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-on-surface">{t('passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('passwordPlaceholder')}
                    aria-invalid={Boolean(errors.password)}
                    disabled={loading}
                    className="h-12 pr-10 bg-surface-container-lowest/60 border-outline-variant/80 focus:border-primary text-base"
                    {...register('password')}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
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
                  <p className="text-destructive text-xs font-medium flex items-center gap-1.5 pt-0.5" role="alert">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    {t(errors.password.message as string)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-on-surface">{t('confirmPasswordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    disabled={loading}
                    className="h-12 pr-10 bg-surface-container-lowest/60 border-outline-variant/80 focus:border-primary text-base"
                    {...register('confirmPassword')}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
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
                  <p className="text-destructive text-xs font-medium flex items-center gap-1.5 pt-0.5" role="alert">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    {t(errors.confirmPassword.message as string)}
                  </p>
                )}
              </div>

              {/* Real-time Password Strength / Requirements Checklist */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/50 space-y-2">
                <p className="text-xs font-semibold text-on-surface-variant">{t('passwordRulesHeader')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${isLengthValid ? 'text-green-600 dark:text-green-400' : 'text-on-surface-variant/70'}`}>
                    <span className="material-symbols-outlined text-base">
                      {isLengthValid ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{t('ruleLength')}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${isMatchValid ? 'text-green-600 dark:text-green-400' : 'text-on-surface-variant/70'}`}>
                    <span className="material-symbols-outlined text-base">
                      {isMatchValid ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{t('ruleMatch')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  className="w-full h-13 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow cursor-pointer transition-all"
                  disabled={loading || !isValid || !isLengthValid || !isMatchValid}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px] mr-2">sync</span>
                      <span>{t('submittingButton')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('submitButton')}</span>
                      <span className="material-symbols-outlined text-[18px] ml-1.5">arrow_forward</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center pt-2 border-t border-outline-variant/40">
              <Link className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5 py-1" href="/login">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>{t('backToLogin')}</span>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

