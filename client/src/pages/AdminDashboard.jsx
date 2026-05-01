import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import { getAdminStats, getPendingDoctors, getAllDoctorsAdmin, approveDoctor, rejectDoctor } from '../services/api';
import api from '../services/api';
import { Users, Clock, CheckCircle, Activity, XCircle, ShieldCheck, Search, ChevronDown } from 'lucide-react';
import { updateUser } from '../store';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(!user);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, pendingRes] = await Promise.all([
          api.get('/profile'),
          getAdminStats(),
          getPendingDoctors(),
        ]);
        dispatch(updateUser(profileRes.data.data));
        setStats(statsRes.data.data);
        setPendingDocs(pendingRes.data.data || []);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [dispatch]);

  const loadAllDoctors = async () => {
    try {
      const { data } = await getAllDoctorsAdmin();
      setAllDocs(data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeSection === 'doctors') loadAllDoctors();
    if (activeSection === 'pending') {
      getPendingDoctors()
        .then(({ data }) => setPendingDocs(data.data || []))
        .catch(err => console.error('Reload pending error:', err));
    }
  }, [activeSection]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveDoctor(id);
      setPendingDocs(prev => prev.filter(d => d._id !== id));
      setStats(prev => prev ? { ...prev, pendingDoctors: prev.pendingDoctors - 1, verifiedDoctors: prev.verifiedDoctors + 1 } : prev);
      try {
        const [statsRes, pendingRes] = await Promise.all([
          getAdminStats(),
          getPendingDoctors(),
        ]);
        setStats(statsRes.data.data);
        setPendingDocs(pendingRes.data.data || []);
      } catch (refetchErr) {
        console.warn('Refetch after approve failed:', refetchErr);
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectDoctor(id);
      setPendingDocs(prev => prev.filter(d => d._id !== id));
      setStats(prev => prev ? { ...prev, pendingDoctors: prev.pendingDoctors - 1 } : prev);
      try {
        const [statsRes, pendingRes] = await Promise.all([
          getAdminStats(),
          getPendingDoctors(),
        ]);
        setStats(statsRes.data.data);
        setPendingDocs(pendingRes.data.data || []);
      } catch (refetchErr) {
        console.warn('Refetch after reject failed:', refetchErr);
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sectionTitles = { dashboard: 'Dashboard', pending: 'Pending Approvals', doctors: 'All Doctors' };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <AdminSidebar activeSection={activeSection} onNavigate={handleNavigate} isOpen={sidebarOpen} pendingCount={pendingDocs.length} />

      <main className="pt-16 lg:pl-60 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-1">CareTrip Admin / {sectionTitles[activeSection]}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{sectionTitles[activeSection]}</h1>
          </div>

          {/* Dashboard */}
          {activeSection === 'dashboard' && stats && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Doctors', value: stats.totalDoctors, icon: Users, gradient: 'from-teal-500 to-emerald-600' },
                  { label: 'Pending', value: stats.pendingDoctors, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
                  { label: 'Verified', value: stats.verifiedDoctors, icon: CheckCircle, gradient: 'from-blue-500 to-indigo-600' },
                  { label: 'Travelers', value: stats.totalTravelers, icon: Activity, gradient: 'from-violet-500 to-purple-600' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="card p-5 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</span>
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                          <Icon size={18} className="text-white" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    </div>
                  );
                })}
              </div>

              {pendingDocs.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" /> Recent Pending Approvals
                  </h2>
                  <div className="space-y-3">
                    {pendingDocs.slice(0, 3).map(doc => (
                      <div key={doc._id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                        <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm">{doc.initials || doc.name?.[0]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-500">Reg: {doc.registrationNumber || 'N/A'} · {doc.stateMedicalCouncil || 'No council'}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleApprove(doc._id)} disabled={actionLoading === doc._id} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">Approve</button>
                          <button onClick={() => handleReject(doc._id)} disabled={actionLoading === doc._id} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pendingDocs.length > 3 && (
                    <button onClick={() => handleNavigate('pending')} className="mt-3 text-sm text-primary-700 font-semibold hover:underline">View all {pendingDocs.length} pending →</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pending Approvals Full List */}
          {activeSection === 'pending' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">{pendingDocs.length} pending approval{pendingDocs.length !== 1 ? 's' : ''}</p>
                <button
                  onClick={() => {
                    getPendingDoctors()
                      .then(({ data }) => setPendingDocs(data.data || []))
                      .catch(err => console.error('Refresh error:', err));
                  }}
                  className="text-sm text-primary-700 font-medium hover:underline"
                >
                  Refresh
                </button>
              </div>
              {pendingDocs.length === 0 ? (
                <div className="card p-12 text-center">
                  <CheckCircle size={48} className="text-emerald-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">All Caught Up!</h3>
                  <p className="text-sm text-slate-400">No pending doctor verifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDocs.map(doc => (
                    <div key={doc._id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">{doc.initials || doc.name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{doc.name}</p>
                        <p className="text-sm text-slate-500">Reg: {doc.registrationNumber || 'N/A'}</p>
                        <p className="text-sm text-slate-400">{doc.stateMedicalCouncil || 'No council specified'}</p>
                        <p className="text-xs text-slate-400 mt-1">Specialty: {doc.specialty} · Email: {doc.userId?.email || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleApprove(doc._id)} disabled={actionLoading === doc._id} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"><CheckCircle size={16} />Approve</button>
                        <button onClick={() => handleReject(doc._id)} disabled={actionLoading === doc._id} className="btn-danger text-sm py-2 px-4 flex items-center gap-1.5"><XCircle size={16} />Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Doctors */}
          {activeSection === 'doctors' && (
            <div className="animate-fade-in">
              {allDocs.length === 0 ? (
                <div className="card p-12 text-center">
                  <Users size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">No Doctors Found</h3>
                </div>
              ) : (
                <div className="space-y-3">
                  {allDocs.map(doc => (
                    <div key={doc._id} className="card p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">{doc.initials || doc.name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.specialty} · {doc.userId?.email || ''}</p>
                      </div>
                      <span className={`badge ${
                        doc.verificationStatus === 'verified' ? 'badge-green' :
                        doc.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        doc.verificationStatus === 'rejected' ? 'badge-red' : 'badge-gray'
                      }`}>
                        {doc.verificationStatus || 'legacy'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
