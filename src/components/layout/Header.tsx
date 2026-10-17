import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  LogOut,
  Wallet,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    logout,
    budget,
    setBudget
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
      {/* Left Area: Mobile Menu, Search Bar & Budget Bar Side-by-Side */}
      <div className="flex items-center gap-3 flex-1 max-w-xl sm:max-w-2xl lg:max-w-3xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-1.5 -ml-1 text-[#5A5A40] hover:text-[#2C2C1E] hover:bg-[#F4F1EA] rounded-xl lg:hidden transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B7A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items, specs, IDs..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#F4F1EA]/70 hover:bg-[#F4F1EA] focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-all text-[#2C2C1E] placeholder-[#8B8B7A] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8B7A] hover:text-[#2C2C1E] cursor-pointer p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Budget Input Bar - Placed next to the product search bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-[#8B5A2B] uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Budget:</span>
          </span>
          <div className="relative w-28 sm:w-36">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] font-mono text-xs font-bold pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="500"
              value={budget || ''}
              onChange={e => setBudget(Math.max(0, Number(e.target.value) || 0))}
              placeholder="Budget"
              title="Set Target Budget (₹)"
              className="w-full pl-6 pr-2.5 py-2 text-xs font-mono font-bold text-[#2C2C1E] bg-[#F4F1EA]/70 hover:bg-[#F4F1EA] focus:bg-white border border-[#E6E1D3] rounded-xl focus:outline-hidden focus:border-[#2C3A2B] transition-all placeholder-[#8B8B7A] shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications & Profile Avatar */}
      <div className="flex items-center gap-3">

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

        {/* User Profile Avatar on Top Right Corner */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(prev => !prev)}
            aria-label="User profile settings"
            title="Tanmay Anand"
            className="flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-[#2C3A2B]/20 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#2C3A2B] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs ring-2 ring-[#E6E1D3] group-hover:ring-[#2C3A2B] transition-transform group-hover:scale-105">
              TA
            </div>
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

              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2C3A2B] hover:bg-[#F4F1EA] flex items-center justify-between cursor-pointer"
              >
                <span>My Profile</span>
                <User className="w-3.5 h-3.5 text-[#5A5A40]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
