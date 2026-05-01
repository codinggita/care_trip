import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Menu, X, User, LogOut, ChevronDown, Phone, AlertCircle, Info } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Left Section — Logo & Main Nav */}
          <div className="flex items-center gap-10">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative">
                <div className="absolute -inset-1 bg-primary-100 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <svg className="relative w-11 h-11 text-primary-700" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#1e40af" />
                  <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M12 12L28 28M28 12L12 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>
              <div className="flex flex-col items-start -space-y-1">
                <span className="text-2xl font-black text-primary-900 tracking-tight uppercase">CARE<span className="text-primary-600">TRIP</span></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Health Global</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-10 ml-4">
              <Link to="/dashboard/find-doctors" className="group flex items-center gap-2 text-[13px] font-bold text-slate-700 hover:text-primary-700 uppercase tracking-widest transition-all duration-300 relative py-2">
                <Search size={14} className="text-slate-400 group-hover:text-primary-600" />
                Find Doctors
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/dashboard/about" className="group flex items-center gap-1.5 text-[13px] font-bold text-slate-700 hover:text-primary-700 uppercase tracking-widest transition-all duration-300 relative py-2">
                <Info size={14} className="text-slate-400 group-hover:text-primary-600" />
                About CareTrip
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* Right Section — Emergency & Profile */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Emergency Button */}
            <Link
              to="/dashboard/emergency"
              className="flex items-center gap-2.5 px-6 py-2.5 bg-red-600 text-white rounded-full font-bold text-[12px] uppercase tracking-[0.1em] hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-100 hover:shadow-red-200 border-2 border-transparent hover:border-red-300 active:scale-95"
            >
              <AlertCircle size={16} className="animate-pulse" />
              <span>Emergency Help</span>
            </Link>

            {/* User Profile */}
            <div className="relative border-l border-slate-100 pl-6 sm:pl-8" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 group p-1 rounded-xl hover:bg-slate-50 transition-all duration-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-black shadow-md group-hover:ring-4 group-hover:ring-primary-50 transition-all duration-300 border-2 border-white">
                  {userInitials}
                </div>
                <div className="hidden md:flex flex-col items-start mr-1">
                  <span className="text-[13px] font-bold text-slate-800 group-hover:text-primary-700 transition-colors leading-none mb-1 tracking-tight">{userName}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{user?.role || 'Patient'}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl border border-slate-100 shadow-2xl py-2 z-[60] animate-in fade-in zoom-in duration-300">
                  <div className="px-6 py-4 border-b border-slate-50 mb-2 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-[14px] font-black text-slate-800">{userName}</p>
                    <p className="text-[11px] text-slate-400 font-bold truncate tracking-tight">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 px-6 py-3.5 text-[13px] text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors font-bold"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={18} className="text-slate-400" />
                    My Account
                  </Link>

                  <div className="h-px bg-slate-50 my-1 mx-4"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-black"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
