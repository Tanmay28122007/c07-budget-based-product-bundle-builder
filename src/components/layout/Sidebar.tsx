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
    userRole,
    loginAs,
    logout
  } = useApp();

  const navItems = userRole === 'admin'
    ? [
        {
          id: 'dashboard',
          label: 'Admin Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'business',
          label: 'Business Insights',
          icon: TrendingUp,
          badge: 'Unit Econ'
        },
        {
          id: 'tests',
          label: 'Test Results',
          icon: CheckCircle2,
          badge: testResults.length > 0 ? `${testResults.filter(t => t.passed).length}/${testResults.length}` : '20'
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
        },
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: fixture.products.length.toString()
        },
        {
          id: 'builder',
          label: 'Build a Bundle',
          icon: PackagePlus,
          badge: validation.filledSlotCount > 0 ? `${validation.filledSlotCount}/${validation.totalSlotCount}` : null
        },
        {
          id: 'compare',
          label: 'Compare Bundles',
          icon: Columns,
          badge: savedBundles.length > 0 ? savedBundles.length.toString() : null
        },
        {
          id: 'chat',
          label: 'Gemini Assistant',
          icon: Bot,
          badge: 'AI'
        }
      ]
    : userRole === 'customer'
    ? [
        {
          id: 'builder',
          label: 'Build a Bundle',
          icon: PackagePlus,
          badge: validation.filledSlotCount > 0 ? `${validation.filledSlotCount}/${validation.totalSlotCount}` : null
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
          id: 'chat',
          label: 'Gemini Assistant',
          icon: Bot,
          badge: 'AI'
        },
        {
          id: 'dashboard',
          label: 'Front Page (Switch)',
          icon: LayoutDashboard,
          badge: null
        }
      ]
    : [
        {
          id: 'dashboard',
          label: 'Front Page (Login)',
          icon: LayoutDashboard,
          badge: 'Start'
        },
        {
          id: 'builder',
          label: 'Customer Portal',
          icon: PackagePlus,
          badge: null
        },
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: fixture.products.length.toString()
        },
        {
          id: 'chat',
          label: 'Gemini Assistant',
          icon: Bot,
          badge: 'AI'
        }
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2C2C1E]/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FDFBF7] border-r border-[#E6E1D3] flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Emblem Zone - Clickable to return to homepage */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            onClose();
          }}
          title="Return to Homepage"
          className="w-full h-18 px-5 border-b border-[#E6E1D3] flex items-center justify-between bg-white/70 hover:bg-white transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand Emblem Badge */}
            <div className="w-9 h-9 rounded-xl bg-[#2C3A2B] group-hover:bg-[#3A4D39] text-white flex items-center justify-center text-sm shadow-xs ring-1 ring-[#E6E1D3] shrink-0 transition-all group-hover:scale-105">
              <PackagePlus className="w-5 h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <div className="font-serif text-xs font-bold tracking-tight text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors leading-tight">
                Budget Based Product Bundle Builder
              </div>
              <div className="text-[10px] text-[#5A5A40] font-medium">
                Standard C07 Suite
              </div>
            </div>
          </div>
        </button>

        {/* Active Role Indicator Card */}
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-white border border-[#E6E1D3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-semibold">
            <span className="text-[#8B8B7A] uppercase tracking-wider">Active Role</span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
              userRole === 'admin'
                ? 'bg-[#8B5A2B]/15 text-[#8B5A2B] border border-[#8B5A2B]/20'
                : userRole === 'customer'
                ? 'bg-[#2C3A2B]/15 text-[#2C3A2B] border border-[#2C3A2B]/20'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}>
              {userRole === 'admin' ? 'Admin' : userRole === 'customer' ? 'Customer' : 'Front Page'}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            {userRole === 'customer' && (
              <button
                onClick={() => {
                  loginAs('admin');
                  onClose();
                }}
                className="text-[10px] text-[#8B5A2B] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Admin</span>
                <span>→</span>
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  loginAs('customer');
                  onClose();
                }}
                className="text-[10px] text-[#2C3A2B] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Customer</span>
                <span>→</span>
              </button>
            )}
            {userRole && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-[10px] text-rose-700 font-medium hover:underline ml-auto cursor-pointer"
              >
                Log Out
              </button>
            )}
            {!userRole && (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  onClose();
                }}
                className="text-[10px] text-[#2C3A2B] font-semibold hover:underline w-full text-center cursor-pointer"
              >
                Login as Customer or Admin →
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#8B8B7A] uppercase tracking-wider">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#2C3A2B] text-white font-semibold shadow-xs'
                    : 'text-[#5A5A40] hover:text-[#2C3A2B] hover:bg-[#F4F1EA]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-300' : 'text-[#8B8B7A]'
                    }`}
                  />
                  <span className={isActive ? 'font-serif' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-[#F4F1EA] text-[#8B5A2B] border border-[#E6E1D3]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

        </nav>

        {/* Fixture & Mode Status Footer */}
        <div className="p-3 border-t border-[#E6E1D3] bg-[#F4F1EA]/60">
          <div className="px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-[#5A5A40] mb-1">
              <span>Inventory Set</span>
              <span className="font-mono text-[#2C3A2B] font-semibold">
                {isCustomFixture ? 'Loaded JSON' : 'Standard C07'}
              </span>
            </div>
            <div className="text-[11px] text-[#5A5A40] flex items-center justify-between">
              <span>Activity</span>
              <span className="font-medium text-[#2C3A2B]">{fixture.activity.name}</span>
            </div>
            {!isCustomFixture && (
              <div className="mt-2 pt-2 border-t border-[#E6E1D3] flex items-center justify-between text-[10px] text-[#8B5A2B]">
                <span>Educational Demo</span>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="font-medium hover:underline text-[#8B5A2B]"
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
