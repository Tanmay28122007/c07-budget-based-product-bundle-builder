import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const SignInDashboard: React.FC = () => {
  const { loginAs, adminSignInRequested, setAdminSignInRequested } = useApp();

  // Active view: 'selection' (the 2 panels from screenshot) | 'customer' | 'admin'
  const [activeView, setActiveView] = useState<'selection' | 'customer' | 'admin'>(() => {
    return adminSignInRequested ? 'admin' : 'selection';
  });

  // Customer Form State
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'signup'>('login');
  const [customerId, setCustomerId] = useState('shopper@workspace.com');
  const [customerPassword, setCustomerPassword] = useState('password123');
  const [customerName, setCustomerName] = useState('Tanmay Anand');
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState('password123');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [customerError, setCustomerError] = useState('');

  // Admin Form State
  const [adminId, setAdminId] = useState('admin@workspace.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');

    if (!customerId.trim()) {
      setCustomerError('Please enter your Customer ID or Email.');
      return;
    }
    if (!customerPassword.trim()) {
      setCustomerError('Please enter your password.');
      return;
    }
    if (customerAuthMode === 'signup') {
      if (!customerName.trim()) {
        setCustomerError('Please enter your full name.');
        return;
      }
      if (customerPassword !== customerConfirmPassword) {
        setCustomerError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      loginAs('customer');
    }, 250);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminId.trim()) {
      setAdminError('Please enter your Admin ID or Email.');
      return;
    }
    if (!adminPassword.trim()) {
      setAdminError('Please enter your admin password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAdminSignInRequested(false);
      loginAs('admin');
    }, 250);
  };

  const handleQuickDemoCustomer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      loginAs('customer');
    }, 200);
  };

  const handleQuickDemoAdmin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAdminSignInRequested(false);
      loginAs('admin');
    }, 200);
  };

  return (
    <div className="py-6 sm:py-14 flex flex-col items-center justify-center min-h-[75vh]">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* VIEW 1: THE EXACT 2 PANELS AT STARTING (CUSTOMER AND ADMIN)               */}
        {/* ========================================================================= */}
        {activeView === 'selection' && (
          <motion.section
            key="selection"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-center w-full max-w-4xl mx-auto px-4 relative"
          >
            {/* Centered Brand Emblem Logo with rich hover effect */}
            <motion.div
              whileHover={{ scale: 1.12, rotate: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="group/logo w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2C3A2B] hover:bg-[#384A37] text-white flex items-center justify-center mx-auto mb-6 shadow-md hover:shadow-2xl hover:shadow-[#2C3A2B]/30 border border-[#E6E1D3] hover:border-amber-200/50 transition-all duration-300 cursor-pointer"
            >
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-amber-100 group-hover/logo:scale-115 transition-transform duration-300" />
            </motion.div>

            {/* Serif Hero Title & Subtitle with subtle hover response */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C1E] hover:text-[#8B5A2B] transition-colors duration-300 mb-3 cursor-default">
              Budget Based Product Bundle Builder
            </h1>
            <p className="text-[#5A5A40] hover:text-[#2C2C1E] transition-colors duration-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed cursor-default">
              Welcome to the Budget-Based Product Bundle Builder. Please select your login to continue.
            </p>

            {/* Two Side-by-Side Panels: Customer & Admin with punchy hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10 text-left">
              {/* Panel 1: Customer */}
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                onClick={() => {
                  setCustomerError('');
                  setActiveView('customer');
                }}
                className="group relative bg-white border border-[#E6E1D3] hover:border-[#2C3A2B] hover:ring-4 hover:ring-[#2C3A2B]/15 rounded-[32px] p-8 sm:p-9 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(44,58,43,0.30)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Decorative top-right quarter arc with scale animation */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5EC]/90 rounded-bl-[120px] pointer-events-none transition-transform duration-500 group-hover:scale-140 group-hover:bg-[#EAE4D5]" />

                <div className="relative z-10">
                  {/* User Icon Box with rotate & scale on card hover */}
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#2C2C1E] flex items-center justify-center mb-6 border border-[#E6E1D3] shadow-xs group-hover:bg-[#2C3A2B] group-hover:text-white group-hover:scale-115 group-hover:-rotate-6 group-hover:shadow-md transition-all duration-300">
                    <User className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C1E] group-hover:text-[#2C3A2B] transition-colors duration-200">
                      Customer
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3] group-hover:bg-[#2C3A2B] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      SHOPPER
                    </span>
                  </div>

                  <p className="text-[#5A5A40] group-hover:text-[#2C2C1E] transition-colors duration-200 text-sm leading-relaxed mb-8">
                    Access live bundles, check hardware compatibility, and optimize budget for your workstation.
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomerError('');
                      setActiveView('customer');
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#2C3A2B] group-hover:bg-[#1E281D] group-hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md group-hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <span>LOGIN AS CUSTOMER</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>

              {/* Panel 2: Admin */}
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                onClick={() => {
                  setAdminError('');
                  setActiveView('admin');
                }}
                className="group relative bg-white border border-[#E6E1D3] hover:border-[#8B5A2B] hover:ring-4 hover:ring-[#8B5A2B]/15 rounded-[32px] p-8 sm:p-9 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(139,90,43,0.30)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Decorative top-right quarter arc with scale animation */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5EC]/90 rounded-bl-[120px] pointer-events-none transition-transform duration-500 group-hover:scale-140 group-hover:bg-[#EAE4D5]" />

                <div className="relative z-10">
                  {/* Shield Icon Box with rotate & scale on card hover */}
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#2C2C1E] flex items-center justify-center mb-6 border border-[#E6E1D3] shadow-xs group-hover:bg-[#8B5A2B] group-hover:text-white group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-md transition-all duration-300">
                    <ShieldCheck className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2C1E] group-hover:text-[#8B5A2B] transition-colors duration-200">
                      Admin
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3] group-hover:bg-[#8B5A2B] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      MANAGER
                    </span>
                  </div>

                  <p className="text-[#5A5A40] group-hover:text-[#2C2C1E] transition-colors duration-200 text-sm leading-relaxed mb-8">
                    Admin login to manage catalog records, review automated test suites, and audit landed economics.
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdminError('');
                      setActiveView('admin');
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#8B5A2B] group-hover:bg-[#724822] group-hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md group-hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <span>LOGIN AS ADMIN</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DEDICATED CUSTOMER SIGN IN SCREEN                                 */}
        {/* ========================================================================= */}
        {activeView === 'customer' && (
          <motion.div
            key="customer"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E6E1D3] rounded-[32px] p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-left"
          >
            {/* Top right decorative arc watermark */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5F5EC] rounded-bl-[120px] pointer-events-none -z-0" />

            {/* Back to selection close button */}
            <button
              onClick={() => {
                setActiveView('selection');
                setCustomerError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F4F1EA] text-[#8A8A88] hover:text-[#2C2C1E] transition-colors cursor-pointer z-10"
              aria-label="Back to selection"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center mb-5 shadow-sm border border-[#E6E1D3]">
                <UserCheck className="w-7 h-7 text-amber-200" />
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="font-serif text-3xl font-bold text-[#2C3A2B] tracking-tight">
                  Customer Sign In
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]">
                  Shopper
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Enter your Customer ID & password to access your customized workstation workspace.
              </p>

              {/* Quick 1-Click Demo Access */}
              <div className="mt-4 p-3 rounded-xl bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#2C3A2B] font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="truncate">Demo: Tanmay Anand</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoCustomer}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 rounded-lg bg-[#2C3A2B] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#1E281D] cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Quick Sign In
                </button>
              </div>

              {/* Sub-mode toggle: Sign In vs Sign Up */}
              <div className="flex items-center justify-between text-xs pt-4 border-t border-[#E6E1D3] mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerAuthMode('login');
                    setCustomerError('');
                  }}
                  className={`font-bold pb-1 cursor-pointer transition-colors border-b-2 ${
                    customerAuthMode === 'login'
                      ? 'border-[#2C3A2B] text-[#2C3A2B]'
                      : 'border-transparent text-[#8B8B7A] hover:text-[#2C2C1E]'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerAuthMode('signup');
                    setCustomerError('');
                  }}
                  className={`font-bold pb-1 cursor-pointer transition-colors border-b-2 ${
                    customerAuthMode === 'signup'
                      ? 'border-[#2C3A2B] text-[#2C3A2B]'
                      : 'border-transparent text-[#8B8B7A] hover:text-[#2C2C1E]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCustomerSubmit} className="mt-4 space-y-3.5">
                {customerError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{customerError}</span>
                  </div>
                )}

                {customerAuthMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Tanmay Anand"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                    Customer ID or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                    <input
                      type="text"
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      placeholder="shopper@workspace.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                    <input
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={e => setCustomerPassword(e.target.value)}
                      placeholder="Enter customer password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A88] hover:text-[#2C2C1E] transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {customerAuthMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                      <input
                        type={showCustomerPassword ? 'text' : 'password'}
                        value={customerConfirmPassword}
                        onChange={e => setCustomerConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer mt-3 disabled:opacity-50"
                >
                  <span>{customerAuthMode === 'login' ? 'LOG IN TO CUSTOMER PORTAL' : 'CREATE ACCOUNT & SIGN IN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('selection');
                    setCustomerError('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#8B8B7A] hover:text-[#2C2C1E] transition-colors cursor-pointer text-center"
                >
                  ← Back to Selection
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: DEDICATED ADMIN SIGN IN SCREEN                                    */}
        {/* ========================================================================= */}
        {activeView === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E6E1D3] rounded-[32px] p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-left"
          >
            {/* Top right decorative arc watermark */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5F5EC] rounded-bl-[120px] pointer-events-none -z-0" />

            {/* Back to selection close button */}
            <button
              onClick={() => {
                setActiveView('selection');
                setAdminSignInRequested(false);
                setAdminError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F4F1EA] text-[#8A8A88] hover:text-[#2C2C1E] transition-colors cursor-pointer z-10"
              aria-label="Back to selection"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-[#8B5A2B] text-white flex items-center justify-center mb-5 shadow-sm border border-[#E6E1D3]">
                <ShieldCheck className="w-7 h-7 text-amber-200" />
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="font-serif text-3xl font-bold text-[#2C3A2B] tracking-tight">
                  Admin Sign In
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3]">
                  Manager
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Enter your administrator credentials to access the workspace.
              </p>

              {/* Quick 1-Click Demo Admin */}
              <div className="mt-4 p-3 rounded-xl bg-[#F4F1EA] border border-[#E6E1D3] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#8B5A2B] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5A2B] shrink-0" />
                  <span className="truncate">Demo: Manager</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 rounded-lg bg-[#8B5A2B] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#724822] cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Quick Sign In
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                    Admin ID or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                    <input
                      type="text"
                      value={adminId}
                      onChange={e => setAdminId(e.target.value)}
                      placeholder="admin@workspace.com or ADMIN-01"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A88] hover:text-[#2C2C1E] transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#8B5A2B] hover:bg-[#724822] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer mt-3 disabled:opacity-50"
                >
                  <span>SIGN IN AS ADMIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('selection');
                    setAdminSignInRequested(false);
                    setAdminError('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#8B8B7A] hover:text-[#2C2C1E] transition-colors cursor-pointer text-center"
                >
                  ← Back to Selection
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
