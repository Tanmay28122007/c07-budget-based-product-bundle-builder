import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';
import { BundleCartDrawer } from '../cart/BundleCartDrawer';
import { SupabaseModal } from '../database/SupabaseModal';
import { ProfileModal } from '../profile/ProfileModal';
import { useApp } from '../../context/AppContext';
import { ShoppingCart } from 'lucide-react';
import { formatINR } from '../../utils/pricing';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeTab, userRole, isSupabaseModalOpen, setIsSupabaseModalOpen, toggleCart, validation, currentItems } = useApp();

  const cartItemsCount = Object.values(currentItems).filter(Boolean).length;

  const isFrontPage = !userRole || activeTab === 'login' || activeTab === 'home';

  if (isFrontPage) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col justify-center items-center selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E] relative overflow-hidden">
        {/* Soft Organic Ambient Background Circles */}
        <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-[#A3B18A]/12 blur-3xl pointer-events-none -z-10 animate-float-slow" />
        <div className="fixed bottom-16 right-10 w-96 h-96 rounded-full bg-[#8B5A2B]/8 blur-3xl pointer-events-none -z-10 animate-float-reverse" />
        <div className="fixed top-1/2 right-1/3 w-80 h-80 rounded-full bg-[#F5F5EC] blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        <main className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
        <ProfileModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E]">
      <div className="flex-1 flex relative">
        {/* Soft Organic Ambient Background Circles */}
        <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-[#A3B18A]/12 blur-3xl pointer-events-none -z-10 animate-float-slow" />
        <div className="fixed bottom-16 right-10 w-96 h-96 rounded-full bg-[#8B5A2B]/8 blur-3xl pointer-events-none -z-10 animate-float-reverse" />
        <div className="fixed top-1/2 right-1/3 w-80 h-80 rounded-full bg-[#F5F5EC] blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Viewport */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Floating Cart Button in the Corner */}
        <button
          onClick={toggleCart}
          aria-label="Open bundle cart"
          className="fixed bottom-22 right-6 z-40 px-3.5 py-2.5 rounded-full shadow-xl bg-white border border-[#E6E1D3] hover:border-[#2C3A2B] text-[#2C3A2B] hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 flex items-center gap-2 cursor-pointer group animate-fab-float"
          style={{
            boxShadow: '0 8px 24px rgba(44, 58, 43, 0.15)'
          }}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-[#2C3A2B] group-hover:scale-120 group-hover:-translate-y-0.5 transition-transform" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#2C3A2B] text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-badge-pulse">
                {cartItemsCount}
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8B5A2B] leading-none">Bundle Cart</span>
            <span className="text-xs font-mono font-bold text-[#2C3A2B] leading-tight mt-0.5">
              {cartItemsCount > 0 ? formatINR(validation.landedPrice.landedPrice) : 'Empty'}
            </span>
          </div>
        </button>

        {/* Global Slide-Over Bundle Cart Drawer */}
        <BundleCartDrawer />

        {/* Global AI Assistant Drawer & Floating Button */}
        <AIAssistantDrawer />

        {/* Supabase Database Connection Modal */}
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />

        {/* Quick Profile Edit Modal */}
        <ProfileModal />
      </div>
    </div>
  );
};


