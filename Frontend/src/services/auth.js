const LEGACY_TOKEN_KEY = 'hotel_admin_token';
const LEGACY_USER_KEY = 'hotel_admin_user';

const STORAGE_KEYS = {
  dashboard: {
    token: 'hotel_dashboard_token',
    user: 'hotel_dashboard_user'
  },
  guest: {
    token: 'hotel_guest_token',
    user: 'hotel_guest_user'
  }
};

export const DASHBOARD_ROLES = ['Admin', 'Manager', 'Receptionist', 'Service'];
export const GUEST_VIP_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const toList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const includesNormalized = (list, value) => {
  if (!value) return false;
  return toList(list).map(normalize).includes(normalize(value));
};

const normalizeAccountType = (accountType) => {
  const normalized = normalize(accountType);
  if (normalized === 'dashboard' || normalized === 'admin' || normalized === 'employee') return 'dashboard';
  if (normalized === 'guest' || normalized === 'client') return 'guest';
  return null;
};

const safeParseUser = (savedUser, userKey) => {
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    if (userKey) localStorage.removeItem(userKey);
    return null;
  }
};

export const getAccountType = (user) => {
  if (!user) return null;
  if (user.role) return 'dashboard';
  if (user.vipLevel || user.guestId || user.bookingHistory) return 'guest';
  return null;
};

const inferAccountType = (user, fallback = 'guest') => getAccountType(user) || fallback;

const getSavedSession = (accountType) => {
  const normalizedType = normalizeAccountType(accountType) || 'guest';
  const keys = STORAGE_KEYS[normalizedType];

  const token = localStorage.getItem(keys.token);
  const user = safeParseUser(localStorage.getItem(keys.user), keys.user);

  if (token && user) return { token, user };

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = safeParseUser(localStorage.getItem(LEGACY_USER_KEY), LEGACY_USER_KEY);
  const legacyType = inferAccountType(legacyUser, null);

  if (legacyToken && legacyUser && legacyType === normalizedType) {
    return { token: legacyToken, user: legacyUser };
  }

  return { token: null, user: null };
};

export const saveAuthSession = ({ token, user, accountType }) => {
  const resolvedType = normalizeAccountType(accountType) || inferAccountType(user, 'guest');
  const keys = STORAGE_KEYS[resolvedType];

  if (token) localStorage.setItem(keys.token, token);
  if (user) localStorage.setItem(keys.user, JSON.stringify(user));

  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

export const saveDashboardSession = ({ token, user }) => saveAuthSession({ token, user, accountType: 'dashboard' });

export const saveGuestSession = ({ token, user }) => saveAuthSession({ token, user, accountType: 'guest' });

export const getAuthToken = (accountType = 'guest') => getSavedSession(accountType).token;

export const getCurrentUser = (accountType = 'guest') => getSavedSession(accountType).user;

export const getCurrentUserRole = (user = getCurrentUser('dashboard')) => user?.role || null;

export const getCurrentUserVipLevel = (user = getCurrentUser('guest')) => user?.vipLevel || null;

export const isDashboardUser = (user = getCurrentUser('dashboard')) => getAccountType(user) === 'dashboard';

export const isGuestUser = (user = getCurrentUser('guest')) => getAccountType(user) === 'guest';

export const isAuthenticated = (accountType = 'guest') => Boolean(getAuthToken(accountType) && getCurrentUser(accountType));

export const canAccessRoute = ({
  user,
  allowedAccountTypes,
  allowedRoles,
  allowedVipLevels,
} = {}) => {
  if (!user) return false;

  const accountType = getAccountType(user);

  if (toList(allowedAccountTypes).length && !includesNormalized(allowedAccountTypes, accountType)) {
    return false;
  }

  if (toList(allowedRoles).length && !includesNormalized(allowedRoles, user.role)) {
    return false;
  }

  if (toList(allowedVipLevels).length && !includesNormalized(allowedVipLevels, user.vipLevel)) {
    return false;
  }

  return true;
};

export const isBlockedAccountType = (blockedAccountTypes, user = getCurrentUser()) => {
  const accountType = getAccountType(user);
  return Boolean(accountType && includesNormalized(blockedAccountTypes, accountType));
};

export const clearAuthSession = (accountType) => {
  const normalizedType = normalizeAccountType(accountType);

  if (normalizedType) {
    const keys = STORAGE_KEYS[normalizedType];
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);

    const legacyUser = safeParseUser(localStorage.getItem(LEGACY_USER_KEY), LEGACY_USER_KEY);
    if (inferAccountType(legacyUser, null) === normalizedType) {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
    }
    return;
  }

  Object.values(STORAGE_KEYS).forEach((keys) => {
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
  });
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};
