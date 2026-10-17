import React from 'react';
import {
  LayoutDashboard,
  PackagePlus,
  Layers,
  Columns,
  CheckCircle2,
  TrendingUp,
  FileCode2,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    fixture,
    isCustomFixture,
    validation,
    savedBundles,
    testResults,
    toggleAssistant
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'builder',
      label: 'Build a Bundle',
      icon: PackagePlus,
      badge: validation.filledSlotCount > 0 ? `${validation.filledSlotCount}/${validation.totalSlotCount}` : null
    },
    {
      id: 'chat',
      label: 'Gemini Chatbot',
      icon: Bot,
      badge: 'AI'
    },
    {
      id: 'catalogue',
      label: 'Product Catalogue',
      icon: Layers,
      badge: fixture.products.length.toString()
    },
    {
      id: 'compare',
      label: 'Compare Bundles',
      icon: Columns,
      badge: savedBundles.length > 0 ? savedBundles.length.toString() : null
    },
    {
      id: 'tests',
      label: 'Test Results',
      icon: CheckCircle2,
      badge: testResults.length > 0 ? `${testResults.filter(t => t.passed).length}/${testResults.length}` : '20'
    },
    {
      id: 'business',
      label: 'Business Insights',
      icon: TrendingUp,
      badge: 'MBA'
    },
    {
      id: 'evidence',
      label: 'Project Evidence',
      icon: FileCode2,
      badge: null
    },
    {
      id: 'settings',
      label: 'Fixture & Rules',
      icon: Settings,
      badge: isCustomFixture ? 'Custom' : 'Demo'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200/80 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Zone */}
        <div className="h-16 px-5 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-sm shadow-xs tracking-tight">
              C07
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-stone-900 leading-tight">
                Bundle Builder
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                Work from Home Studio
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-950 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-900' : 'text-stone-400 group-hover:text-stone-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isActive ? 'text-indigo-900 font-bold' : 'text-stone-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="px-3 pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              AI Tools
            </div>
            <button
              onClick={() => {
                toggleAssistant();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-xs hover:from-indigo-950 hover:to-indigo-900 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                <span>AI Assistant</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-white/20 text-white font-medium">
                Gemini
              </span>
            </button>
          </div>
        </nav>

        {/* Fixture & Mode Status Footer */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-50/60">
          <div className="px-2 py-2 rounded-md bg-white border border-stone-200/70 text-xs">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Fixture Data</span>
              <span className="font-mono text-stone-700">
                {isCustomFixture ? 'Loaded JSON' : 'Synthetic C07'}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 flex items-center justify-between">
              <span>Activity</span>
              <span className="font-medium text-stone-800">{fixture.activity.name}</span>
            </div>
            {!isCustomFixture && (
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-amber-700">
                <span>Demo mode (synthetic)</span>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="font-medium hover:underline text-indigo-700"
                >
                  Upload JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
