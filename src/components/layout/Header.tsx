import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  ChevronDown,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/pricing';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsRead,
    clearNotifications,
    setActiveTab,
    userRole,
    loginAs,
    logout,
    validation,
    toggleCart
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E6E1D3] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left Area: Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-1.5 -ml-1 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl lg:hidden transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-3">

        {/* Global Search Bar */}
        <div className="relative w-36 sm:w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items, specs, IDs..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F1EA]/70 hover:bg-[#F4F1EA] focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-colors text-[#2C2C1E] placeholder-[#8B8B7A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8B7A] hover:text-[#2C2C1E]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              if (!showNotifications) markNotificationsRead();
            }}
            aria-label="View system notifications"
            className="relative p-2 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D46A43]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E6E1D3] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E6E1D3] flex items-center justify-between bg-[#FDFBF7]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-[#2C3A2B]">Notifications</span>
                  <span className="text-[11px] font-mono text-[#5A5A40]">
                    ({notifications.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-[#5A5A40] hover:text-[#2C2C1E]"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E6E1D3]/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8B8B7A]">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex gap-2.5 ${!n.read ? 'bg-[#F4F1EA]/60' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        {n.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-[#8B5A2B]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-[#2C2C1E] truncate">{n.title}</span>
                          <span className="text-[10px] text-[#8B8B7A] shrink-0 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A5A40] mt-0.5 leading-relaxed break-words">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bundle Cart Option in Corner */}
        <button
          onClick={toggleCart}
          aria-label="View bundle cart"
          className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${validation.filledSlotCount > 0
            ? 'bg-[#2C3A2B] hover:bg-[#1E281D] text-white border-[#2C3A2B] shadow-xs hover:shadow-md'
            : 'bg-[#F4F1EA] hover:bg-[#E6E1D3] text-[#5A5A40] border-[#E6E1D3] hover:shadow-2xs'
            }`}
          title={`Bundle Cart: ${validation.filledSlotCount} of ${validation.totalSlotCount} slots filled`}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
            {validation.filledSlotCount > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-[#2C2C1E] font-bold text-[10px] flex items-center justify-center shadow-xs animate-badge-pulse">
                {validation.filledSlotCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-semibold text-xs font-mono">
            {validation.filledSlotCount > 0 ? formatINR(validation.landedPrice.landedPrice) : 'Cart'}
          </span>
        </button>

        {/* Active Role Pill in Header */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E1D3] bg-[#F4F1EA] text-xs shadow-2xs">
          <span className="text-[#8B8B7A] text-[10px] font-bold uppercase tracking-wider">Role:</span>
          {userRole === 'admin' ? (
            <span className="font-bold text-[#8B5A2B] flex items-center gap-1">
              <span>Admin</span>
            </span>
          ) : userRole === 'customer' ? (
            <span className="font-bold text-[#2C3A2B] flex items-center gap-1">
              <span>Customer</span>
            </span>
          ) : (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-[#2C3A2B] font-bold hover:underline cursor-pointer"
            >
              Front Page (Login)
            </button>
          )}
        </div>

        {/* User Profile Avatar with Initials "TA" */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(prev => !prev)}
            aria-label="User profile settings"
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-xl hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#2C3A2B] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-2xs ring-1 ring-[#E6E1D3]">
              TA
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#2C2C1E]">
              {userRole === 'admin' ? 'Admin' : userRole === 'customer' ? 'Customer' : 'Guest'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#8B8B7A]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E6E1D3] rounded-2xl shadow-xl z-50 p-2">
              <div className="px-3 py-2 border-b border-[#E6E1D3] mb-1">
                <div className="text-xs font-serif font-bold text-[#2C3A2B]">Tanmay Anand</div>
                <div className="text-[11px] text-[#5A5A40] flex items-center justify-between mt-0.5">
                  <span>Current Session:</span>
                  <span className="font-bold uppercase text-[10px] text-[#8B5A2B]">
                    {userRole ? userRole : 'Not Logged In'}
                  </span>
                </div>
              </div>

              {/* Role Actions */}
              <div className="p-1 border-b border-[#E6E1D3] mb-1 space-y-1">
                {userRole !== 'customer' && (
                  <button
                    onClick={() => {
                      loginAs('customer');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[#2C3A2B] hover:bg-[#F4F1EA] flex items-center justify-between cursor-pointer"
                  >
                    <span>Login as Customer</span>
                    <span className="text-[10px] font-mono text-[#8B8B7A]">Shopper</span>
                  </button>
                )}
                {userRole !== 'admin' && (
                  <button
                    onClick={() => {
                      loginAs('admin');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[#8B5A2B] hover:bg-[#F4F1EA] flex items-center justify-between cursor-pointer"
                  >
                    <span>Login as Admin</span>
                    <span className="text-[10px] font-mono text-[#8B8B7A]">Manager</span>
                  </button>
                )}
                {userRole && (
                  <button
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Log Out to Front Page</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveTab('evidence');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-[#2C2C1E] hover:bg-[#F4F1EA] flex items-center justify-between cursor-pointer"
              >
                <span>Project Evidence Log</span>
                <ExternalLink className="w-3 h-3 text-[#8B8B7A]" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-[#2C2C1E] hover:bg-[#F4F1EA] cursor-pointer"
              >
                Fixture & Rule Configuration
              </button>
            </div>
          )}
        </div>

        {/* Top-Right Corner Logout Button */}
        {userRole && (
          <button
            onClick={() => logout()}
            aria-label="Logout"
            title="Log out and return to homepage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F1EA] hover:bg-rose-50 text-[#5A5A40] hover:text-rose-700 border border-[#E6E1D3] hover:border-rose-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer group shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-[#8B8B7A] group-hover:text-rose-600 transition-colors" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
