import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { loginAs } = useApp();

  // Active view: 'select' | 'customer-login' | 'admin-login'
  const [activeView, setActiveView] = useState<'select' | 'customer-login' | 'admin-login'>('select');

  // Customer Credentials
  const [customerId, setCustomerId] = useState('shopper@workspace.com');
  const [customerPassword, setCustomerPassword] = useState('password123');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [customerError, setCustomerError] = useState('');

  // Admin Credentials
  const [adminId, setAdminId] = useState('admin@workspace.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) {
      setCustomerError('Please enter your Customer ID or Email.');
      return;
    }
    if (!customerPassword.trim()) {
      setCustomerError('Please enter your password.');
      return;
    }
    loginAs('customer');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim()) {
      setAdminError('Please enter your Admin ID or Email.');
      return;
    }
    if (!adminPassword.trim()) {
      setAdminError('Please enter your admin password.');
      return;
    }
    loginAs('admin');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col justify-center items-center selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E] relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Soft Organic Ambient Background Circles */}
      <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-[#A3B18A]/12 blur-3xl pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed bottom-16 right-10 w-96 h-96 rounded-full bg-[#8B5A2B]/8 blur-3xl pointer-events-none -z-10 animate-float-reverse" />
      <div className="fixed top-1/2 right-1/3 w-80 h-80 rounded-full bg-[#F5F5EC] blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <AnimatePresence mode="wait">
        {activeView === 'select' && (
          <motion.div
            key="select-role"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto text-center"
          >
            {/* Top Brand Logo Box */}
            <motion.div
              initial={{ scale: 0.8, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center mx-auto mb-6 shadow-lg border border-[#E6E1D3] animate-fab-float"
            >
              <Package className="w-8 h-8 text-amber-100" />
            </motion.div>

            {/* Title & Subtitle */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2C3A2B] mb-3"
            >
              Budget Based Product Bundle Builder
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#5A5A40] text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            >
              Welcome to the Budget-Based Product Bundle Builder. Please select your login to continue.
            </motion.p>

            {/* Two Login Cards: Customer and Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10 text-left">
              {/* Card 1: Customer */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.015 }}
                onClick={() => {
                  setCustomerError('');
                  setActiveView('customer-login');
                }}
                className="group relative bg-white border border-[#E6E1D3] rounded-[28px] p-8 sm:p-9 shadow-sm hover:shadow-[0_28px_60px_-12px_rgba(44,58,43,0.28)] transition-all duration-300 overflow-hidden cursor-pointer hover:border-[#2C3A2B] flex flex-col justify-between"
              >
                {/* Organic curved shape in top-right */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5EC]/90 rounded-bl-[120px] pointer-events-none transition-transform duration-500 group-hover:scale-125 group-hover:bg-[#EBE5D6]" />

                <div>
                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#2C3A2B] flex items-center justify-center mb-6 border border-[#E6E1D3] shadow-xs group-hover:bg-[#2C3A2B] group-hover:text-white transition-all duration-300">
                    <UserCheck className="w-7 h-7" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3A2B] group-hover:text-[#2C3A2B] transition-colors">
                      Customer
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3] group-hover:bg-[#8B5A2B] group-hover:text-white transition-all">
                      SHOPPER
                    </span>
                  </div>

                  <p className="text-[#5A5A40] text-sm leading-relaxed mb-6 group-hover:text-[#2C2C1E] transition-colors">
                    Access live bundles, check hardware compatibility, and optimize budget for your workstation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerError('');
                    setActiveView('customer-login');
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer group/btn"
                >
                  <span>LOGIN AS CUSTOMER</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
                </button>
              </motion.div>

              {/* Card 2: Admin */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.015 }}
                onClick={() => {
                  setAdminError('');
                  setActiveView('admin-login');
                }}
                className="group relative bg-white border border-[#E6E1D3] rounded-[28px] p-8 sm:p-9 shadow-sm hover:shadow-[0_28px_60px_-12px_rgba(139,90,43,0.28)] transition-all duration-300 overflow-hidden cursor-pointer hover:border-[#8B5A2B] flex flex-col justify-between"
              >
                {/* Organic curved shape in top-right */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5EC]/90 rounded-bl-[120px] pointer-events-none transition-transform duration-500 group-hover:scale-125 group-hover:bg-[#EBE5D6]" />

                <div>
                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#2C3A2B] flex items-center justify-center mb-6 border border-[#E6E1D3] shadow-xs group-hover:bg-[#8B5A2B] group-hover:text-white transition-all duration-300">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors">
                      Admin
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3] group-hover:bg-[#2C3A2B] group-hover:text-white transition-all">
                      MANAGER
                    </span>
                  </div>

                  <p className="text-[#5A5A40] text-sm leading-relaxed mb-6 group-hover:text-[#2C2C1E] transition-colors">
                    Admin login to manage catalog records, review automated test suites, and audit landed economics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdminError('');
                    setActiveView('admin-login');
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#8B5A2B] hover:bg-[#724822] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer group/btn"
                >
                  <span>LOGIN AS ADMIN</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Customer Sign In Form */}
        {activeView === 'customer-login' && (
          <motion.div
            key="customer-signin"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E6E1D3] rounded-[32px] p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-left"
          >
            {/* Top right decorative arc watermark */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5F5EC] rounded-bl-[120px] pointer-events-none -z-0" />

            {/* Back to selection close button */}
            <button
              onClick={() => setActiveView('select')}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F4F1EA] text-[#8A8A88] hover:text-[#2C2C1E] transition-colors cursor-pointer z-10"
              aria-label="Back to role selection"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center mb-5 shadow-sm border border-[#E6E1D3]">
                <UserCheck className="w-7 h-7 text-amber-200" />
              </div>

              <h2 className="font-serif text-3xl font-bold text-[#2C2C1E] tracking-tight mb-2">
                Customer Sign In
              </h2>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Enter your Customer ID & password to access your customized workstation workspace.
              </p>

              {/* Form */}
              <form onSubmit={handleCustomerSubmit} className="mt-6 space-y-4">
                {customerError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{customerError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                    CUSTOMER ID OR EMAIL
                  </label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    placeholder="shopper@workspace.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={e => setCustomerPassword(e.target.value)}
                      placeholder="Enter customer password"
                      required
                      className="w-full pl-4 pr-10 py-3 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A88] hover:text-[#2C2C1E] transition-colors p-1 cursor-pointer"
                    >
                      {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer mt-5"
                >
                  <span>LOG IN TO CUSTOMER PORTAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('select')}
                  className="w-full py-2 text-xs font-semibold text-[#8B8B7A] hover:text-[#2C2C1E] transition-colors cursor-pointer text-center block"
                >
                  ← Back to Selection
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Admin Sign In Form */}
        {activeView === 'admin-login' && (
          <motion.div
            key="admin-signin"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E6E1D3] rounded-[32px] p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-left"
          >
            {/* Top right decorative arc watermark */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5F5EC] rounded-bl-[120px] pointer-events-none -z-0" />

            {/* Back to selection close button */}
            <button
              onClick={() => setActiveView('select')}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F4F1EA] text-[#8A8A88] hover:text-[#2C2C1E] transition-colors cursor-pointer z-10"
              aria-label="Back to role selection"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-[#2C3A2B] text-white flex items-center justify-center mb-5 shadow-sm border border-[#E6E1D3]">
                <ShieldCheck className="w-7 h-7 text-amber-200" />
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="font-serif text-3xl font-bold text-[#2C2C1E] tracking-tight">
                  Admin Sign In
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#2C3A2B] border border-[#E6E1D3]">
                  MANAGER
                </span>
              </div>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                Enter your administrator credentials to access the workspace, tests, and MBA insights.
              </p>

              {/* Form */}
              <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4">
                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                    ADMIN ID OR EMAIL
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                    placeholder="admin@workspace.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                      className="w-full pl-4 pr-10 py-3 bg-white border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] placeholder-[#8A8A88] focus:border-[#2C3A2B] focus:ring-2 focus:ring-[#2C3A2B]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A88] hover:text-[#2C2C1E] transition-colors p-1 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#8B5A2B] hover:bg-[#724822] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer mt-5"
                >
                  <span>SIGN IN AS ADMIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('select')}
                  className="w-full py-2 text-xs font-semibold text-[#8B8B7A] hover:text-[#2C2C1E] transition-colors cursor-pointer text-center block"
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
