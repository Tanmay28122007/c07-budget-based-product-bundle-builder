import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C1E] flex flex-col selection:bg-[#8B5A2B]/20 selection:text-[#2C2C1E]">
      {/* Top Academic Prototype Disclaimer Banner */}
      <div className="bg-[#FEF9C3] border-b border-[#F4E1A1] text-[#713F12] text-[10px] sm:text-[11px] font-bold py-1.5 px-4 tracking-wider flex items-center justify-center gap-2 shrink-0 z-40 select-none shadow-2xs">
        <span className="text-amber-600">⚠️</span>
        <span className="uppercase text-center">
          DISCLAIMER: THIS APPLICATION IS AN EDUCATIONAL PROTOTYPE DEVELOPED FOR ACADEMIC PURPOSES. IT IS NOT AN OFFICIAL GOVERNMENT PORTAL.
        </span>
      </div>

      <div className="flex-1 flex relative">
        {/* Soft Organic Ambient Background Circles */}
        <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-[#A3B18A]/12 blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-16 right-10 w-96 h-96 rounded-full bg-[#8B5A2B]/8 blur-3xl pointer-events-none -z-10" />
        <div className="fixed top-1/2 right-1/3 w-80 h-80 rounded-full bg-[#F5F5EC] blur-3xl pointer-events-none -z-10" />

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
      </div>
    </div>
  );
};
