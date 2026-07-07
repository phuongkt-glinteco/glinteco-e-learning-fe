'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { authRegisterRequestSchema } from '@/schemas';
import { authControllerRegister } from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Button } from '@/components/ui/default/button';
import { Label } from '@/components/ui/default/label';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';

const registerFormSchema = authRegisterRequestSchema
  .extend({
    confirmPassword: z.string().min(1, { message: 'confirmPasswordRequired' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'confirmPasswordMismatch',
    path: ['confirmPassword'],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const t = useTranslations('RegisterPage');
  const router = useRouter();
  const { loading: authLoading, loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isRegistered) return;
    if (countdown <= 0) {
      router.push('/login?registered=true');
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRegistered, countdown, router]);

  const onSubmit = async (data: RegisterFormInput) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await authControllerRegister({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        throwOnError: true,
      });
      setIsRegistered(true);
    } catch (err) {
      if (isUiShowError(err)) {
        if (err.errorCode === 'REGISTER_EMAIL_EXISTS') {
          setError('email', { type: 'server', message: err.errorCode });
        } else {
          setErrorMsg(err.errorCode);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // KHÔNG tắt loading ở đây: browser đang chuyển hướng sang trang Google OAuth!
    } catch {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || authLoading || isRegistered;

  if (isRegistered) {
    return (
      <Card className="w-full max-w-[480px] border-outline-variant shadow-sm rounded-xl relative">
        <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
        <CardContent className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                  check_circle
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              {t('registrationSuccessTitle')}
            </h2>
            <p className="text-sm text-on-surface-variant mb-8">
              {t('registrationSuccessDescription')}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-12 mb-4"
            >
              {t('goToLogin')}
            </Button>
            <p className="text-xs text-outline">
              {t('redirectCountdown', { seconds: countdown })}
            </p>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] border-outline-variant shadow-sm rounded-xl relative">
      <LanguageToggle size="sm" className="lg:hidden absolute top-4 right-4 z-20 border-outline-variant/60 shadow-xs" />
        <CardContent className="p-6 sm:p-8">
          {/* Mobile Logo */}
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

          {/* Header */}
          <div className="mb-6 text-center md:text-left">
            <h3 className="text-[20px] font-semibold text-on-surface">{t('createAccount')}</h3>
            <p className="text-[14px] text-on-surface-variant mt-1">{t('signUpPrompt')}</p>
          </div>

          {/* Inline Error */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{t(errorMsg)}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                disabled={isFormDisabled}
                placeholder={t('namePlaceholder')}
                aria-invalid={Boolean(errors.name)}
                className="h-11"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isFormDisabled}
                placeholder={t('emailPlaceholder')}
                aria-invalid={Boolean(errors.email)}
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.email.message as string)}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isFormDisabled}
                  placeholder={t('passwordPlaceholder')}
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 pr-10"
                  {...register('password')}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer disabled:opacity-50"
                  type="button"
                  disabled={isFormDisabled}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.password.message as string)}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isFormDisabled}
                  placeholder={t('confirmPasswordPlaceholder')}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="h-11 pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer disabled:opacity-50"
                  type="button"
                  disabled={isFormDisabled}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.confirmPassword.message as string)}
                </p>
              )}
              {!errors.confirmPassword && (
                <p className="text-[12px] text-outline-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  {t('passwordsMustMatch')}
                </p>
              )}
            </div>

            {/* Submit & Google Auth */}
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isFormDisabled}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px] mr-2">sync</span> {t('loadingButton')}
                  </>
                ) : t('createAccountButton')}
              </Button>

              <Button
                variant="outline"
                type="button"
                className="w-full h-11 gap-2"
                onClick={onGoogleSignUp}
                disabled={isFormDisabled}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                {t('googleButton')}
              </Button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-[14px] text-on-surface-variant">
              {t('alreadyHaveAccount')}{' '}
              <a
                className={`text-[14px] font-medium text-primary hover:underline cursor-pointer ${isFormDisabled ? 'pointer-events-none opacity-50' : ''}`}
                href="/login"
              >
                {t('signIn')}
              </a>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-on-surface-variant">
            <div className="flex gap-4">
              <a className={`hover:text-primary transition-colors ${isFormDisabled ? 'pointer-events-none opacity-50' : ''}`} href="#">{t('termsOfService')}</a>
              <a className={`hover:text-primary transition-colors ${isFormDisabled ? 'pointer-events-none opacity-50' : ''}`} href="#">{t('privacyPolicy')}</a>
            </div>
            <p className="text-outline">&copy; 2024 RAMP UP</p>
          </div>
        </CardContent>
      </Card>
  );
}
