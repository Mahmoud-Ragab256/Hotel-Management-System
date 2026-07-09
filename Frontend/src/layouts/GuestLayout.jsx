import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import useAdminShortcut from '../utils/AdminShortcut.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function PageSkeleton({ isDark, colors }) {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingTop: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: ${isDark 
            ? 'linear-gradient(90deg, #1e1d1d 25%, #2d2a29 37%, #1e1d1d 63%)' 
            : 'linear-gradient(90deg, #f3eded 25%, #faf6f6 37%, #f3eded 63%)'};
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>

      {/* Large Banner Shape */}
      <div className="skeleton-shimmer" style={{
        height: '240px',
        width: '100%',
        borderRadius: '24px',
        marginBottom: '16px'
      }} />

      {/* Grid of cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderCard}`,
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Image Placeholder */}
            <div className="skeleton-shimmer" style={{
              height: '180px',
              borderRadius: '16px',
              width: '100%'
            }} />
            {/* Title Placeholder */}
            <div className="skeleton-shimmer" style={{
              height: '20px',
              borderRadius: '6px',
              width: '60%'
            }} />
            {/* Paragraph Placeholder */}
            <div className="skeleton-shimmer" style={{
              height: '12px',
              borderRadius: '4px',
              width: '90%'
            }} />
            {/* Small action placeholder */}
            <div className="skeleton-shimmer" style={{
              height: '12px',
              borderRadius: '4px',
              width: '40%'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuestLayout() {
  useAdminShortcut();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors, theme, isDark } = useTheme();

  const [pageLoading, setPageLoading] = React.useState(false);

  const isHomePage = location.pathname === '/' || location.pathname === '';

  // Function to determine if a bottom navigation tab is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(path);
  };

  // Route loading state effect (simulating a slight content load for premium experience)
  React.useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450); // Fast, high-quality micro-interaction (450ms)

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll Reveal Intersection Observer effect
  React.useEffect(() => {
    if (pageLoading) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      // 1. Headers & Main Banners - Elegant top fade with subtle scale
      const headers = document.querySelectorAll('main h1, main h2, .client-services-header, .help-center-header, .my-bookings-header, .explore-hero-content');
      headers.forEach((el) => {
        el.classList.add('reveal-item', 'reveal-header');
        observer.observe(el);
      });

      // 2. Dual-Column Grid Containers - Animate organically from left & right to frame the viewport
      const profileGrids = document.querySelectorAll('.profile-grid-container');
      profileGrids.forEach((grid) => {
        const leftCol = grid.firstElementChild;
        const rightCol = grid.lastElementChild;
        if (leftCol) {
          leftCol.classList.add('reveal-item', 'reveal-left');
          observer.observe(leftCol);
        }
        if (rightCol && rightCol !== leftCol) {
          rightCol.classList.add('reveal-item', 'reveal-right');
          observer.observe(rightCol);
        }
      });

      // 3. Grid Cards (Rooms, Services, Bookings, Reviews, FAQs) - Stagger sequentially with tailor-made animations
      const cards = document.querySelectorAll('.room-card, .service-card, .booking-card, .review-card, .faq-section, .card, .form-container');
      const parentMap = new Map();
      cards.forEach((card) => {
        const parent = card.parentElement;
        if (!parentMap.has(parent)) {
          parentMap.set(parent, []);
        }
        parentMap.get(parent).push(card);
      });

      parentMap.forEach((group) => {
        group.forEach((card, index) => {
          card.classList.add('reveal-item');
          
          if (card.classList.contains('room-card')) {
            card.classList.add('reveal-room');
            card.style.transitionDelay = `${index * 140}ms`;
          } else if (card.classList.contains('service-card')) {
            card.classList.add('reveal-service');
            card.style.transitionDelay = `${index * 100}ms`;
          } else if (card.classList.contains('review-card')) {
            card.classList.add('reveal-review');
            card.style.transitionDelay = `${index * 100}ms`;
          } else {
            card.classList.add('reveal-card');
            card.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
          }
          
          observer.observe(card);
        });
      });

      // 4. Large General Sections & Layout Containers
      const generalContainers = document.querySelectorAll('.explore-section, .help-center-container, .room-details-container, .reviews-container');
      generalContainers.forEach((el) => {
        el.classList.add('reveal-item', 'reveal-general');
        observer.observe(el);
      });

      return () => {
        // Clean up observers
        headers.forEach((el) => observer.unobserve(el));
        profileGrids.forEach((grid) => {
          if (grid.firstElementChild) observer.unobserve(grid.firstElementChild);
          if (grid.lastElementChild) observer.unobserve(grid.lastElementChild);
        });
        cards.forEach((card) => observer.unobserve(card));
        generalContainers.forEach((el) => observer.unobserve(el));
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, pageLoading]);

  return (
    <div style={{ background: colors.bgMain, minHeight: '100vh', display: 'flex', flexDirection: 'column', color: colors.textPrimary, transition: 'background 0.5s ease, color 0.5s ease' }}>
      
      {/* Global CSS injection for scroll reveal and general transitions */}
      <style>{`
        /* Base reveal state */
        .reveal-item {
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        /* Elegant vertical compress & slight scale for main titles & banners */
        .reveal-header {
          transform: translateY(-20px) scale(0.985);
        }

        /* Smooth left-to-right entry for sidebar elements */
        .reveal-left {
          transform: translateX(-35px);
        }

        /* Smooth right-to-left entry for content containers */
        .reveal-right {
          transform: translateX(35px);
        }

        /* Room Cards: Sliding elegantly from left to right */
        .reveal-room {
          transform: translateX(-50px) scale(0.985);
        }

        /* Service Cards: Falling gracefully from above with premium bouncy cushion landing */
        .reveal-service {
          transform: translateY(-60px) scale(0.975);
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.15) !important;
        }

        /* Review Cards: Falling gracefully from above with premium cushion landing */
        .reveal-review {
          transform: translateY(-50px) scale(0.98);
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.12) !important;
        }

        /* Floating pop and scale effect for content cards and visual components */
        .reveal-card {
          transform: translateY(30px) scale(0.97);
        }

        /* Standard upward glide for general section blocks */
        .reveal-general {
          transform: translateY(20px);
        }

        /* Revealed active state reset */
        .reveal-item.revealed {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }

        /* Responsive content padding helper to prevent mobile layout squeeze and overflow */
        .guest-content-wrapper {
          padding: 24px 12px 100px 12px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 576px) {
          .guest-content-wrapper {
            padding: 40px 24px 100px 24px;
          }
        }
      `}</style>

      {/* Immersive Theme-aware Header */}
      <Header />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {pageLoading ? (
          <div className="guest-content-wrapper" style={{ paddingTop: isHomePage ? '80px' : undefined }}>
            <PageSkeleton isDark={isDark} colors={colors} />
          </div>
        ) : isHomePage ? (
          <Outlet />
        ) : (
          <div className="guest-content-wrapper">
            <Outlet />
          </div>
        )}
      </main>

      {/* Persistent Glassmorphism Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(12px + env(safe-area-inset-bottom, 12px))',
        left: '50%',
        transform: 'translateX(-50%) translateZ(0)',
        WebkitTransform: 'translateX(-50%) translateZ(0)',
        willChange: 'transform',
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
