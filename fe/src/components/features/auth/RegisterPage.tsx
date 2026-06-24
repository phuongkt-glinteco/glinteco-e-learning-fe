'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';
import { authRegisterRequestSchema } from '@/schemas';
import { authControllerRegister } from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { UiShowError } from '@/services/errors';

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
  const { loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
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
  const [error, setErrorMsg] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Countdown tự động redirect về login
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
      if (err instanceof UiShowError) setErrorMsg(err.errorCode);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Màn hình đăng ký thành công
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
        <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />
        <div className="flex w-full h-full min-h-screen items-center justify-center">
          <div className="max-w-md w-full mx-auto p-8 text-center">
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
            <button
              onClick={() => router.push('/login')}
              className="w-full h-12 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mb-4 cursor-pointer"
            >
              {t('goToLogin')}
            </button>
            <p className="text-xs text-outline">
              {t('redirectCountdown', { seconds: countdown })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
      <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />

      <div className="flex w-full h-full min-h-screen">
        {/* Left: Branding Panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }}></div>
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary opacity-20 rounded-full blur-3xl pointer-events-none"></div>
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
            <p className="text-[12px] text-white/60">
              Trusted by over 500+ top engineering leads.
            </p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-container-low">
          <div className="w-full max-w-[480px] bg-surface border border-outline-variant shadow-sm rounded-xl p-8">
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{t(error)}</span>
              </div>
            )}

            {/* Google Auth */}
            <button
              className="w-full h-12 flex items-center justify-center gap-2 bg-surface border border-outline-variant rounded-lg text-[14px] font-medium text-on-surface hover:bg-surface-container transition-colors mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={onGoogleSignUp}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              {t('googleButton')}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] flex-1 bg-outline-variant"></div>
              <span className="text-[12px] text-outline uppercase tracking-wider font-medium">{t('orRegisterWithEmail')}</span>
              <div className="h-[1px] flex-1 bg-outline-variant"></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="name">{t('nameLabel')}</label>
                <input
                  className={`w-full bg-surface border ${errors.name ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400`}
                  id="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {t(errors.name.message as string)}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="email">{t('emailLabel')}</label>
                <input
                  className={`w-full bg-surface border ${errors.email ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400`}
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {t(errors.email.message as string)}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="password">{t('passwordLabel')}</label>
                <div className="relative">
                  <input
                    className={`w-full bg-surface border ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    {...register('password')}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {t(errors.password.message as string)}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="confirmPassword">{t('confirmPasswordLabel')}</label>
                <div className="relative">
                  <input
                    className={`w-full bg-surface border ${errors.confirmPassword ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2.5 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
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

              {/* Submit */}
              <button
                className="w-full h-12 bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> {t('loadingButton')}
                  </span>
                ) : t('createAccountButton')}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-[14px] text-on-surface-variant">
                {t('alreadyHaveAccount')}{' '}
                <a className="text-[14px] font-medium text-primary hover:underline cursor-pointer" href="/login">
                  {t('signIn')}
                </a>
              </p>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-4">
                <a className="text-[12px] text-on-surface-variant hover:text-primary transition-colors" href="#">{t('termsOfService')}</a>
                <a className="text-[12px] text-on-surface-variant hover:text-primary transition-colors" href="#">{t('privacyPolicy')}</a>
              </div>
              <p className="text-[12px] text-outline">&copy; 2024 RAMP UP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
