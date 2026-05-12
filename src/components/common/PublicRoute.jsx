import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Wrap auth pages (login / signup / forgot-password). If the user is already
// signed in, send them straight to the dashboard instead of showing the form.
export default function PublicRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
