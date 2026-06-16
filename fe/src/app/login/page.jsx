'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'mina@acme.dev',
      password: 'password123'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Giả lập đăng nhập thành công, chuyển hướng trong ứng dụng thực tế
      alert('Đăng nhập thành công với: ' + data.email);
    }, 800);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Đăng nhập qua Google thành công!');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex overflow-hidden w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Import Material Symbols Link dynamically if not loaded globally */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Split Layout Container */}
      <div className="flex w-full h-full min-h-screen">
        {/* Left Panel: Branding & Value Prop */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-12 relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%)' }}></div>
          <div className="relative z-10">
            <h1 className="text-[32px] font-bold text-white tracking-tight">RAMP UP</h1>
          </div>
          <div className="relative z-10 max-w-md">
            <h2 className="text-[24px] font-semibold text-white mb-2">Level up your engineering journey.</h2>
            <p className="text-[16px] text-white/80">Learn, Practice, Review.</p>
          </div>
          {/* Abstract Graphic Placeholder */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-96 h-96 rounded-full border border-white/20 opacity-20 pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/3 w-[30rem] h-[30rem] rounded-full border border-white/20 opacity-10 pointer-events-none"></div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-[#F8FAFC]">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-8">
            {/* Mobile Logo (hidden on desktop) */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">RAMP UP</h1>
              <p className="text-[14px] text-[#64748B] mt-1">Level up your engineering journey.</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-[20px] font-semibold text-[#0F172A]">Welcome back</h3>
              <p className="text-[14px] text-[#64748B] mt-1">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-[14px] font-medium text-[#64748B] mb-1" htmlFor="email">Email</label>
                <input 
                  className={`w-full bg-[#FFFFFF] border ${errors.email ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'} rounded-lg px-4 py-2 text-[16px] text-[#0F172A] focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400`} 
                  id="email" 
                  name="email" 
                  type="text" 
                  placeholder="Enter your email" 
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-[#ba1a1a] text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[14px] font-medium text-[#64748B] mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    className={`w-full bg-[#FFFFFF] border ${errors.password ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'} rounded-lg px-4 py-2 text-[16px] text-[#0F172A] focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400 pr-10`} 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {/* Toggle Visibility Icon */}
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A]" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#ba1a1a] text-[12px] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] bg-[#FFFFFF]" 
                    id="remember" 
                    name="remember" 
                    type="checkbox" 
                    defaultChecked
                  />
                  <label className="ml-2 block text-[14px] text-[#64748B] select-none" htmlFor="remember">Remember me</label>
                </div>
                <a className="text-[14px] font-medium text-[#2563EB] hover:underline" href="#">Forgot password?</a>
              </div>

              {/* Primary Actions */}
              <div className="pt-2 space-y-2">
                <button 
                  className="w-full bg-[#2563EB] text-white text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Loading…
                    </span>
                  ) : "Sign In"}
                </button>
                
                <button 
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] text-[14px] font-medium py-3 px-4 rounded-lg hover:bg-[#F8FAFC] transition-colors flex justify-center items-center gap-2" 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {/* Google Icon SVG */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-[#64748B]">
                Don't have an account? <a className="text-[14px] font-medium text-[#2563EB] hover:underline" href="#">Request access</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
