import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
  Sparkles,
  User,
  SlidersHorizontal,
  Save,
  Check,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

interface ProfileData {
  name: string;
  initials: string;
  email: string;
  phone: string;
  roleTitle: string;
  department: string;
  location: string;
  bio: string;
  memberSince: string;
  addressLine1: string;
  pinCode: string;
  city: string;
  state: string;
  defaultBudget: number;
}

const DEMO_PROFILES: Record<string, ProfileData> = {
  tanmay: {
    name: 'Tanmay Anand',
    initials: 'TA',
    email: 'tanmay.anand@craftbundle.io',
    phone: '+91 98765 43210',
    roleTitle: 'Lead Bundle Architect',
    department: 'Product & Merchandising',
    location: 'Bengaluru, India',
    bio: 'Specializing in budget-optimized workspace bundles, landed cost analytics, and AI recommendations.',
    memberSince: 'March 2024',
    addressLine1: 'Prestige Tech Park, Outer Ring Road, Kadubeesanahalli',
    pinCode: '560103',
    city: 'Bengaluru',
    state: 'Karnataka',
    defaultBudget: 5000
  },
  vaishnavi: {
    name: 'Vaishnavi Goud',
    initials: 'VG',
    email: 'vaishnavi.goud@craftbundle.io',
    phone: '+91 91234 56789',
    roleTitle: 'Senior UX & Merchandising Specialist',
    department: 'Design & Customer Experience',
    location: 'Hyderabad, India',
    bio: 'Pioneering ergonomic desk accessories, multi-slot constraint workflows, and human-centered design for e-commerce workspaces.',
    memberSince: 'January 2024',
    addressLine1: 'HITEC City, Madhapur, Cyberabad',
    pinCode: '500081',
    city: 'Hyderabad',
    state: 'Telangana',
    defaultBudget: 4500
  }
};

export const ProfilePage: React.FC = () => {
  const { savedBundles, budget, setBudget, addNotification } = useApp();

  const [activeTab, setProfileTab] = useState<'identity' | 'shipping' | 'defaults'>('identity');
  const [currentProfileKey, setCurrentProfileKey] = useState<'tanmay' | 'vaishnavi'>('tanmay');
  const [formData, setFormData] = useState<ProfileData>(DEMO_PROFILES.tanmay);
  const [isSaved, setIsSaved] = useState(false);

  const handleSwitchProfile = (key: 'tanmay' | 'vaishnavi') => {
    setCurrentProfileKey(key);
    setFormData(DEMO_PROFILES[key]);
    setIsSaved(false);
    addNotification('Profile Switched', `Active demo profile switched to ${DEMO_PROFILES[key].name}`, 'info');
  };

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.defaultBudget && formData.defaultBudget !== budget) {
      setBudget(Number(formData.defaultBudget));
    }
    setIsSaved(true);
    addNotification('Profile Updated', 'Your personal and professional details have been updated.', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Profile Hero Card */}
      <div className="bg-gradient-to-r from-white via-white to-[#F7F5EE] rounded-[28px] border border-[#E6E1D3] p-6 sm:p-8 shadow-xs relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Square Avatar with Verification Shield */}
            <div className="relative shrink-0">
              <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-[#222E23] text-white flex items-center justify-center font-serif text-3xl sm:text-4xl font-bold shadow-sm">
                {formData.initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#A7F3D0] text-emerald-600 flex items-center justify-center shadow-xs"
                title="Verified Customer Account"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* User Title & Meta */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3A2B] tracking-tight">
                  {formData.name}
                </h1>
                <span className="bg-[#F5EFE9] text-[#935828] font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded font-mono uppercase">
                  CUSTOMER MODE
                </span>
                <span className="bg-[#F4F1EA] text-[#7A7A65] text-xs px-3 py-0.5 rounded-full font-medium">
                  Member since {formData.memberSince}
                </span>
              </div>

              <div className="text-sm font-semibold text-[#8B5A2B]">
                {formData.roleTitle} • {formData.department}
              </div>

              <p className="text-xs text-[#5A5A40] max-w-xl leading-relaxed">
                {formData.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#5A5A40]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8B8B7A]" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8B8B7A]" />
                  <span>{formData.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#8B8B7A]" />
                  <span>{savedBundles.length} Saved Bundles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Switch Demo Block on Right */}
          <div className="shrink-0 flex flex-col items-start lg:items-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E6E1D3]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B7A] mb-2 font-mono">
              QUICK SWITCH DEMO
            </span>
            <div className="flex flex-row lg:flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleSwitchProfile('vaishnavi')}
                className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  currentProfileKey === 'vaishnavi'
                    ? 'bg-[#222E23] text-white ring-2 ring-[#222E23]/40'
                    : 'bg-[#222E23] text-white hover:bg-[#182219]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Vaishnavi Goud</span>
              </button>

              <button
                onClick={() => handleSwitchProfile('tanmay')}
                className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  currentProfileKey === 'tanmay'
                    ? 'bg-[#EAE5D9] text-[#2C2C1E] border-[#222E23] font-bold shadow-inner'
                    : 'bg-[#F4F1EA] text-[#2C2C1E] border-[#E6E1D3] hover:bg-[#EAE5D9]'
                }`}
              >
                <span>Tanmay Anand</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setProfileTab('identity')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-[#222E23] text-white shadow-xs'
              : 'text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] bg-transparent'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal & Identity</span>
        </button>

        <button
          onClick={() => setProfileTab('shipping')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#222E23] text-white shadow-xs'
              : 'text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] bg-transparent'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Shipping & Location</span>
        </button>

        <button
          onClick={() => setProfileTab('defaults')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'defaults'
              ? 'bg-[#222E23] text-white shadow-xs'
              : 'text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] bg-transparent'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Shopping & Budget Defaults</span>
        </button>
      </div>

      {/* Tab 1: Personal & Professional Details */}
      {activeTab === 'identity' && (
        <div className="bg-white rounded-[28px] border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3A2B]">
              Personal & Professional Details
            </h2>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Update your visible name, contact details, and role title across the platform.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>

              {/* Role Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  ROLE TITLE / HEADLINE
                </label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={e => handleInputChange('roleTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>

              {/* Department / Team */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  DEPARTMENT / TEAM
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  LOCATION / CITY
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                BIO & PROFESSIONAL FOCUS
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20 focus:border-[#2C3A2B] transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Changes saved successfully</span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Shipping & Location */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3A2B]">
              Shipping & Delivery Address
            </h2>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Used to calculate logistics tiers, pincode availability, and express doorstep delivery.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  DELIVERY ADDRESS LINE 1
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={e => handleInputChange('addressLine1', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:border-[#2C3A2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  PIN CODE
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={e => handleInputChange('pinCode', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:border-[#2C3A2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  CITY
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:border-[#2C3A2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  STATE
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] text-sm focus:outline-none focus:border-[#2C3A2B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  DEFAULT LOGISTICS TIER
                </label>
                <div className="p-3 rounded-xl border border-[#E6E1D3] bg-[#F7F4EC] text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#2C3A2B]">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Standard Logistics (Flat ₹100 / Free &gt; ₹2,000)</span>
                  </div>
                  <p className="text-[11px] text-[#5A5A40]">
                    Eligible for heavy item automated surcharges (+₹150 for items &gt; 3.0 kg).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Address</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Shopping & Budget Defaults */}
      {activeTab === 'defaults' && (
        <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3A2B]">
              Shopping & Budget Defaults
            </h2>
            <p className="text-xs text-[#5A5A40] mt-0.5">
              Customize starting budget limits and optimization preferences for new bundles.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  DEFAULT WORKSPACE BUDGET (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  value={formData.defaultBudget}
                  onChange={e => handleInputChange('defaultBudget', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#FDFBF7] text-[#2C2C1E] font-mono text-sm focus:outline-none focus:border-[#2C3A2B]"
                />
                <span className="text-[11px] text-[#8B8B7A]">
                  Current active workspace budget: {formatINR(budget)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                  ACTIVE BENCHMARK ACTIVITY
                </label>
                <div className="p-3 rounded-xl border border-[#E6E1D3] bg-[#F7F4EC] text-xs font-medium text-[#2C3A2B]">
                  C07 Product Bundle (Mouse + Keyboard slot constraints)
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#2C3A2B] hover:bg-[#1E281D] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Shopping Defaults</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
