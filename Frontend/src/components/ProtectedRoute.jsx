import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  canAccessRoute,
  getAccountType,
  getCurrentUser,
  isAuthenticated,
  isBlockedAccountType,
} from '../services/auth.js';

const toList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getRouteAccountType = (allowedAccountTypes) => {
  const accountTypes = toList(allowedAccountTypes);
  return accountTypes.length === 1 ? accountTypes[0] : undefined;
};

const getDefaultUnauthorizedRedirect = (user, fallback) => {
  const accountType = getAccountType(user);
  if (accountType === 'dashboard') return '/dashboard';
  if (accountType === 'guest') return '/';
  return fallback;
};

function ProtectedRoute({
  redirectTo = '/login',
  unauthorizedRedirectTo,
  requireAuth = true,
  allowedAccountTypes,
  allowedRoles,
  allowedVipLevels,
  blockedAccountTypes,
  children,
}) {
  const location = useLocation();
  const routeAccountType = getRouteAccountType(allowedAccountTypes);
  const user = getCurrentUser(routeAccountType);
  const authenticated = isAuthenticated(routeAccountType);

  if (authenticated && isBlockedAccountType(blockedAccountTypes, user)) {
    const target = unauthorizedRedirectTo || getDefaultUnauthorizedRedirect(user, redirectTo);
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  if (requireAuth && !authenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (
    authenticated &&
    (allowedAccountTypes || allowedRoles || allowedVipLevels) &&
    !canAccessRoute({ user, allowedAccountTypes, allowedRoles, allowedVipLevels })
  ) {
    const target = unauthorizedRedirectTo || getDefaultUnauthorizedRedirect(user, redirectTo);
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
