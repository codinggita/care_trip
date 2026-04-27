import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BookingModal from '../components/BookingModal';
import DoctorProfileModal from '../components/DoctorProfileModal';
import Home from './Home';
import FindDoctors from './FindDoctors';
import EmergencyHelp from './EmergencyHelp';
import MyBookings from './MyBookings';
import Profile from './Profile';
import api from '../services/api';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real profile from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get('/profile');
        setUser(data.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback to local data if API fails or session expired
        const localUser = localStorage.getItem('caretrip_user');
        if (localUser) setUser(JSON.parse(localUser));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Extract first name for welcome greeting
  const firstName = user?.name?.split(' ')[0] || 'User';

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    setUser(updatedUser);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onNavigate={handleNavigate} onBookDoctor={handleBookDoctor} onViewProfile={handleViewProfile} />;
      case 'find-doctors':
        return <FindDoctors onViewProfile={handleViewProfile} onBookDoctor={handleBookDoctor} />;
      case 'emergency':
        return <EmergencyHelp />;
      case 'bookings':
        return <MyBookings />;
      case 'profile':
        return <Profile user={user} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <Home onNavigate={handleNavigate} onBookDoctor={handleBookDoctor} />;
    }
  };

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
      {/* Navbar */}
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <main className="pt-16 lg:pl-60 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-1">
              CareTrip / {sectionTitles[activeSection]}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeSection === 'home'
                ? `Welcome back, ${firstName}!`
                : sectionTitles[activeSection]
              }
            </h1>
          </div>

          {/* Active Section */}
          <div key={activeSection}>
            {renderSection()}
          </div>
        </div>
      </main>

      {/* Modals */}
      {bookingDoctor && (
        <BookingModal doctor={bookingDoctor} onClose={handleCloseBooking} user={user} onNavigate={handleNavigate} />
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
