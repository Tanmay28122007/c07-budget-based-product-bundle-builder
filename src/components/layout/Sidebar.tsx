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
  ShoppingCart
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
          id: 'compare',
          label: 'Compare Builder',
          icon: Columns,
          badge: savedBundles.length > 0 ? `${savedBundles.length} saved` : (validation.filledSlotCount > 0 ? `${validation.filledSlotCount}/${validation.totalSlotCount}` : null)
        }
      ]
    : userRole === 'customer'
    ? [
        {
          id: 'catalogue',
          label: 'Product Catalogue',
          icon: Layers,
          badge: fixture.products.length.toString()
        },
        {
          id: 'compare',
          label: 'Compare Builder',
          icon: Columns,
          badge: cartItemsCount > 0 ? `${cartItemsCount} in cart` : (savedBundles.length > 0 ? `${savedBundles.length} saved` : '2 in cart')
        },
        {
          id: 'cart',
          label: 'Bundle Cart',
          icon: ShoppingCart,
          badge: cartItemsCount > 0 ? `${cartItemsCount}` : null
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
          label: 'Compare Builder',
          icon: Columns,
          badge: savedBundles.length > 0 ? `${savedBundles.length} saved` : (cartItemsCount > 0 ? `${cartItemsCount} in cart` : null)
        },
        {
          id: 'cart',
          label: 'Bundle Cart',
          icon: ShoppingCart,
          badge: cartItemsCount > 0 ? `${cartItemsCount}` : null
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
              <div className="font-serif text-sm font-bold tracking-tight text-[#2C3A2B] group-hover:text-[#8B5A2B] transition-colors leading-snug">
                Budget Based Product Bundle Builder
              </div>
            </div>
          </div>
        </button>

        {/* Navigation Section */}
        <nav className="flex-1 px-3.5 py-4 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2.5 text-xs font-bold text-[#7A7A68] uppercase tracking-wider">
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
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group/nav ${
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
                  <span className={isActive ? 'font-serif font-bold text-[14.5px]' : 'font-medium'}>{item.label}</span>
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
      </aside>
    </>
  );
};
