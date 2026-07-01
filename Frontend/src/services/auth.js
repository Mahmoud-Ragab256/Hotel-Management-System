const ADMIN_TOKEN_KEY = 'hotel_admin_token';
const ADMIN_USER_KEY = 'hotel_admin_user';
const CLIENT_TOKEN_KEY = 'hotel_client_token';
const CLIENT_USER_KEY = 'hotel_client_user';

const readJson = (key) => {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const saveSession = ({ token, user }, tokenKey, userKey, eventName) => {
  if (token) localStorage.setItem(tokenKey, token);
  if (user) localStorage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event(eventName));
};

const clearSession = (tokenKey, userKey, eventName) => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  window.dispatchEvent(new Event(eventName));
};

export const saveAdminSession = (session) => saveSession(session, ADMIN_TOKEN_KEY, ADMIN_USER_KEY, 'hotel_admin_user_updated');
export const getAdminAuthToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const getAdminUser = () => readJson(ADMIN_USER_KEY);
export const isAdminAuthenticated = () => Boolean(getAdminAuthToken());
export const clearAdminSession = () => clearSession(ADMIN_TOKEN_KEY, ADMIN_USER_KEY, 'hotel_admin_user_updated');

export const saveClientSession = (session) => saveSession(session, CLIENT_TOKEN_KEY, CLIENT_USER_KEY, 'hotel_client_user_updated');
export const getClientAuthToken = () => localStorage.getItem(CLIENT_TOKEN_KEY);
export const getClientUser = () => readJson(CLIENT_USER_KEY);
export const isClientAuthenticated = () => Boolean(getClientAuthToken());
export const clearClientSession = () => clearSession(CLIENT_TOKEN_KEY, CLIENT_USER_KEY, 'hotel_client_user_updated');

export const updateStoredClientUser = (user) => {
  if (!user) return;
  localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('hotel_client_user_updated'));
};

export const updateStoredAdminUser = (user) => {
  if (!user) return;
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('hotel_admin_user_updated'));
};

export const getTokenForRequest = (url = '') => {
  const target = String(url || '');

  if (target.startsWith('/dashboard')) return getAdminAuthToken();
  if (target.startsWith('dashboard')) return getAdminAuthToken();

  if (target.startsWith('/client/auth') || target.startsWith('client/auth')) return null;
  if (target.startsWith('/client')) return getClientAuthToken();
  if (target.startsWith('client')) return getClientAuthToken();

  return null;
};

// Backward-compatible admin exports used by the existing dashboard files.
export const saveAuthSession = saveAdminSession;
export const getAuthToken = getAdminAuthToken;
export const getCurrentUser = getAdminUser;
export const isAuthenticated = isAdminAuthenticated;
export const clearAuthSession = clearAdminSession;
