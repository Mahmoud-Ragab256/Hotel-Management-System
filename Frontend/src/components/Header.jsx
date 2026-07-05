import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth.js';
import AccountMenu from './AccountMenu.jsx';
import NotificationBell from './NotificationsBell.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const { colors, theme, toggleTheme, isDark } = useTheme();

  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <header style={{
      background: isHomePage ? colors.bgHeaderHome : colors.bgHeader,
      backdropFilter: isHomePage ? 'none' : 'blur(12px)',
      WebkitBackdropFilter: isHomePage ? 'none' : 'blur(12px)',
      borderBottom: isHomePage ? 'none' : `1px solid ${colors.borderHeader}`,
      padding: '16px 24px',
      position: isHomePage ? 'absolute' : 'sticky',
      top: 0,
      left: 0,
      zIndex: 900,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Brand Logo - Aethos Luxury Hotel */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: colors.textPrimary, transition: 'color 0.3s' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c85a49" strokeWidth="2" style={{ transition: 'transform 0.3s' }}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            fontFamily: '"Playfair Display", "Georgia", serif',
            lineHeight: '1.2'
          }}>
            Aethos
          </span>
          <span style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: colors.textSecondary,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            transition: 'color 0.3s'
          }}>
            Luxury Hotel
          </span>
        </div>
      </Link>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search Icon */}
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textPrimary,
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1)'; }}
          onClick={() => navigate('/rooms')}
          aria-label="Search"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Help Center Icon */}
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textPrimary,
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1)'; }}
          onClick={() => navigate('/help-center')}
          aria-label="Help Center"
          title="Help Center"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Elegant Theme Toggle Button */}
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textPrimary,
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1)'; }}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {loggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Custom Styled Notification Bell */}
            <div style={{ color: colors.textPrimary }}>
              <NotificationBell />
            </div>

            {/* Account Profile Menu */}
            <AccountMenu />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                color: colors.textPrimary,
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}`,
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.textPrimary;
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: colors.accent,
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                transition: 'all 0.2s ease',
                boxShadow: colors.shadow
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.accentHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.accent;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
