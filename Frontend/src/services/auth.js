const TOKEN_KEY = 'hotel_admin_token';
const USER_KEY = 'hotel_admin_user';

export const saveAuthSession = ({ token, user }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getCurrentUser = () => {
  const savedUser = localStorage.getItem(USER_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
