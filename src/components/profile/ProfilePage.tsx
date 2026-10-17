import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, DEFAULT_USER_PROFILE } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Building,
  CreditCard,
  SlidersHorizontal,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Bell,
  Palette,
  ExternalLink,
  ChevronRight,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../../utils/pricing';

const AVATAR_PALETTES = [
  { name: 'Forest Green', hex: '#2C3A2B', text: '#FFFFFF' },
  { name: 'Warm Ochre', hex: '#8B5A2B', text: '#FFFFFF' },
  { name: 'Sage Slate', hex: '#5A6B5C', text: '#FFFFFF' },
  { name: 'Terracotta', hex: '#9E4734', text: '#FFFFFF' },
  { name: 'Deep Navy', hex: '#1E2D3D', text: '#FFFFFF' },
  { name: 'Charcoal Olive', hex: '#2C2C1E', text: '#FFFFFF' },
  { name: 'Indigo Plum', hex: '#4A3B5A', text: '#FFFFFF' }
];

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile, resetUserProfile, userRole, savedBundles, budget } = useApp();

  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'address' | 'preferences'>('details');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const getInitials = (nameStr: string) => {
    const parts = (nameStr || '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (nameStr.slice(0, 2) || 'US').toUpperCase();
  };

  const handleLoadPreset = (presetName: 'vaishnavi' | 'tanmay') => {
    if (presetName === 'vaishnavi') {
      const preset: UserProfile = {
        name: 'Vaishnavi Goud',
        email: 'siripuramvaishnavi497@gmail.com',
        phone: '+91 98480 23456',
        roleTitle: 'Senior Systems & Bundle Architect',
        department: 'Enterprise Hardware Engineering',
        bio: 'Optimizing high-performance workstation product suites, hardware compatibility matrices, and budget constraints.',
        avatarColor: '#5A6B5C',
        address: 'Plot 48, Jubilee Hills Road No. 36',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India',
        preferredCurrency: 'INR',
        defaultBudget: 85000,
        optimizationPreference: 'best_value',
        emailAlerts: true,
        aiTips: true,
        compactView: false,
        memberSince: 'January 2024'
      };
      setFormData(preset);
      updateUserProfile(preset);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 3000);
    } else {
      setFormData(DEFAULT_USER_PROFILE);
      updateUserProfile(DEFAULT_USER_PROFILE);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Banner / Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E6E1D3] shadow-md p-6 sm:p-8">
        {/* Soft Background Accents */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: formData.avatarColor }}
        />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#A3B18A]/15 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Custom Color / Initials */}
          <div className="relative group">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center font-serif text-3xl sm:text-4xl font-bold tracking-tight shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: formData.avatarColor, color: '#FFFFFF' }}
            >
              {getInitials(formData.name)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-[#E6E1D3]">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* User Headline & Bio */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3A2B] tracking-tight">
                {formData.name || 'Your Name'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/20">
                {userRole ? `${userRole} mode` : 'Guest Session'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#F4F1EA] text-[#5A5A40] border border-[#E6E1D3]">
                Member since {formData.memberSince || '2024'}
              </span>
            </div>

            <p className="text-sm font-medium text-[#8B5A2B] mb-2">
              {formData.roleTitle} {formData.department ? `• ${formData.department}` : ''}
            </p>

            <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed max-w-2xl mb-4 line-clamp-2">
              {formData.bio || 'Add a personal description or merchandising focus notes.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 border-t border-[#E6E1D3]/80 text-xs">
              <div className="flex items-center gap-1.5 text-[#5A5A40]">
                <Mail className="w-3.5 h-3.5 text-[#8B8B7A]" />
                <span className="font-mono">{formData.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5A5A40]">
                <MapPin className="w-3.5 h-3.5 text-[#8B8B7A]" />
                <span>{formData.city}, {formData.country}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5A5A40]">
                <Briefcase className="w-3.5 h-3.5 text-[#8B8B7A]" />
                <span>{savedBundles.length} Saved Bundles</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-col gap-2 shrink-0 sm:self-center">
            <span className="text-[11px] font-bold text-[#7A7A68] uppercase tracking-wider text-center">
              Quick Switch Demo
            </span>
            <button
              type="button"
              onClick={() => handleLoadPreset('vaishnavi')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2C3A2B] text-white hover:bg-[#3A4D39] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Vaishnavi Goud</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('tanmay')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F4F1EA] text-[#2C3A2B] hover:bg-[#EAE5D9] transition-all cursor-pointer border border-[#E6E1D3] flex items-center justify-center gap-1.5"
            >
              <span>Tanmay Anand</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E6E1D3] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('details')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'details'
              ? 'bg-[#2C3A2B] text-white shadow-xs'
              : 'text-[#5A5A40] hover:bg-[#F4F1EA] hover:text-[#2C3A2B]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('address')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'address'
              ? 'bg-[#2C3A2B] text-white shadow-xs'
              : 'text-[#5A5A40] hover:bg-[#F4F1EA] hover:text-[#2C3A2B]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Shipping & Location</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'preferences'
              ? 'bg-[#2C3A2B] text-white shadow-xs'
              : 'text-[#5A5A40] hover:bg-[#F4F1EA] hover:text-[#2C3A2B]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Shopping & Budget Defaults</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SUBTAB 1: Personal & Identity */}
        {activeSubTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C3A2B]">Personal & Professional Details</h2>
              <p className="text-xs text-[#7A7A68]">Update your visible name, contact details, and role title across the platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Vaishnavi Goud"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="e.g. vaishnavi@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="e.g. +91 98480 23456"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
              </div>

              {/* Role / Headline */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Role Title / Headline
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={e => handleChange('roleTitle', e.target.value)}
                    placeholder="e.g. Lead Bundle Architect"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Department / Team
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => handleChange('department', e.target.value)}
                    placeholder="e.g. Merchandising, Enterprise Procurement, Student Workspace"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  placeholder="Share a short summary of your setup priorities, preferred tech categories, or budget targets."
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>

              {/* Avatar Theme Color */}
              <div className="sm:col-span-2 pt-2 border-t border-[#E6E1D3]/70">
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-2">
                  Avatar Theme Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PALETTES.map(p => {
                    const isSelected = formData.avatarColor.toLowerCase() === p.hex.toLowerCase();
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => handleChange('avatarColor', p.hex)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2C3A2B] bg-[#F4F1EA] shadow-xs scale-105 font-bold'
                            : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-[#2C2C1E]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: Shipping & Location */}
        {activeSubTab === 'address' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C3A2B]">Delivery & Shipping Address</h2>
              <p className="text-xs text-[#7A7A68]">This address is used for estimating landed delivery taxes and fulfillment charges.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="e.g. 42 Indiranagar 100ft Road"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value)}
                  placeholder="e.g. 560038"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                  placeholder="e.g. India"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: Shopping & Budget Defaults */}
        {activeSubTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C3A2B]">Shopping & Budget Preferences</h2>
              <p className="text-xs text-[#7A7A68]">Configure your default currency, budget baseline, and optimization behavior.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Default Budget */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Default Target Budget (INR ₹)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B7A]" />
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.defaultBudget}
                    onChange={e => handleChange('defaultBudget', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] font-mono focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                  />
                </div>
                <span className="text-[11px] text-[#7A7A68] mt-1 block">
                  Current configured: {formatINR(formData.defaultBudget)}
                </span>
              </div>

              {/* Preferred Currency */}
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Currency Standard
                </label>
                <select
                  value={formData.preferredCurrency}
                  onChange={e => handleChange('preferredCurrency', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-sm text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B]"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              {/* Optimization Strategy */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                  Default Bundle Optimization Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('optimizationPreference', 'best_value')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.optimizationPreference === 'best_value'
                        ? 'border-[#2C3A2B] bg-[#F4F1EA] shadow-xs ring-1 ring-[#2C3A2B]'
                        : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#2C3A2B] mb-0.5">Best Value (Balanced Quality)</div>
                    <div className="text-[11px] text-[#5A5A40] leading-snug">
                      Prioritizes higher specs, ergonomic grade, and features within your budget target.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('optimizationPreference', 'lowest_cost')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.optimizationPreference === 'lowest_cost'
                        ? 'border-[#2C3A2B] bg-[#F4F1EA] shadow-xs ring-1 ring-[#2C3A2B]'
                        : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#2C3A2B] mb-0.5">Lowest Landed Cost</div>
                    <div className="text-[11px] text-[#5A5A40] leading-snug">
                      Minimizes landed price while satisfying 100% of required slots and compatibility constraints.
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="sm:col-span-2 pt-3 border-t border-[#E6E1D3]/70 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailAlerts}
                    onChange={e => handleChange('emailAlerts', e.target.checked)}
                    className="w-4 h-4 rounded text-[#2C3A2B] focus:ring-[#2C3A2B]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#2C2C1E]">Budget & Compliance Alerts</div>
                    <div className="text-[11px] text-[#7A7A68]">Get notifications when bundle landed total exceeds budget ceiling.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aiTips}
                    onChange={e => handleChange('aiTips', e.target.checked)}
                    className="w-4 h-4 rounded text-[#2C3A2B] focus:ring-[#2C3A2B]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#2C2C1E]">Proactive AI Assistant Recommendations</div>
                    <div className="text-[11px] text-[#7A7A68]">Allow AI Assistant to suggest optimal item replacements as you browse.</div>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={resetUserProfile}
            className="px-4 py-2.5 rounded-xl border border-[#E6E1D3] text-xs font-semibold text-[#5A5A40] hover:bg-[#F4F1EA] hover:text-[#2C3A2B] transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {isSavedRecently && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-emerald-700 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Changes saved successfully!</span>
                </motion.span>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2C3A2B] hover:bg-[#3A4D39] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
