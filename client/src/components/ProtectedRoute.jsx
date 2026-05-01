import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('caretrip_token');
  const user = JSON.parse(localStorage.getItem('caretrip_user') || 'null');

  if (!token) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Logged in but role not authorized for this route
    // Redirect to their respective dashboard based on role
    if (user?.role === 'Doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (user?.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
