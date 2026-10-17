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
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeTab,
    fixture,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsRead,
    clearNotifications,
    setActiveTab,
    toggleAssistant
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    builder: 'Build a Bundle',
    chat: 'Gemini Chatbot',
    catalogue: 'Product Catalogue',
    compare: 'Compare Bundles',
    tests: 'Test Results',
    business: 'Business Insights',
    evidence: 'Project Evidence',
    settings: 'Fixture & Rules'
  };

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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-stone-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left Area: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-1.5 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="font-medium text-stone-800">C07 Studio</span>
          <span className="text-stone-300">/</span>
          <span>{fixture.activity.name}</span>
          <span className="text-stone-300">/</span>
          <span className="font-semibold text-indigo-950">{tabLabels[activeTab] || 'Workspace'}</span>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-3">
        {/* Activity Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50/70 text-xs">
          <span className="text-stone-500">Activity:</span>
          <span className="font-medium text-stone-900">{fixture.activity.name}</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items, specs, IDs..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50/80 hover:bg-stone-100/80 focus:bg-white border border-stone-200/80 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-800 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={toggleAssistant}
          aria-label="Open AI Assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 text-indigo-950 font-medium text-xs border border-indigo-200 shadow-2xs transition-all hover:shadow-xs cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-700 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-semibold">AI Assistant</span>
          <span className="px-1.5 py-0.2 rounded-md bg-indigo-200/70 text-[10px] font-mono font-bold text-indigo-900">
            Gemini
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              if (!showNotifications) markNotificationsRead();
            }}
            aria-label="View system notifications"
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-900">Notifications</span>
                  <span className="text-[11px] font-mono text-stone-500">
                    ({notifications.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-stone-500 hover:text-stone-900"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex gap-2.5 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        {n.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-stone-900 truncate">{n.title}</span>
                          <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed break-words">
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

        {/* User Profile Avatar with Initials "TA" */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(prev => !prev)}
            aria-label="User profile settings"
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-950 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-2xs">
              TA
            </div>
            <span className="hidden sm:inline text-xs font-medium text-stone-700">Tanmay A.</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg z-50 p-2">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <div className="text-xs font-semibold text-stone-900">Tanmay Anand</div>
                <div className="text-[11px] text-stone-500 font-mono">Product & Engineering Lead</div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('evidence');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between"
              >
                <span>Project Evidence Log</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfile(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-stone-700 hover:bg-stone-50"
              >
                Fixture & Rule Configuration
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
