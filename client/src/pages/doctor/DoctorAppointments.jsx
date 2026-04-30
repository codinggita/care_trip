import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function DoctorAppointments({ doctor }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!doctor?._id) return;
      try {
        const { data } = await api.get(`/bookings/doctor/${doctor._id}`);
        setBookings(data.data || []);
      } catch (err) {
        console.warn('No doctor booking endpoint yet, showing empty:', err.message);
        setBookings([]);
      } finally { setLoading(false); }
    };
    fetchBookings();
  }, [doctor]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusIcon = (s) => {
    if (s === 'Confirmed') return <Clock size={14} className="text-blue-500" />;
    if (s === 'Completed') return <CheckCircle size={14} className="text-emerald-500" />;
    if (s === 'Cancelled') return <XCircle size={14} className="text-red-500" />;
    return <AlertCircle size={14} className="text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Patient Appointments</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {['all','Confirmed','Completed','Cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Appointments Yet</h3>
          <p className="text-sm text-slate-400">Patient bookings will appear here once travelers book with you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b._id} className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {b.patientId?.name?.[0] || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{b.patientId?.name || 'Patient'}</p>
                <p className="text-xs text-slate-400">{b.reason || 'General consultation'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-slate-700">{b.date}</p>
                <p className="text-xs text-slate-400">{b.timeSlot}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {statusIcon(b.status)}
                <span className={`text-xs font-medium ${b.status === 'Confirmed' ? 'text-blue-600' : b.status === 'Completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
