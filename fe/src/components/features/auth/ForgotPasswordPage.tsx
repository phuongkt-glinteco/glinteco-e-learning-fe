'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { authForgotPasswordRequestSchema, type AuthForgotPasswordInput } from '@/schemas';
import { requestPasswordReset } from '@/services/auth-recovery';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Button } from '@/components/ui/default/button';
import { Label } from '@/components/ui/default/label';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

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
    setResetToken(null);

    try {
      const response: any = await requestPasswordReset(email);
      setSubmittedEmail(email);
      if (response && response.resetUrl) {
        setResetUrl(response.resetUrl);
        if (response.resetToken) setResetToken(response.resetToken);
      } else if (response && response.resetToken) {
        setResetToken(response.resetToken);
        setResetUrl(`/reset-password?token=${response.resetToken}`);
      }
    } catch (err) {
      setError(isUiShowError(err) ? err.errorCode : 'UNKNOWN_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-outline shadow-sm rounded-xl relative">
      <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
      <CardContent className="p-8">
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
              
              {resetUrl || resetToken ? (
                <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center space-y-3">
                  <p className="text-sm text-on-surface-variant font-medium">
                    {t('devModeTokenReady')}
                  </p>
                  <div>
                    <Link
                      href={resetUrl || `/reset-password?token=${resetToken}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-sm hover:underline transition-colors"
                    >
                      <span>{t('resetNowButton')}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant mb-8">
                  {t('successDescription', { email: submittedEmail })}
                </p>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{t(error)}</span>
                </div>
              )}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => void onSubmit({ email: submittedEmail })}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px] mr-2">sync</span>
                      {t('sendingButton')}
                    </>
                  ) : t('resendButton')}
                </Button>
                <Button asChild className="w-full h-12">
                  <Link href="/login">
                    {t('backToLogin')}
                  </Link>
                </Button>
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
                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('emailPlaceholder')}
                    aria-invalid={Boolean(errors.email)}
                    className="h-11"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-destructive text-[12px] flex items-center gap-1" role="alert">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {t(errors.email.message as string)}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={loading || !isValid}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px] mr-2">sync</span>
                        {t('sendingButton')}
                      </>
                    ) : t('sendButton')}
                  </Button>
                  <div className="text-center">
                    <Link className="text-[14px] font-medium text-primary hover:underline" href="/login">
                      {t('backToLogin')}
                    </Link>
                  </div>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
  );
}
