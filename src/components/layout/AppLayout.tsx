import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';
import { SupabaseModal } from '../database/SupabaseModal';
import { useApp } from '../../context/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userRole, isSupabaseModalOpen, setIsSupabaseModalOpen } = useApp();

  const isFrontPage = !userRole;

  if (isFrontPage) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col justify-center items-center selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E] relative overflow-hidden">
        {/* Soft Organic Ambient Background Circles */}
        <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-[#A3B18A]/12 blur-3xl pointer-events-none -z-10 animate-float-slow" />
        <div className="fixed bottom-16 right-10 w-96 h-96 rounded-full bg-[#8B5A2B]/8 blur-3xl pointer-events-none -z-10 animate-float-reverse" />
        <div className="fixed top-1/2 right-1/3 w-80 h-80 rounded-full bg-[#F5F5EC] blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        <main className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
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

        {/* Global AI Assistant Drawer & Floating Button */}
        <AIAssistantDrawer />

        {/* Supabase Database Connection Modal */}
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </div>
    </div>
  );
};

