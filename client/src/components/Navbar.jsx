import { useState, useRef, useEffect } from 'react';
import { Search, Bell, MapPin, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const userName = user?.name || 'Guest';
  
  const getInitials = (name) => {
    if (!name) return 'GU';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'GU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userInitials = user?.initials || getInitials(user?.name);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary-700" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-lg font-bold text-primary-700 hidden sm:block">
              CareTrip
            </span>
          </Link>
        </div>

        {/* Right — Location, Avatar & Dropdown */}
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Location Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-600">
            <MapPin size={14} className="text-primary-700" />
            <span className="font-medium">Gandhinagar, India</span>
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-semibold
                              group-hover:ring-2 group-hover:ring-primary-300 transition-all duration-200 shadow-sm">
                {userInitials}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {user?.role || 'User'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-[60] animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 border-b border-slate-100 mb-1 md:hidden">
                  <p className="text-sm font-bold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                
                <Link 
                  to="/dashboard/profile" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={18} />
                  <span className="font-medium">My Profile</span>
                </Link>
                
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
