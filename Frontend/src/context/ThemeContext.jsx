import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themeColors = {
  dark: {
    bgMain: 'radial-gradient(circle at top, #231412 0%, #111111 75%)',
    bgHeader: 'rgba(17, 17, 17, 0.75)',
    bgHeaderHome: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%)',
    borderHeader: 'rgba(255, 255, 255, 0.08)',
    bgCard: '#161616',
    bgCardAlt: '#1a1a1a',
    bgCardHover: 'rgba(200, 90, 73, 0.05)',
    borderCard: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    accent: '#c85a49',
    accentHover: '#d16b5a',
    headerGradient: 'linear-gradient(135deg, #1c100e 0%, #c85a49 100%)',
    inputBg: '#1a1a1a',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 30px rgba(0,0,0,0.22)',
    shadowHover: '0 12px 32px rgba(200, 90, 73, 0.14)',
    bottomNavBg: 'rgba(26, 26, 26, 0.75)',
    bottomNavBorder: 'rgba(255, 255, 255, 0.08)',
  },
  light: {
    bgMain: 'radial-gradient(circle at top, #fdf8f7 0%, #f7f5f2 75%)',
    bgHeader: 'rgba(247, 245, 242, 0.85)',
    bgHeaderHome: 'linear-gradient(to bottom, rgba(253, 248, 247, 0.8) 0%, rgba(247, 245, 242, 0) 100%)',
    borderHeader: 'rgba(0, 0, 0, 0.06)',
    bgCard: '#ffffff',
    bgCardAlt: '#fcfcfc',
    bgCardHover: 'rgba(200, 90, 73, 0.04)',
    borderCard: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#1a1a1a',
    textSecondary: '#5a5a5a',
    textMuted: '#8a8a8a',
    accent: '#c85a49',
    accentHover: '#b44c3c',
    headerGradient: 'linear-gradient(135deg, #fceee9 0%, #f5dbd5 100%)',
    inputBg: '#ffffff',
    inputBorder: 'rgba(0, 0, 0, 0.12)',
    shadow: '0 6px 24px rgba(0,0,0,0.03)',
    shadowHover: '0 12px 28px rgba(200, 90, 73, 0.06)',
    bottomNavBg: 'rgba(255, 255, 255, 0.8)',
    bottomNavBorder: 'rgba(0, 0, 0, 0.08)',
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aethos_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('aethos_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
