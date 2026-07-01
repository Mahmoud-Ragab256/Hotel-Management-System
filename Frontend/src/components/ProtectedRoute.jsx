import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAdminAuthenticated, isClientAuthenticated } from '../services/auth.js';

function ProtectedRoute({ role = 'client', redirectTo }) {
  const location = useLocation();
  const isAllowed = role === 'admin' ? isAdminAuthenticated() : isClientAuthenticated();
  const loginPath = redirectTo || (role === 'admin' ? '/dashboard/login' : '/login');

  if (!isAllowed) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
