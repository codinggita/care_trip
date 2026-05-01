import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import DoctorSidebar from '../components/DoctorSidebar';
import DoctorHome from './doctor/DoctorHome';
import DoctorVerification from './doctor/DoctorVerification';
import DoctorClinic from './doctor/DoctorClinic';
import DoctorAppointments from './doctor/DoctorAppointments';
import Profile from './Profile';
import { getDoctorDashProfile } from '../services/api';
import api from '../services/api';
import { updateUser } from '../store';
import SEO from '../components/SEO';

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, doctorRes] = await Promise.all([
          api.get('/profile'),
          getDoctorDashProfile(),
        ]);
        dispatch(updateUser(profileRes.data.data));
        setDoctor(doctorRes.data.data);
      } catch (error) {
        console.error('Failed to fetch doctor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const firstName = user?.name?.split(' ')[0] || 'Doctor';

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDoctorUpdate = useCallback((updatedDoctor) => {
    setDoctor(updatedDoctor);
  }, []);

  const handleProfileUpdate = useCallback((updatedUser) => {
    dispatch(updateUser(updatedUser));
  }, [dispatch]);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <DoctorHome doctor={doctor} onNavigate={handleNavigate} />;
      case 'verification':
        return <DoctorVerification doctor={doctor} onDoctorUpdate={handleDoctorUpdate} />;
      case 'clinic':
        return <DoctorClinic doctor={doctor} onDoctorUpdate={handleDoctorUpdate} />;
      case 'appointments':
        return <DoctorAppointments doctor={doctor} />;
      case 'profile':
        return <Profile user={user} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <DoctorHome doctor={doctor} onNavigate={handleNavigate} />;
    }
  };

  const sectionTitles = {
    home: 'Dashboard',
    verification: 'Verification',
    clinic: 'My Clinic',
    appointments: 'Appointments',
    profile: 'My Profile',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading doctor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <SEO 
        title={`Doctor ${sectionTitles[activeSection]}`} 
        description={`CareTrip Doctor Portal - ${sectionTitles[activeSection]}. Manage your clinic and appointments.`}
      />
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <DoctorSidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        verificationStatus={doctor?.verificationStatus}
      />
      <main className="pt-16 lg:pl-60 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeSection === 'home'
                ? `Welcome, Dr. ${firstName}!`
                : sectionTitles[activeSection]}
            </h1>
          </div>
          <div key={activeSection}>{renderSection()}</div>
        </div>
      </main>
    </div>
  );
}
