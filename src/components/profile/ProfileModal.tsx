import React, { useState, useEffect } from 'react';
import { useApp, DEFAULT_USER_PROFILE, UserProfile } from '../../context/AppContext';
import {
  X,
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
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../../utils/pricing';

const AVATAR_PALETTES = [
  { name: 'Forest Green', hex: '#2C3A2B' },
  { name: 'Warm Ochre', hex: '#8B5A2B' },
  { name: 'Sage Slate', hex: '#5A6B5C' },
  { name: 'Terracotta', hex: '#9E4734' },
  { name: 'Deep Navy', hex: '#1E2D3D' },
  { name: 'Charcoal', hex: '#2C2C1E' }
];

export const ProfileModal: React.FC = () => {
  const { isProfileModalOpen, closeProfileModal, userProfile, updateUserProfile, resetUserProfile, userRole } = useApp();

  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'shipping' | 'preferences'>('profile');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleChange = (field: keyof UserProfile, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      closeProfileModal();
    }, 800);
  };

  const getInitials = (nameStr: string) => {
    const parts = (nameStr || '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (nameStr.slice(0, 2) || 'US').toUpperCase();
  };

  const handleLoadVaishnavi = () => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2C1E]/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E6E1D3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E6E1D3] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: formData.avatarColor }}
            >
              {getInitials(formData.name)}
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2C3A2B]">Edit My Profile & Details</h2>
              <p className="text-xs text-[#7A7A68]">Manage your name, contact information, and commerce defaults.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadVaishnavi}
              title="Fast autofill with Vaishnavi's info"
              className="px-2.5 py-1 text-[11px] font-semibold text-[#8B5A2B] bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#8B5A2B]" />
              <span>Fill Vaishnavi</span>
            </button>
            <button
              onClick={closeProfileModal}
              className="p-1.5 rounded-full text-[#7A7A68] hover:text-[#2C3A2B] hover:bg-[#EAE5D9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subtabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#E6E1D3] bg-white text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#2C3A2B] text-[#2C3A2B]'
                : 'border-transparent text-[#7A7A68] hover:text-[#2C3A2B]'
            }`}
          >
            Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-[#2C3A2B] text-[#2C3A2B]'
                : 'border-transparent text-[#7A7A68] hover:text-[#2C3A2B]'
            }`}
          >
            Delivery Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-[#2C3A2B] text-[#2C3A2B]'
                : 'border-transparent text-[#7A7A68] hover:text-[#2C3A2B]'
            }`}
          >
            Budget & Currency
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Vaishnavi Goud"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="e.g. vaishnavi@example.com"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98480 23456"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={e => handleChange('roleTitle', e.target.value)}
                    placeholder="e.g. Lead Bundle Architect"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => handleChange('department', e.target.value)}
                    placeholder="e.g. Enterprise Procurement, Hardware Systems"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Bio / Personal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={e => handleChange('bio', e.target.value)}
                    placeholder="Add notes about your setup requirements..."
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E] focus:outline-none focus:ring-2 focus:ring-[#2C3A2B]/20"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-[#E6E1D3]">
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1.5">
                    Avatar Theme Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {AVATAR_PALETTES.map(p => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => handleChange('avatarColor', p.hex)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
                          formData.avatarColor.toLowerCase() === p.hex.toLowerCase()
                            ? 'border-[#2C3A2B] bg-[#F4F1EA] font-bold ring-1 ring-[#2C3A2B]'
                            : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.hex }} />
                        <span className="text-[11px] text-[#2C2C1E]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Street / Flat / Door number"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => handleChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={e => handleChange('postalCode', e.target.value)}
                    placeholder="500033"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => handleChange('country', e.target.value)}
                    placeholder="India"
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Default Target Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.defaultBudget}
                    onChange={e => handleChange('defaultBudget', Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs font-mono text-[#2C2C1E]"
                  />
                  <span className="text-[10px] text-[#7A7A68] mt-0.5 block">{formatINR(formData.defaultBudget)}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                    Currency Standard
                  </label>
                  <select
                    value={formData.preferredCurrency}
                    onChange={e => handleChange('preferredCurrency', e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1D3] rounded-xl text-xs text-[#2C2C1E]"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A4A35] uppercase tracking-wider mb-1">
                  Default Optimization Strategy
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChange('optimizationPreference', 'best_value')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      formData.optimizationPreference === 'best_value'
                        ? 'border-[#2C3A2B] bg-[#F4F1EA] font-bold'
                        : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="font-bold text-[#2C3A2B]">Best Value</div>
                    <div className="text-[10px] text-[#7A7A68]">Maximum features within budget</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('optimizationPreference', 'lowest_cost')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      formData.optimizationPreference === 'lowest_cost'
                        ? 'border-[#2C3A2B] bg-[#F4F1EA] font-bold'
                        : 'border-[#E6E1D3] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="font-bold text-[#2C3A2B]">Lowest Cost</div>
                    <div className="text-[10px] text-[#7A7A68]">Lowest landed price</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#E6E1D3] flex items-center justify-between">
            <button
              type="button"
              onClick={resetUserProfile}
              className="px-3 py-1.5 rounded-xl border border-[#E6E1D3] text-xs font-semibold text-[#5A5A40] hover:bg-[#F4F1EA] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeProfileModal}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5A5A40] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#2C3A2B] hover:bg-[#3A4D39] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{justSaved ? 'Saved!' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
