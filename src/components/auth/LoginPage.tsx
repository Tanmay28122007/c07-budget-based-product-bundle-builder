import React, { useState } from 'react';
import {
  PackagePlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
  DollarSign,
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
  Cpu,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

export const LoginPage: React.FC = () => {
  const { loginAs, addNotification } = useApp();

  const [email, setEmail] = useState('tanmay.anand@workspace.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = useState<'google' | 'facebook' | 'email' | 'guest' | null>(null);
  const [selectedDemoBudget, setSelectedDemoBudget] = useState<number>(65000);

  // Handle Google Login Flow
  const handleGoogleLogin = () => {
    setIsLoadingProvider('google');
    setTimeout(() => {
      loginAs('customer', 'google');
      setIsLoadingProvider(null);
    }, 600);
  };

  // Handle Facebook Login Flow
  const handleFacebookLogin = () => {
    setIsLoadingProvider('facebook');
    setTimeout(() => {
      loginAs('customer', 'facebook');
      setIsLoadingProvider(null);
    }, 600);
  };

  // Handle Email Sign In
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProvider('email');
    setTimeout(() => {
      loginAs('customer', 'email');
      setIsLoadingProvider(null);
    }, 500);
  };

  // Handle Instant Guest Access
  const handleGuestLogin = () => {
    setIsLoadingProvider('guest');
    setTimeout(() => {
      loginAs('customer', 'guest');
      setIsLoadingProvider(null);
    }, 300);
  };

  // Handle Admin Access
  const handleAdminLogin = () => {
    loginAs('admin', 'email');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E] relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#A3B18A]/15 blur-3xl pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-[#8B5A2B]/10 blur-3xl pointer-events-none -z-10 animate-float-reverse" />
      <div className="fixed -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full bg-[#2C3A2B]/10 blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#E6E1D3]/80 bg-white/70 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center shadow-md ring-1 ring-[#E6E1D3] transition-transform hover:scale-105 hover:rotate-3">
              <PackagePlus className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2C3A2B]">
                  Bundlemate
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                  Budget Bundle Builder
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A68] hidden sm:block font-medium">
                Deterministic Compatibility & Landed Price Engine
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdminLogin}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] transition-colors cursor-pointer border border-transparent hover:border-[#E6E1D3]"
              title="Access Admin Overview, Test Suites, and MBA Insights"
            >
              <Cpu className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>Admin Demo</span>
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={isLoadingProvider !== null}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#2C3A2B] hover:bg-[#1E281D] text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Explore as Guest</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Authentication Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Sign In Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start order-2 lg:order-1">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-[#E6E1D3] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#2C3A2B]/5 relative">
              
              {/* Subtle accent badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3] mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Social Sign In</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3A2B] tracking-tight leading-tight">
                Welcome to Bundlemate
              </h1>
              <p className="text-xs sm:text-sm text-[#6A6A54] mt-1.5 mb-6 leading-relaxed">
                Sign in with Google or Facebook to configure custom bundles, check real-time compatibility, and stay within your budget.
              </p>

              {/* Social Login Options */}
              <div className="space-y-3">
                {/* 1. Continue with Google Button */}
                <button
                  type="button"
                  id="btn-login-google"
                  onClick={handleGoogleLogin}
                  disabled={isLoadingProvider !== null}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#F9F8F5] border-2 border-[#E6E1D3] hover:border-[#4285F4]/60 text-[#2C2C1E] font-semibold text-sm shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoadingProvider === 'google' ? (
                    <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="tracking-tight">
                    {isLoadingProvider === 'google' ? 'Authenticating with Google...' : 'Continue with Google'}
                  </span>
                </button>

                {/* 2. Continue with Facebook Button */}
                <button
                  type="button"
                  id="btn-login-facebook"
                  onClick={handleFacebookLogin}
                  disabled={isLoadingProvider !== null}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoadingProvider === 'facebook' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0 fill-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span className="tracking-tight">
                    {isLoadingProvider === 'facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E6E1D3]" />
                </div>
                <div className="relative bg-white/90 px-3 text-[11px] font-bold text-[#8B8B7A] uppercase tracking-wider">
                  or sign in with email
                </div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8B8B7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="shopper@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-xs sm:text-sm text-[#2C2C1E] focus:outline-none focus:border-[#2C3A2B] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="text-[11px] text-[#8B5A2B] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8B8B7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-xs sm:text-sm text-[#2C2C1E] focus:outline-none focus:border-[#2C3A2B] transition-colors"
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  id="btn-login-email"
                  disabled={isLoadingProvider !== null}
                  className="w-full py-3 rounded-2xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoadingProvider === 'email' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In & Open Catalogue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest / Demo Option & Admin Access */}
              <div className="mt-5 pt-4 border-t border-[#E6E1D3] flex flex-col gap-2.5 text-center">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-xs font-semibold text-[#8B5A2B] hover:text-[#5C3B1C] transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Prefer guest access? Continue without credentials</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7A68]">
                  <span>Project Evaluator?</span>
                  <button
                    type="button"
                    onClick={handleAdminLogin}
                    className="font-bold text-[#2C3A2B] hover:underline cursor-pointer"
                  >
                    Switch to Administrator Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Trust highlights below card */}
            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#7A7A68]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure OAuth 2.0
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Redirection
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#8B5A2B]" /> INR Pricing
              </span>
            </div>
          </div>

          {/* Right Column: Dynamic Feature & Budget Showcase */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
            
            {/* Main Value Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2C3A2B]/10 text-[#2C3A2B] mb-3">
                <Zap className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Next-Gen E-Commerce Bundle Optimizer</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2C3A2B] tracking-tight leading-[1.15]">
                Smart Bundles. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2C3A2B] via-[#8B5A2B] to-[#5C3B1C]">
                  Guaranteed Compatibility.
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#5A5A40] max-w-xl leading-relaxed">
                Experience automated product bundle engineering. Input your budget and our deterministic engine pairs ergonomic desks, chairs, monitors, and peripherals with 100% verified compatibility and landed price transparency.
              </p>
            </div>

            {/* Interactive Live Demo Preview Card */}
            <div className="bg-white/95 rounded-3xl border border-[#E6E1D3] p-5 sm:p-6 shadow-xl shadow-[#2C3A2B]/5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E6E1D3] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2C3A2B]">
                    Live Bundle Optimizer Simulation
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8B8B7A]">
                  Work From Home Benchmark
                </span>
              </div>

              {/* Budget Quick-Picker */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#5A5A40]">Target Budget Threshold:</span>
                  <span className="font-mono font-bold text-sm text-[#2C3A2B]">
                    {formatINR(selectedDemoBudget)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[35000, 65000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedDemoBudget(amt)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedDemoBudget === amt
                          ? 'bg-[#2C3A2B] text-white shadow-xs'
                          : 'bg-[#F4F1EA] text-[#5A5A40] hover:bg-[#EAE5D9]'
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Bundle Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E1D3] mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8B8B7A]">Subtotal</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#2C2C1E] mt-0.5">
                    {formatINR(Math.round(selectedDemoBudget * 0.78))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8B8B7A]">GST (18%)</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#2C2C1E] mt-0.5">
                    {formatINR(Math.round(selectedDemoBudget * 0.78 * 0.18))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8B8B7A]">Shipping</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700 mt-0.5">
                    FREE
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B]">Landed Cost</div>
                  <div className="text-xs sm:text-sm font-mono font-extrabold text-[#8B5A2B] mt-0.5">
                    {formatINR(Math.round(selectedDemoBudget * 0.92))}
                  </div>
                </div>
              </div>

              {/* Verified Product Slots Chips */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] flex items-center justify-between">
                  <span>Engine Selected Products (Zero Conflicts)</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Compatible
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'ErgoPro High-Back Mesh Chair',
                    'Solid Teak Studio Work Desk (140cm)',
                    'UltraSharp 27" 4K IPS Monitor',
                    'Silent Wireless Keyboard & Mouse Combo',
                    'Multi-Port Thunderbolt 4 Dock'
                  ].map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive CTA to dive in */}
              <div className="mt-5 pt-4 border-t border-[#E6E1D3] flex items-center justify-between">
                <span className="text-xs text-[#7A7A68]">
                  Ready to configure your own custom bundle?
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2C3A2B] text-white hover:bg-[#1E281D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start with Google</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/70 border border-[#E6E1D3] backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#2C2C1E]">
                  Deterministic Checking
                </h3>
                <p className="text-[11px] text-[#7A7A68] mt-1 leading-relaxed">
                  Every product compatibility rule is evaluated instantaneously with zero false-positives.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#E6E1D3] backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-2">
                  <Percent className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#2C2C1E]">
                  Landed Price Math
                </h3>
                <p className="text-[11px] text-[#7A7A68] mt-1 leading-relaxed">
                  Full visibility of GST (18%), tier shipping, weight surcharges, and order discounts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#E6E1D3] backdrop-blur-xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#2C2C1E]">
                  Smart Add-On Matching
                </h3>
                <p className="text-[11px] text-[#7A7A68] mt-1 leading-relaxed">
                  Recommends compatible accessories to maximize budget without crossing spending limits.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E6E1D3]/80 bg-white/50 backdrop-blur-md py-6 text-center text-xs text-[#8B8B7A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2C3A2B]">Bundlemate</span>
            <span>•</span>
            <span>C07 Budget-Based Product Bundle Builder</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Google & Facebook OAuth Enabled</span>
            <span>•</span>
            <span>Deterministic Engine</span>
            <span>•</span>
            <button
              onClick={handleAdminLogin}
              className="text-[#8B5A2B] hover:underline cursor-pointer font-medium"
            >
              Evaluator Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
