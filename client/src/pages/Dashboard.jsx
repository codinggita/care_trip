import { useState, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BookingModal from '../components/BookingModal';
import DoctorProfileModal from '../components/DoctorProfileModal';
import Home from './Home';
import FindDoctors from './FindDoctors';
import EmergencyHelp from './EmergencyHelp';
import MyBookings from './MyBookings';
import Profile from './Profile';
import { getLoggedInUser } from '../data/mockData';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);

  // Get the logged-in user from localStorage
  const user = useMemo(() => getLoggedInUser(), []);

  // Extract first name for welcome greeting
  const firstName = user.name.split(' ')[0];

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

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onNavigate={handleNavigate} onBookDoctor={handleBookDoctor} />;
      case 'find-doctors':
        return <FindDoctors onViewProfile={handleViewProfile} onBookDoctor={handleBookDoctor} />;
      case 'emergency':
        return <EmergencyHelp />;
      case 'bookings':
        return <MyBookings />;
      case 'profile':
        return <Profile user={user} />;
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
              MediTravel Assist / {sectionTitles[activeSection]}
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
        <BookingModal doctor={bookingDoctor} onClose={handleCloseBooking} user={user} />
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
