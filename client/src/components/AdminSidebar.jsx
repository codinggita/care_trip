import { LayoutDashboard, Clock, Users, Settings, LogOut } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pending', label: 'Pending Approvals', icon: Clock },
  { id: 'doctors', label: 'All Doctors', icon: Users },
];

export default function AdminSidebar({ activeSection, onNavigate, isOpen, pendingCount }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 w-60 bg-white border-r border-slate-200
                     transform transition-transform duration-300 ease-out
                     ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                     lg:translate-x-0`}
      >
        <nav className="flex flex-col gap-1 p-4 pt-10">
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
                {item.id === 'pending' && pendingCount > 0 && (
                  <span className={`ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
            <p className="text-xs font-semibold text-red-800">Admin Panel</p>
            <p className="text-xs text-red-600 mt-0.5">CareTrip Management</p>
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
                <div className="relative">
                  <Icon size={20} />
                  {item.id === 'pending' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
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
