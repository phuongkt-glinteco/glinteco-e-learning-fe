'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { authLoginRequestSchema, type AuthLoginInput } from '@/schemas';
import {postAuthLogin, postAuthGoogle} from '@/services/api-client';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';

export default function LoginPage() {
  const t = useTranslations('LoginPage');

  const { register, handleSubmit, formState: { errors } } = useForm<AuthLoginInput>({
    resolver: zodResolver(authLoginRequestSchema),
    defaultValues: {
      email: 'mina@acme.dev',
      password: 'password123',
      rememberMe: true
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: AuthLoginInput) => {
    setLoading(true);
    try {
      await postAuthLogin({
            body: data,
            throwOnError: true,
          });
    }
    catch (error) {
      console.error('Login error:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async (idToken: string) => {

    setLoading(true);
    try {
      await postAuthGoogle({
        body: { idToken },
        throwOnError: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
       
  };


  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full font-sans relative">
      <LanguageToggle size="md" className="hidden md:block absolute top-6 right-6 z-20 border-outline" />


      <div className="flex w-full h-full min-h-screen">
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }}></div>
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
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-96 h-96 rounded-full border border-white/20 opacity-20 pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/3 w-[30rem] h-[30rem] rounded-full border border-white/20 opacity-10 pointer-events-none"></div>
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

            <div className="mb-8">
              <h3 className="text-[20px] font-semibold text-on-surface">{t('welcomeBack')}</h3>
              <p className="text-[14px] text-on-surface-variant mt-1">{t('signInPrompt')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="email">{t('emailLabel')}</label>
                <input
                  className={`w-full bg-surface border ${errors.email ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400`}
                  id="email"
                  type="text"
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {t(errors.email.message as any)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1" htmlFor="password">{t('passwordLabel')}</label>
                <div className="relative">
                  <input
                    className={`w-full bg-surface border ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline focus:border-primary focus:ring-primary'} rounded-lg px-4 py-2 text-[16px] text-on-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('passwordPlaceholder')}
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
                  <p className="text-error text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {t(errors.password.message as any)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-outline text-primary focus:ring-primary bg-surface"
                    id="remember"
                    type="checkbox"
                    {...register('rememberMe')}
                  />
                  <label className="ml-2 block text-[14px] text-on-surface-variant select-none" htmlFor="remember">{t('rememberMe')}</label>
                </div>
                <a className="text-[14px] font-medium text-primary hover:underline" href="#">{t('forgotPassword')}</a>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  className="w-full bg-primary text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> {t('loadingButton')}
                    </span>
                  ) : t('signInButton')}
                </button>

                <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]">
                  <GoogleLoginButton onSuccess={onGoogleSignIn} title={t('googleButton')} />
                </div>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-on-surface-variant">
                {t('noAccount')}{' '}
                <a className="text-[14px] font-medium text-primary hover:underline" href="#">
                  {t('requestAccess')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
    </div>
  );
}
