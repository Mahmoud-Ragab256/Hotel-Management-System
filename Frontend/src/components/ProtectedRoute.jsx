import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth.js';

function ProtectedRoute({ redirectTo = '/login' }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
