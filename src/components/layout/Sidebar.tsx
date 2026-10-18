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
  ShoppingCart,
  User,
  LogIn,
  LogOut
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
    logout,
    toggleCart,
    currentItems
  } = useApp();

  const cartItemsCount = Object.values(currentItems).filter(Boolean).length;

  const { activeTestRun } = useApp();
  const navItems = userRole === 'admin'
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'Overview'
        },
        {
          id: 'business',
          label: 'Business Insights',
          icon: TrendingUp,
          badge: 'Analytics'
        },
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: `${fixture.products.length}`
        },
        {
          id: 'tests',
          label: 'Test Results',
          icon: CheckCircle2,
          badge: activeTestRun ? `${activeTestRun.summary.passed}/${activeTestRun.summary.totalTested}` : 'Test'
        },
        {
          id: 'compare',
          label: 'Customer Builder',
          icon: Columns,
          badge: 'Workspace'
        },
        {
          id: 'settings',
          label: 'Fixture & Rules',
          icon: Settings,
          badge: isCustomFixture ? 'Custom' : 'Demo'
        },
        {
          id: 'evidence',
          label: 'Project Evidence',
          icon: FileCode2,
          badge: null
        }
      ]
    : userRole === 'customer'
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: fixture.products.length.toString()
        },
        {
          id: 'compare',
          label: 'Bundles',
          icon: Columns,
          badge: cartItemsCount > 0 ? `${cartItemsCount} in cart` : (savedBundles.length > 0 ? `${savedBundles.length} saved` : null)
        },
        {
          id: 'cart',
          label: 'Bundle Cart',
          icon: ShoppingCart,
          badge: cartItemsCount > 0 ? `${cartItemsCount}` : null
        },
        {
          id: 'profile',
          label: 'My Profile',
          icon: User,
          badge: 'Edit'
        }
      ]
    : [
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: fixture.products.length.toString()
        },
        {
          id: 'compare',
          label: 'Bundles',
          icon: Columns,
          badge: savedBundles.length > 0 ? `${savedBundles.length} saved` : (cartItemsCount > 0 ? `${cartItemsCount} in cart` : null)
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
        {/* Brand / Emblem Zone - Clickable to return to homepage (role selection) */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          title="Return to Homepage"
          className="w-full h-18 px-5 border-b border-[#E6E1D3] flex items-center justify-between bg-white/70 hover:bg-white transition-all cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand Emblem Badge */}
            <div className="w-9 h-9 rounded-xl bg-[#2C3A2B] group-hover:bg-[#3A4D39] text-white flex items-center justify-center text-sm shadow-xs ring-1 ring-[#E6E1D3] shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md">
              <PackagePlus className="w-5 h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <div className="font-serif text-sm sm:text-base font-bold tracking-tight text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors leading-snug">
                Budget Based Product Bundle Builder
              </div>
            </div>
          </div>
        </button>

        {/* Navigation Section */}
        <nav className="flex-1 px-3.5 py-4 space-y-2.5 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-bold text-[#7A7A68] uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'catalogue' && activeTab === 'product-detail');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'cart') {
                    toggleCart();
                  } else {
                    setActiveTab(item.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 group/nav ${
                  isActive
                    ? 'bg-[#2C3A2B] text-white font-semibold shadow-md translate-x-1'
                    : 'text-[#4A4A35] hover:text-[#2C3A2B] hover:bg-[#F4F1EA] hover:translate-x-2 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover/nav:scale-115 ${
                      isActive ? 'text-emerald-300' : 'text-[#7A7A68] group-hover/nav:text-[#2C3A2B]'
                    }`}
                  />
                  <span className={isActive ? 'font-serif font-bold text-base' : 'font-medium text-sm sm:text-base'}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums px-2.5 py-0.5 rounded-lg transition-transform group-hover/nav:scale-105 ${
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

        {/* Sidebar Session Footer */}
        <div className="p-3 border-t border-[#E6E1D3] bg-white/50">
          {!userRole ? (
            <div className="p-3 rounded-2xl bg-[#F4F1EA] border border-[#E6E1D3] text-left">
              <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#2C3A2B]">
                <LogIn className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Sign In Required</span>
              </div>
              <p className="text-[11px] text-[#5A5A40] leading-snug mb-2.5">
                Sign in to customize bundles, check hardware compatibility & view landed GST pricing.
              </p>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#2C3A2B] hover:bg-[#1E281D] text-white text-[11px] font-bold uppercase tracking-wider text-center cursor-pointer transition-colors shadow-2xs"
              >
                Sign In Dashboard
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-white border border-[#E6E1D3] shadow-xs flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2C3A2B] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  {userRole === 'admin' ? 'AD' : 'TA'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2C2C1E] truncate">
                    {userRole === 'admin' ? 'Administrator' : 'Tanmay Anand'}
                  </div>
                  <div className="text-[10px] text-[#8B5A2B] font-mono font-semibold uppercase">
                    {userRole} session
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                title="Sign out and return to front page"
                className="p-1.5 rounded-lg text-[#8B8B7A] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
