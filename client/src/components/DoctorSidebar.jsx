import { Home, ShieldCheck, Building2, Calendar, User, LogOut } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'clinic', label: 'My Clinic', icon: Building2 },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function DoctorSidebar({ activeSection, onNavigate, isOpen, verificationStatus }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 w-60 bg-white border-r border-slate-200
                     transform transition-transform duration-300 ease-out
                     ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                     lg:translate-x-0`}
      >
        <nav className="flex flex-col gap-1 p-4 pt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                           transition-all duration-200 group
                           ${isActive
                    ? 'bg-primary-700 text-white shadow-md shadow-primary-700/25'
                    : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform duration-200 
                             ${isActive ? '' : 'group-hover:scale-110'}`}
                />
                <span>{item.label}</span>
                {item.id === 'verification' && verificationStatus && (
                  <span className={`ml-auto w-2 h-2 rounded-full ${
                    verificationStatus === 'verified' ? 'bg-emerald-400' :
                    verificationStatus === 'pending' ? 'bg-amber-400 animate-pulse' :
                    verificationStatus === 'rejected' ? 'bg-red-400' :
                    'bg-slate-300 animate-pulse'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
            <p className="text-xs font-semibold text-primary-800">Doctor Portal</p>
            <p className="text-xs text-primary-600 mt-0.5">CareTrip Verified</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
                           transition-all duration-200 min-w-[56px]
                           ${isActive ? 'text-primary-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 rounded-full bg-primary-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => onNavigate(activeSection)}
        />
      )}
    </>
  );
}
