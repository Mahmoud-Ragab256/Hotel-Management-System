import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import useAdminShortcut from '../utils/AdminShortcut.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function GuestLayout() {
  useAdminShortcut();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors, theme, isDark } = useTheme();

  const isHomePage = location.pathname === '/' || location.pathname === '';

  // Function to determine if a bottom navigation tab is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ background: colors.bgMain, minHeight: '100vh', display: 'flex', flexDirection: 'column', color: colors.textPrimary, transition: 'background 0.5s ease, color 0.5s ease' }}>
      
      {/* Immersive Theme-aware Header */}
      <Header />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {isHomePage ? (
          <Outlet />
        ) : (
          <div style={{ padding: '40px 24px 100px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        )}
      </main>

      {/* Persistent Glassmorphism Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: colors.bottomNavBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${colors.bottomNavBorder}`,
        borderRadius: '100px',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: colors.shadow,
        width: 'calc(100% - 32px)',
        maxWidth: '540px',
        transition: 'all 0.5s ease'
      }}>
        {/* Tab 1: Explore */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: isActive('/') ? colors.accent : colors.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease, transform 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: isActive('/') ? '600' : '400', fontFamily: '"Inter", sans-serif' }}>Explore</span>
        </button>

        {/* Tab 2: Rooms */}
        <button
          onClick={() => navigate('/rooms')}
          style={{
            background: 'transparent',
            border: 'none',
            color: isActive('/rooms') ? colors.accent : colors.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease, transform 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: isActive('/rooms') ? '600' : '400', fontFamily: '"Inter", sans-serif' }}>Rooms</span>
        </button>

        {/* Tab 3: Services */}
        <button
          onClick={() => navigate('/services')}
          style={{
            background: 'transparent',
            border: 'none',
            color: isActive('/services') ? colors.accent : colors.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease, transform 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0h18M2 12h18m-2 6a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: isActive('/services') ? '600' : '400', fontFamily: '"Inter", sans-serif' }}>Services</span>
        </button>

        {/* Tab 4: Reviews */}
        <button
          onClick={() => navigate('/reviews')}
          style={{
            background: 'transparent',
            border: 'none',
            color: isActive('/reviews') ? colors.accent : colors.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease, transform 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: isActive('/reviews') ? '600' : '400', fontFamily: '"Inter", sans-serif' }}>Reviews</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'transparent',
            border: 'none',
            color: isActive('/profile') ? colors.accent : colors.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease, transform 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: isActive('/profile') ? '600' : '400', fontFamily: '"Inter", sans-serif' }}>Profile</span>
        </button>
      </div>

    </div>
  );
}
