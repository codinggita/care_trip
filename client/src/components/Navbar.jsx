import { useState } from 'react';
import { Search, Bell, MapPin, Menu, X } from 'lucide-react';

export default function Navbar({ onToggleSidebar, sidebarOpen, user }) {
  const [searchFocused, setSearchFocused] = useState(false);

  const userName = user?.name || 'Guest';
  const userInitials = user?.initials || 'GU';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left — Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary-700" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-lg font-bold text-primary-700 hidden sm:block">
              MediTravel Assist
            </span>
          </div>
        </div>

        {/* Center — Search */}
        <div className={`hidden md:flex items-center flex-1 max-w-lg mx-6 relative transition-all duration-300 ${searchFocused ? 'max-w-xl' : ''}`}>
          <Search size={18} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, specialty, doctor name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       focus:bg-white transition-all duration-200 placeholder-slate-400"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Right — Location, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Location Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-600">
            <MapPin size={14} className="text-primary-700" />
            <span className="font-medium">Mumbai, India</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Notifications">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {/* User Avatar — dynamic name + initials */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-semibold
                            group-hover:ring-2 group-hover:ring-primary-300 transition-all duration-200">
              {userInitials}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Search — below navbar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, specialty, doctor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       transition-all duration-200 placeholder-slate-400"
          />
        </div>
      </div>
    </nav>
  );
}
