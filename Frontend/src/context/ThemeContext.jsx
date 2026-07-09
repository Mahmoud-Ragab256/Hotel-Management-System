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
    borderHover: 'rgba(200, 90, 73, 0.35)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    accent: '#c85a49',
    accentHover: '#d16b5a',
    headerGradient: 'linear-gradient(135deg, #2c1a18 0%, #150f0e 100%)',
    inputBg: '#1a1a1a',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 30px rgba(0,0,0,0.22)',
    shadowHover: '0 12px 32px rgba(200, 90, 73, 0.14)',
    bottomNavBg: 'rgba(26, 26, 26, 0.75)',
    bottomNavBorder: 'rgba(255, 255, 255, 0.08)',
  },
  light: {
    bgMain: 'radial-gradient(circle at top, #FAF6F0 0%, #F3EBE1 100%)',
    bgHeader: 'rgba(243, 235, 225, 0.85)',
    bgHeaderHome: 'linear-gradient(to bottom, rgba(250, 246, 240, 0.8) 0%, rgba(243, 235, 225, 0) 100%)',
    borderHeader: 'rgba(195, 180, 165, 0.15)',
    bgCard: '#fdfbf9',
    bgCardAlt: '#f9f5ef',
    bgCardHover: 'rgba(200, 90, 73, 0.03)',
    borderCard: 'rgba(195, 180, 165, 0.2)',
    borderHover: 'rgba(200, 90, 73, 0.4)',
    textPrimary: '#2e2a28',
    textSecondary: '#665e5a',
    textMuted: '#968b86',
    accent: '#c85a49',
    accentHover: '#b44c3c',
    headerGradient: 'linear-gradient(135deg, #fdf8f6 0%, #f5eae6 100%)',
    inputBg: '#fdfbf9',
    inputBorder: 'rgba(195, 180, 165, 0.3)',
    shadow: '0 6px 20px rgba(135, 120, 105, 0.06)',
    shadowHover: '0 12px 30px rgba(135, 120, 105, 0.12), 0 4px 12px rgba(200, 90, 73, 0.04)',
    bottomNavBg: 'rgba(253, 251, 249, 0.85)',
    bottomNavBorder: 'rgba(195, 180, 165, 0.2)',
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
    
    // Add theme classes to document.documentElement and document.body for CSS targeting of portals
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
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
