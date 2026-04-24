import { Star, BadgeCheck, Globe, ArrowRight, Stethoscope, MapPin, Calendar, CheckCircle, Clock as ClockIcon, AlertTriangle } from 'lucide-react';
import { quickStats, recentAppointments, doctors } from '../data/mockData';

// Map iconType strings to Lucide components
const statIcons = {
  stethoscope: Stethoscope,
  globe: Globe,
  star: Star,
  'map-pin': MapPin,
};

export default function Home({ onNavigate, onBookDoctor }) {
  const recommendedDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center gap-8">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
            Need medical help while traveling?
          </h1>
          <p className="text-primary-100 text-sm sm:text-base mb-6 max-w-lg">
            Find verified, English-speaking doctors near you — instantly.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('find-doctors')}
              className="px-6 py-2.5 bg-white text-primary-700 rounded-xl font-semibold
                         hover:bg-primary-50 transition-all duration-200 shadow-lg shadow-black/10
                         flex items-center gap-2"
            >
              Find a Doctor <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('emergency')}
              className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-semibold
                         hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/25
                         flex items-center gap-2"
            >
              <AlertTriangle size={16} /> Emergency Help
            </button>
          </div>
        </div>

        {/* Right side Image Collage */}
        <div className="relative z-10 w-full md:w-5/12 hidden sm:block">
          <img 
            src="/hero-collage.jpg" 
            alt="MediTravel Medical Assistance" 
            className="w-full h-auto rounded-2xl shadow-2xl object-cover border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const IconComponent = statIcons[stat.iconType] || Stethoscope;
          return (
            <div key={i} className="card p-4 card-hover group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <IconComponent size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-sm font-medium text-primary-700 hover:text-primary-800 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {recentAppointments.map((apt, i) => (
            <div key={i} className="card p-4 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{apt.doctor}</h3>
                  <p className="text-sm text-slate-500">{apt.specialty}</p>
                </div>
                <span
                  className={`badge ${
                    apt.status === 'Completed' ? 'badge-green' : 'badge-blue'
                  }`}
                >
                  {apt.status === 'Completed' ? <CheckCircle size={12} /> : <ClockIcon size={12} />}
                  {' '}{apt.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" /> {apt.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Doctors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recommended Doctors</h2>
          <button
            onClick={() => onNavigate('find-doctors')}
            className="text-sm font-medium text-primary-700 hover:text-primary-800 flex items-center gap-1 transition-colors"
          >
            See all <ArrowRight size={14} />
          </button>
        </div>
        <div className="scroll-container">
          {recommendedDoctors.map((doc) => (
            <div key={doc.id} className="card p-4 card-hover min-w-[280px] max-w-[300px] flex-shrink-0">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl ${doc.color} text-white flex items-center justify-center font-semibold shadow-md`}>
                  {doc.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{doc.name}</h3>
                  <p className="text-xs text-slate-500">{doc.specialty}</p>
                </div>
              </div>

              {/* Language Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {doc.languages.map((lang) => (
                  <span key={lang} className="pill text-[10px]">
                    <Globe size={10} className="text-primary-600" /> {lang}
                  </span>
                ))}
              </div>

              {/* Rating + Verified */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <Star size={14} fill="currentColor" /> {doc.rating}
                  <span className="text-slate-400 text-xs font-normal">({doc.reviews})</span>
                </span>
                <span className="badge badge-green text-[10px]">
                  <BadgeCheck size={10} /> Verified
                </span>
              </div>

              {/* Fee + Book */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-900">₹{doc.fee}</span>
                <button
                  onClick={() => onBookDoctor(doc)}
                  className="px-4 py-1.5 text-sm font-medium bg-primary-700 text-white rounded-lg
                             hover:bg-primary-800 transition-all duration-200 shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
