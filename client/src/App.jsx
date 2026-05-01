import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboard Sub-pages
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import EmergencyHelp from './pages/EmergencyHelp';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Routes for Travelers */}
          <Route element={<ProtectedRoute allowedRoles={['Traveler']} />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="find-doctors" element={<FindDoctors />} />
              <Route path="emergency" element={<EmergencyHelp />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Protected Routes for Doctors */}
          <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Route>

          {/* Protected Routes for Admins */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
