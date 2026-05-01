import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BookingModal from '../components/BookingModal';
import DoctorProfileModal from '../components/DoctorProfileModal';
import api from '../services/api';
import { updateUser } from '../store';
import SEO from '../components/SEO';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [loading, setLoading] = useState(!user);

  const location = useLocation();
  const navigate = useNavigate();

  // Get active section from pathname
  const getActiveSection = () => {
    const path = location.pathname.split('/').filter(Boolean).pop();
    if (path === 'dashboard' || !path) return 'home';
    return path;
  };

  const activeSection = getActiveSection();

  // Fetch real profile from API to keep state in sync
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get('/profile');
        dispatch(updateUser(data.data));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!user || loading) fetchUserData();
  }, [dispatch, user]);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const handleBookDoctor = useCallback((doctor) => {
    setProfileDoctor(null);
    setBookingDoctor(doctor);
  }, []);

  const handleViewProfile = useCallback((doctor) => {
    setProfileDoctor(doctor);
  }, []);

  const handleCloseBooking = useCallback(() => {
    setBookingDoctor(null);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileDoctor(null);
  }, []);

  const handleProfileUpdate = useCallback((updatedUser) => {
    dispatch(updateUser(updatedUser));
  }, [dispatch]);

  const sectionTitles = {
    'home': 'Dashboard',
    'find-doctors': 'Find Doctors',
    'emergency': 'Emergency Help',
    'bookings': 'My Bookings',
    'profile': 'My Profile',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={sectionTitles[activeSection] || 'User Dashboard'}
        description={`Manage your ${sectionTitles[activeSection] || 'Dashboard'} on CareTrip. Access medical services and emergency help.`}
      />
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        activeSection={activeSection}
        onNavigate={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      <main className="pt-16 lg:pl-60 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeSection === 'home'
                ? `Welcome back, ${firstName}!`
                : (sectionTitles[activeSection] || 'Dashboard')
              }
            </h1>
          </div>

          {/* Render Nested Route with context */}
          <Outlet context={{
            user,
            onProfileUpdate: handleProfileUpdate,
            onBookDoctor: handleBookDoctor,
            onViewProfile: handleViewProfile,
            onNavigate: (path) => navigate(`/dashboard/${path === 'home' ? '' : path}`)
          }} />
        </div>
      </main>

      {/* Modals */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={handleCloseBooking}
          user={user}
          onNavigate={(path) => navigate(`/dashboard/${path === 'home' ? '' : path}`)}
        />
      )}
      {profileDoctor && (
        <DoctorProfileModal
          doctor={profileDoctor}
          onClose={handleCloseProfile}
          onBook={handleBookDoctor}
        />
      )}
    </div>
  );
}
