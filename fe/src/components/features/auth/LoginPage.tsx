'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { authLoginRequestSchema, type AuthLoginInput } from '@/schemas';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Button } from '@/components/ui/default/button';
import { Label } from '@/components/ui/default/label';
import { Checkbox } from '@/components/ui/default/checkbox';
import { AuthLayout } from './AuthLayout';

function getDashboardPath(role?: string) {
  return role === 'admin' ? '/dashboard/admin' : '/dashboard/learner';
}

function getSafeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
    return '/dashboard';
  }

  return value;
}

function getOAuthErrorKey(value: string | null) {
  if (!value) return null;
  if (value === 'Configuration') return 'GOOGLE_AUTH_CONFIGURATION';
  return 'GOOGLE_AUTH_FAILED';
}

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login, loginWithGoogle } = useAuth();

  const isFromRegistration = searchParams.get('registered') === 'true';
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const oauthError = getOAuthErrorKey(searchParams.get('error'));

  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<AuthLoginInput>({
    resolver: zodResolver(authLoginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: AuthLoginInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedInUser = await login(data.email, data.password);
      if (loggedInUser) {
        router.replace(getDashboardPath(loggedInUser.role));
      }
    } catch (err) {
      if (isUiShowError(err)) {
        if (err.errorCode === 'LOGIN_INVALID_CREDENTIALS') {
          setError('email', { type: 'server', message: err.errorCode });
          setError('password', { type: 'server', message: err.errorCode });
        } else {
          setErrorMsg(err.errorCode);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle(callbackUrl);
    } catch {
      setErrorMsg('GOOGLE_AUTH_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const visibleError = errorMsg ?? oauthError;

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
            <p className="text-[14px] text-on-surface-variant mt-1">{t('brandSubtitle')}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-[20px] font-semibold text-on-surface">{t('welcomeBack')}</h3>
            <p className="text-[14px] text-on-surface-variant mt-1">{t('signInPrompt')}</p>
          </div>

          {isFromRegistration && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{t('registrationSuccessMessage')}</span>
            </div>
          )}

          {visibleError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{t(visibleError)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="text"
                placeholder={t('emailPlaceholder')}
                aria-invalid={Boolean(errors.email)}
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-[12px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.email.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 pr-10"
                  {...register('password')}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[12px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t(errors.password.message as string)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="remember" className="font-normal text-on-surface-variant cursor-pointer">
                  {t('rememberMe')}
                </Label>
              </div>
              <Link className="text-[14px] font-medium text-primary hover:underline" href="/forgot-password">
                {t('forgotPassword')}
              </Link>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px] mr-2">sync</span> {t('loadingButton')}
                  </>
                ) : t('signInButton')}
              </Button>

              <Button
                variant="outline"
                type="button"
                className="w-full h-11 gap-2"
                onClick={onGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                {t('googleButton')}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-on-surface-variant">
              {t('noAccount')}{' '}
              <Link className="text-[14px] font-medium text-primary hover:underline" href="/register">
                {t('requestAccess')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
