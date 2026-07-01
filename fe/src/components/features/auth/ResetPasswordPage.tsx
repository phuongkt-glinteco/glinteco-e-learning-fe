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
import { AuthLayout } from './AuthLayout';

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
      setError(isUiShowError(err) ? err.errorCode : 'UNKNOWN_ERROR');
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
            <Button asChild className="w-full h-12">
              <Link href="/forgot-password">
                {t('requestNewLink')}
              </Link>
            </Button>
          )}
          <Button asChild variant={isSuccess ? "default" : "outline"} className="w-full h-12">
            <Link href="/login">
              {t('backToLogin')}
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-[480px] border-outline-variant shadow-sm rounded-xl">
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

                <div className="space-y-2">
                  <Label htmlFor="password">{t('passwordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('passwordPlaceholder')}
                      aria-invalid={Boolean(errors.password)}
                      className="h-11 pr-10"
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
                    <p className="text-destructive text-[12px] flex items-center gap-1" role="alert">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {t(errors.password.message as string)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('confirmPasswordPlaceholder')}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className="h-11 pr-10"
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
                    <p className="text-destructive text-[12px] flex items-center gap-1" role="alert">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {t(errors.confirmPassword.message as string)}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 mt-2"
                    disabled={loading || !isValid}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px] mr-2">sync</span>
                        {t('submittingButton')}
                      </>
                    ) : t('submitButton')}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link className="text-[14px] font-medium text-primary hover:underline" href="/login">
                  {t('backToLogin')}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
