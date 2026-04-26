import { useState, useEffect } from 'react';
import { Star, BadgeCheck, Globe, ArrowRight, Stethoscope, MapPin, Calendar, CheckCircle, Clock as ClockIcon, AlertTriangle, Phone, XCircle } from 'lucide-react';
import api from '../services/api';

// Map iconType strings to Lucide components
const statIcons = {
  stethoscope: Stethoscope,
  globe: Globe,
  star: Star,
  'map-pin': MapPin,
};

export default function Home({ onNavigate, onBookDoctor, onViewProfile }) {
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [stats, setStats] = useState([
    { iconType: 'stethoscope', label: 'Doctors Available', value: '...' },
    { iconType: 'globe', label: 'Languages Supported', value: '12' },
    { iconType: 'star', label: 'Average Rating', value: '4.7' },
    { iconType: 'map-pin', label: 'Your Location', value: 'Detecting...' },
  ]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 23.2156, lng: 72.6369 }); // Default to Gandhinagar

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setStats(prev => {
            const newStats = [...prev];
            newStats[3].value = 'Near You';
            return newStats;
          });
        },
        (error) => {
          console.error('Home geolocation error:', error);
          setStats(prev => {
            const newStats = [...prev];
            newStats[3].value = 'Gandhinagar';
            return newStats;
          });
        },
        { timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [docsRes, bookingsRes] = await Promise.all([
          api.get('/places/nearby-doctors', { 
            params: { lat: userLocation.lat, lng: userLocation.lng, radius: 10000 } 
          }),
          api.get('/bookings?limit=2').catch(() => ({ data: { data: [] } }))
        ]);
        
        const docs = docsRes.data.data || [];
        setRecommendedDoctors(docs.slice(0, 6));
        setRecentAppointments(bookingsRes.data.data || []);
        
        // Update stats count dynamically
        setStats(prev => {
          const newStats = [...prev];
          newStats[0].value = (docs.length > 0 ? docs.length : '50+').toString();
          return newStats;
        });
      } catch (error) {
        console.error('Home data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [userLocation]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setRecentAppointments(prev => prev.filter(apt => apt._id !== id));
    } catch (error) {
      console.error('Cancel appointment error:', error);
      alert('Failed to cancel appointment');
    }
  };

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
            alt="CareTrip Medical Assistance" 
            className="w-full h-auto rounded-2xl shadow-2xl object-cover border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
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
          {recentAppointments.length > 0 ? (
            recentAppointments.map((apt, i) => (
              <div key={i} className="card p-4 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{apt.doctorName || apt.doctorId?.name || apt.doctor}</h3>
                    <p className="text-sm text-slate-500">{apt.doctorSpecialty || apt.doctorId?.specialty || apt.specialty}</p>
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" /> {apt.date}
                  </p>
                  <button 
                    onClick={() => handleCancelAppointment(apt._id || apt.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Cancel Appointment"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-sm italic">No recent appointments found.</p>
            </div>
          )}
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
        
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-4 min-w-[280px] h-[220px] animate-pulse bg-slate-50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded mt-2"></div>
                <div className="h-8 w-full bg-slate-200 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        ) : recommendedDoctors.length === 0 ? (
          <div className="card p-8 text-center bg-slate-50 border border-dashed border-slate-200">
            <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 italic">No doctors found in your current area.</p>
            <button 
              onClick={() => onNavigate('find-doctors')}
              className="text-primary-700 text-sm font-bold mt-4 hover:underline"
            >
              Search manually
            </button>
          </div>
        ) : (
          <div className="scroll-container">
            {recommendedDoctors.map((doc) => (
              <div key={doc._id || doc.id} className="card p-4 card-hover min-w-[280px] max-w-[300px] flex-shrink-0 flex flex-col group">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${doc.color || 'bg-primary-700'} text-white flex items-center justify-center font-semibold shadow-md group-hover:scale-105 transition-transform overflow-hidden`}>
                    {doc.icon ? (
                      <img 
                        src={doc.icon} 
                        alt={doc.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = doc.initials || 'DR'; }}
                      />
                    ) : (doc.initials || 'DR')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.name}</h3>
                    <p className="text-xs text-slate-500">{doc.specialty}</p>
                  </div>
                  {doc.distance && (
                    <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {doc.distance}
                    </span>
                  )}
                </div>
                
                {doc.address && (
                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-1 flex items-center gap-1">
                    <MapPin size={10} className="text-slate-400" />
                    {doc.address}
                  </p>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                    <Star size={12} fill="currentColor" /> {doc.rating}
                  </span>
                  {doc.verified && (
                    <span className="badge badge-green text-[9px] px-1.5 py-0.5">
                      <BadgeCheck size={9} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => onViewProfile(doc)}
                    className="flex-1 py-2 text-[11px] font-bold text-primary-700 border-2 border-primary-50 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="flex-1 py-2 text-[11px] font-bold text-white bg-primary-700 rounded-lg hover:bg-primary-800 shadow-sm transition-colors"
                  >
                    Book
                  </button>
                  {doc.phone && (
                    <a
                      href={`tel:${doc.phone}`}
                      className="px-3 py-2 text-emerald-600 border-2 border-emerald-50 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Call Doctor"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
