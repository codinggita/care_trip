import { Phone, MapPin, CheckCircle, Navigation, AlertTriangle, Map, IdCard, Pill, Smartphone } from 'lucide-react';
import { hospitals, safetyTips } from '../data/mockData';

// Map iconType strings to Lucide components
const tipIcons = {
  'id-card': IdCard,
  'pill': Pill,
  'smartphone': Smartphone,
};

export default function EmergencyHelp() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Emergency Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 sm:p-8 text-white">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={28} className="text-red-200" />
            <h1 className="text-2xl sm:text-3xl font-bold">In an Emergency?</h1>
          </div>
          <p className="text-red-100 text-sm sm:text-base mb-6 max-w-lg">
            Our helpline is available 24/7 with multilingual support.
          </p>
          <a
            href="tel:1800-MED-HELP"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-red-600 rounded-xl font-bold text-lg
                       hover:bg-red-50 transition-all duration-200 shadow-lg shadow-black/10"
          >
            <Phone size={20} /> Call Emergency Helpline — 1800-MED-HELP
          </a>
          <p className="text-red-200 text-xs mt-3">Toll-free | Available in 12 languages</p>
        </div>
      </div>

      {/* Nearest Hospitals */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Nearest Hospitals</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 leading-tight pr-3 group-hover:text-primary-700 transition-colors">
                  {hospital.name}
                </h3>
                <span className="flex-shrink-0 badge badge-blue text-[11px]">
                  <MapPin size={10} /> {hospital.distance}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-700 font-medium">Emergency Services Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 flex-shrink-0" />
                  <span>{hospital.phone}</span>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           border-2 border-secondary-700 text-secondary-700 
                           hover:bg-secondary-50 transition-all duration-200"
              >
                <Navigation size={14} /> Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Map */}
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 min-h-[280px] flex flex-col items-center justify-center p-8">
          {/* Decorative map dots */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-12 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute top-20 right-24 w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="absolute bottom-16 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
            {/* Grid lines */}
            <div className="absolute inset-4 border border-dashed border-slate-300 rounded-xl" />
            <div className="absolute top-1/2 left-4 right-4 border-t border-dashed border-slate-300" />
            <div className="absolute left-1/2 top-4 bottom-4 border-l border-dashed border-slate-300" />
          </div>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
              <Map size={32} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Live Map — Nearest Hospitals</h3>
            <p className="text-sm text-slate-500">Google Maps Integration — Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Travel Safety Tips</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {safetyTips.map((tip, i) => {
            const TipIcon = tipIcons[tip.iconType] || IdCard;
            return (
              <div key={i} className="card p-5 card-hover text-center group">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-105 transition-all duration-300">
                  <TipIcon size={28} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-500">{tip.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
