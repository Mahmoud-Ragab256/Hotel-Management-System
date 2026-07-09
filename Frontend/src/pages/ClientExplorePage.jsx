import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, dashboardApi } from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

// Premium high-res images to match the exact look of the video
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
  deluxeSuite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  oceanView: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  gardenRoom: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  penthouse: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  valetParking: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
  wifi: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
  fineDining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
};

const isAccepted = (review) => {
  const status = (review.status || '').toString().toLowerCase();
  if (status) return status === 'accepted' || status === 'approved';
  if (typeof review.isAccepted === 'boolean') return review.isAccepted;
  if (typeof review.isApproved === 'boolean') return review.isApproved;
  return false;
};

function ExploreReviewCard({ rev, colors, isDark }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.bgCard,
        borderRadius: '20px',
        border: isHovered 
          ? `1px solid ${colors.borderHover}` 
          : `1px solid ${colors.borderCard}`,
        boxShadow: isHovered 
          ? colors.shadowHover 
          : colors.shadow,
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          {rev.avatar && !imgError ? (
            <img
              src={rev.avatar}
              alt={rev.name}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: colors.inputBg || 'rgba(0,0,0,0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.accent,
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              </svg>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {rev.name}
            </div>
            {rev.location && (
              <div style={{ fontSize: '12px', color: colors.textSecondary, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {rev.location}
              </div>
            )}
          </div>
        </div>

        {/* Golden stars on the right */}
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span 
              key={n} 
              style={{ 
                fontSize: '15px', 
                color: n <= rev.rating ? '#f59e0b' : (isDark ? '#374151' : '#e5e7eb'), 
                transition: 'color 0.2s' 
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {rev.text && (
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: colors.textPrimary,
          lineHeight: '1.75',
          fontWeight: '300',
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          "{rev.text}"
        </p>
      )}
    </div>
  );
}

export default function ClientExplorePage() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const [roomCategories, setRoomCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [guestsById, setGuestsById] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);

  // Fetch backend data
  useEffect(() => {
    (async () => {
      try {
        const [landingRes, statsRes] = await Promise.all([
          dashboardApi.getLandingPageData().catch(() => null),
          dashboardApi.getLandingStatistics().catch(() => null),
        ]);

        if (landingRes) {
          if (Array.isArray(landingRes.roomCategories)) {
            setRoomCategories(landingRes.roomCategories);
          }
          if (Array.isArray(landingRes.services)) {
            setServices(landingRes.services);
          }
          if (Array.isArray(landingRes.reviews)) {
            setReviews(landingRes.reviews);
            const guestIds = [...new Set(
              landingRes.reviews
                .map((r) => (typeof r.guestId === 'string' ? r.guestId : r.guestId?._id))
                .filter(Boolean)
            )];
            Promise.all(
              guestIds.map(async (id) => {
                try {
                  const guest = await dashboardApi.getGuest(id);
                  return [id, guest];
                } catch {
                  return [id, null];
                }
              })
            ).then((guestEntries) => {
              setGuestsById(Object.fromEntries(guestEntries));
            });
          }
        }

        if (statsRes) {
          setStatistics(statsRes);
        }
      } catch (err) {
        console.error("Error fetching landing page data:", err);
      }
    })();
  }, []);

  // Compute display rooms with fallbacks
  const displayRooms = useMemo(() => {
    if (roomCategories && roomCategories.length > 0) {
      return roomCategories.slice(0, 4).map((category, index) => {
        const name = category.name;
        const price = category.basePrice || 250;
        const capacityVal = category.capacity
          ? `Up to ${category.capacity.adults + (category.capacity.children || 0)} guests`
          : 'Up to 2 guests';
        const description = category.description || `Beautiful and elegant room category available at Aethos.`;
        
        let imageUrl = IMAGES.oceanView;
        if (Array.isArray(category.images) && category.images.length > 0) {
          const firstImg = category.images[0];
          imageUrl = firstImg.startsWith('http') ? firstImg : `${API_BASE_URL}/${firstImg}`;
        } else {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('deluxe')) imageUrl = IMAGES.deluxeSuite;
          else if (lowerName.includes('ocean')) imageUrl = IMAGES.oceanView;
          else if (lowerName.includes('garden')) imageUrl = IMAGES.gardenRoom;
          else if (lowerName.includes('penthouse') || lowerName.includes('presidential')) imageUrl = IMAGES.penthouse;
        }

        const bullets = Array.isArray(category.amenities) && category.amenities.length > 0
          ? category.amenities
          : ['All-inclusive access to beach and club pool', 'In-room high-speed Wi-Fi & Smart TV'];

        const size = `${(index + 2) * 15 + 20} m²`;

        return {
          id: category._id || category.id,
          name,
          price,
          capacity: capacityVal,
          size,
          description,
          bullets,
          image: imageUrl,
        };
      });
    }

    return [
      {
        id: 'fallback-1',
        name: 'Deluxe Suite',
        price: 450,
        capacity: 'Up to 2 guests',
        size: '65 m²',
        description: 'Spacious suite with panoramic city views and marble bathroom.',
        bullets: ['Floor-to-ceiling windows with breathtaking skyline views'],
        image: IMAGES.deluxeSuite,
      },
      {
        id: 'fallback-2',
        name: 'Ocean View Room',
        price: 350,
        capacity: 'Up to 2 guests',
        size: '45 m²',
        description: 'Elegant room overlooking the serene ocean with private balcony.',
        bullets: ['Private balcony with direct ocean access'],
        image: IMAGES.oceanView,
      },
      {
        id: 'fallback-3',
        name: 'Garden Room',
        price: 280,
        capacity: 'Up to 2 guests',
        size: '40 m²',
        description: 'Charming room nestled in lush tropical gardens with outdoor shower.',
        bullets: ['Private garden with outdoor rain shower'],
        image: IMAGES.gardenRoom,
      },
      {
        id: 'fallback-4',
        name: 'Penthouse',
        price: 1200,
        capacity: 'Up to 4 guests',
        size: '120 m²',
        description: 'Ultimate luxury penthouse with private terrace and infinity pool.',
        bullets: ['Private infinity pool with panoramic views'],
        image: IMAGES.penthouse,
      }
    ];
  }, [roomCategories]);

  // Compute display services with fallbacks
  const displayServices = useMemo(() => {
    if (services && services.length > 0) {
      return services.slice(0, 8).map((service) => {
        let resolvedImage = IMAGES.fineDining;
        
        if (Array.isArray(service.images) && service.images.length > 0) {
          const firstImg = service.images[0];
          resolvedImage = firstImg.startsWith('http') ? firstImg : `${API_BASE_URL}/${firstImg}`;
        } else {
          const imageUrl = service.image || service.imageUrl || service.img;
          if (imageUrl) {
            resolvedImage = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}/${imageUrl}`;
          } else {
            const lowerName = (service.name || '').toLowerCase();
            if (lowerName.includes('parking') || lowerName.includes('valet')) resolvedImage = IMAGES.valetParking;
            else if (lowerName.includes('wifi') || lowerName.includes('internet')) resolvedImage = IMAGES.wifi;
            else if (lowerName.includes('dining') || lowerName.includes('dinner') || lowerName.includes('restaurant')) resolvedImage = IMAGES.fineDining;
          }
        }

        let icon = (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        );

        const lowerName = (service.name || '').toLowerCase();
        if (lowerName.includes('wifi') || lowerName.includes('internet')) {
          icon = (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.284 16.284A3 3 0 0 0 12 17a3 3 0 0 0 3.716-4.716m-7.432 0A5 5 0 0 1 12 11a5 5 0 0 1 7.432 1.284m-14.864 0A9 9 0 0 1 12 3a9 9 0 0 1 12 9.284M12 21v-1" />
            </svg>
          );
        } else if (lowerName.includes('parking') || lowerName.includes('valet') || lowerName.includes('car')) {
          icon = (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 0 1-1.125-1.125V15h1.5a1.5 1.5 0 0 0 3 0V15h9a1.5 1.5 0 0 0 3 0V15h1.5a1.125 1.125 0 0 1 1.125 1.125v2.625a1.5 1.5 0 0 1-3 0m-3 0a1.5 1.5 0 0 0-3 0m-3 0h6m.75-9-3-3H4.5a2.25 2.25 0 0 0-2.25 2.25V15h16.5V9.75A2.25 2.25 0 0 0 16.5 7.5h-2.25l-1.5 1.5z" />
            </svg>
          );
        } else if (lowerName.includes('spa') || lowerName.includes('massage') || lowerName.includes('wellness')) {
          icon = (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
            </svg>
          );
        }

        return {
          name: service.name,
          description: service.description || `Enjoy our exquisite ${service.name} services.`,
          image: resolvedImage,
          icon,
        };
      });
    }

    return [
      {
        name: 'Valet Parking',
        description: 'Complimentary valet parking for all guests',
        image: IMAGES.valetParking,
        icon: (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 0 1-1.125-1.125V15h1.5a1.5 1.5 0 0 0 3 0V15h9a1.5 1.5 0 0 0 3 0V15h1.5a1.125 1.125 0 0 1 1.125 1.125v2.625a1.5 1.5 0 0 1-3 0m-3 0a1.5 1.5 0 0 0-3 0m-3 0h6m.75-9-3-3H4.5a2.25 2.25 0 0 0-2.25 2.25V15h16.5V9.75A2.25 2.25 0 0 0 16.5 7.5h-2.25l-1.5 1.5z" />
          </svg>
        )
      },
      {
        name: 'High-Speed WiFi',
        description: 'Stay connected with complimentary high-speed internet throughout the property',
        image: IMAGES.wifi,
        icon: (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.284 16.284A3 3 0 0 0 12 17a3 3 0 0 0 3.716-4.716m-7.432 0A5 5 0 0 1 12 11a5 5 0 0 1 7.432 1.284m-14.864 0A9 9 0 0 1 12 3a9 9 0 0 1 12 9.284M12 21v-1" />
          </svg>
        )
      },
      {
        name: 'Fine Dining',
        description: 'World-class cuisine prepared by our award-winning chefs',
        image: IMAGES.fineDining,
        icon: (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        )
      }
    ];
  }, [services]);

  // Compute display reviews with fallbacks
  const displayReviews = useMemo(() => {
    const avatarUrls = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    ];

    if (reviews && reviews.length > 0) {
      return reviews.slice(0, 4).map((review, index) => {
        const guestId = typeof review.guestId === 'string' ? review.guestId : review.guestId?._id;
        const guest = guestsById[guestId] || (review.guestId && typeof review.guestId === 'object' ? review.guestId : {});
        const name = guest.fullName || 'Guest';
        const text = review.comment || '';
        const location = guest.address || 'Verified Guest';

        let avatar = null;
        if (guest.avatar) {
          avatar = guest.avatar.startsWith('http') ? guest.avatar : `${API_BASE_URL}/${guest.avatar.replace(/^\//, '')}`;
        } else {
          avatar = avatarUrls[index % avatarUrls.length];
        }

        return {
          name,
          location,
          rating: Number(review.rating) || 5,
          text,
          avatar
        };
      });
    }

    return [
      {
        name: 'Eleanor Vance',
        location: 'New York, NY',
        rating: 5,
        text: 'The most extraordinary stay I\'ve ever experienced. Every detail was curated with impeccable taste.',
        avatar: avatarUrls[0]
      },
      {
        name: 'Marcus Chen',
        location: 'San Francisco, CA',
        rating: 5,
        text: 'Aethos redefines luxury. The service was flawless and the ambiance was absolutely breathtaking.',
        avatar: avatarUrls[1]
      },
      {
        name: 'Sophia Laurent',
        location: 'Paris, France',
        rating: 5,
        text: 'An oasis of tranquility. The attention to detail in every corner of the hotel is remarkable.',
        avatar: avatarUrls[2]
      },
      {
        name: 'James Okonkwo',
        location: 'Lagos, Nigeria',
        rating: 5,
        text: 'Exceptional hospitality that makes you feel like royalty. I can\'t wait to return.',
        avatar: avatarUrls[3]
      }
    ];
  }, [reviews, guestsById]);

  // Auto scroll services carousel
  useEffect(() => {
    if (displayServices.length === 0) return;
    const timer = setInterval(() => {
      setActiveServiceIdx((prev) => (prev + 1) % displayServices.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayServices.length]);

  const handleBeginJourney = () => {
    navigate('/book-stay');
  };

  return (
    <div style={{ background: colors.bgMain, color: colors.textPrimary, fontFamily: '"Playfair Display", "Georga", "Inter", sans-serif', minHeight: '100vh', paddingBottom: '120px' }}>
        {/* Hero Section */}
      <div className="explore-hero-section" style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.35)), url(${IMAGES.hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '140px 24px 80px 24px',
        boxSizing: 'border-box'
      }}>
        <div style={{ flexGrow: 1 }} />
        
        <div style={{ maxWidth: '800px', zIndex: 2, marginBottom: '40px', textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '16px',
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500
          }}>
            Where every sunrise brings new possibilities
          </p>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            fontFamily: '"Playfair Display", serif'
          }}>
            Welcome to Aethos
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 24px)',
            color: '#e5e5e5',
            fontStyle: 'italic',
            marginBottom: '40px',
            fontWeight: 300
          }}>
            Your sanctuary of timeless luxury
          </p>
          <button
            onClick={handleBeginJourney}
            style={{
              background: '#c85a49',
              color: '#ffffff',
              border: 'none',
              borderRadius: '30px',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(200, 90, 73, 0.3)',
              transition: 'all 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(200, 90, 73, 0.4)';
              e.currentTarget.style.background = '#d16b5a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(200, 90, 73, 0.3)';
              e.currentTarget.style.background = '#c85a49';
            }}
          >
            Begin Your Journey
          </button>
        </div>

        <div style={{ flexGrow: 1 }} />

        {/* Our Promise Section */}
        <div style={{ maxWidth: '1200px', width: '100%', padding: '0 24px', zIndex: 10, boxSizing: 'border-box' }}>
          <div className="explore-promise-card" style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f7f2eb',
            backdropFilter: isDark ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(10px)' : 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${colors.borderCard}`,
            borderRadius: '24px',
            padding: '48px',
            boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.5)' : colors.shadow
          }}>
            <div className="explore-promise-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#c85a49',
                  marginBottom: '16px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700
                }}>
                  Our Promise
                </h2>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: isDark ? '#e5e7eb' : colors.textSecondary,
                  margin: 0,
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300
                }}>
                  Nestled in the heart of an exclusive coastal enclave, Aethos is more than a hotel—it's a destination where timeless elegance meets modern sophistication. Our 120 meticulously designed rooms and suites blend artisanal craftsmanship with cutting-edge comfort, each offering a unique perspective on luxury living.
                </p>
              </div>

              <div className="explore-stats-wrapper" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: `1px solid ${colors.borderCard}`,
                paddingLeft: '40px',
                flexWrap: 'wrap',
                gap: '24px'
              }}>
                <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
                    {statistics ? statistics.totalRooms : 120}
                  </div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#cbd5e1' : colors.textSecondary, marginTop: '4px', fontFamily: '"Inter", sans-serif' }}>Luxury Rooms</div>
                </div>
                <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
                    {statistics ? statistics.totalServices : 5}
                  </div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#cbd5e1' : colors.textSecondary, marginTop: '4px', fontFamily: '"Inter", sans-serif' }}>Services</div>
                </div>
                <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
                    {statistics ? (statistics.totalRooms > 0 ? Math.round((statistics.availableRooms / statistics.totalRooms) * 100) : 98) : 98}%
                  </div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#cbd5e1' : colors.textSecondary, marginTop: '4px', fontFamily: '"Inter", sans-serif' }}>Availability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: '100px' }} />

      {/* Our Best Rooms Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '60px',
          letterSpacing: '-0.02em',
          fontFamily: '"Playfair Display", serif'
        }}>
          Our Best Rooms
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {displayRooms.map((room, index) => {
            const isEven = index % 2 === 0;
            const gradient = isDark
              ? (isEven
                ? `linear-gradient(to right, rgba(22, 22, 22, 0.9) 0%, rgba(22, 22, 22, 0.72) 40%, rgba(22, 22, 22, 0) 100%)`
                : `linear-gradient(to left, rgba(22, 22, 22, 0.9) 0%, rgba(22, 22, 22, 0.72) 40%, rgba(22, 22, 22, 0) 100%)`)
              : (isEven
                ? `linear-gradient(to right, rgba(253, 248, 247, 0.88) 0%, rgba(253, 248, 247, 0.45) 35%, rgba(253, 248, 247, 0) 70%)`
                : `linear-gradient(to left, rgba(253, 248, 247, 0.88) 0%, rgba(253, 248, 247, 0.45) 35%, rgba(253, 248, 247, 0) 70%)`);

            const isHovered = hoveredRoomId === room.id;

            return (
              <div
                key={room.id}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
                className="explore-room-card"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: isEven ? 'flex-start' : 'flex-end',
                  alignItems: 'center',
                  minHeight: '480px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  isolation: 'isolate',
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: isHovered
                    ? (isDark 
                        ? '0 0 0 1.5px rgba(200, 90, 73, 0.45), 0 0 20px rgba(200, 90, 73, 0.25), 0 16px 36px rgba(0, 0, 0, 0.4)' 
                        : '0 0 0 1.5px rgba(200, 90, 73, 0.35), 0 0 16px rgba(200, 90, 73, 0.15), 0 14px 32px rgba(200, 90, 73, 0.12)')
                    : (isDark 
                        ? '0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 36px rgba(0, 0, 0, 0.25)' 
                        : '0 0 0 1px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.03)'),
                  border: 'none',
                  transform: isHovered ? 'translate3d(0, -6px, 0)' : 'translate3d(0, 0, 0)',
                  WebkitTransform: isHovered ? 'translate3d(0, -6px, 0)' : 'translate3d(0, 0, 0)',
                  transition: 'transform 0.8s cubic-bezier(0.15, 0.85, 0.35, 1), box-shadow 0.8s cubic-bezier(0.15, 0.85, 0.35, 1), border-color 0.8s cubic-bezier(0.15, 0.85, 0.35, 1)',
                }}
              >
                {/* Background Zooming Photo Layer */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${room.image})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  transform: isHovered ? 'scale(1.04) translate3d(0, 0, 0)' : 'scale(1) translate3d(0, 0, 0)',
                  WebkitTransform: isHovered ? 'scale(1.04) translate3d(0, 0, 0)' : 'scale(1) translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transition: 'transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1)',
                  zIndex: 0
                }} />

                {/* Background gradient overlay layer */}
                <div className="explore-room-gradient-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: gradient,
                  zIndex: 1,
                  transition: 'all 0.8s cubic-bezier(0.15, 0.85, 0.35, 1)'
                }} />

                {/* Price tag positioned opposite to the rest of the content of room overview */}
                <div className="explore-room-opposite-price" style={{
                  left: isEven ? 'auto' : '48px',
                  right: isEven ? '48px' : 'auto',
                }}>
                  <span className="explore-room-price-tag" style={{
                    background: colors.accent,
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '15px',
                    fontFamily: '"Inter", sans-serif',
                    boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(200, 90, 73, 0.12)',
                  }}>
                    ${room.price}/night
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="explore-room-overlay" style={{
                  padding: '48px',
                  zIndex: 2,
                  maxWidth: '550px',
                  width: '100%',
                  textAlign: isEven ? 'left' : 'right'
                }}>
                  <h3 style={{ 
                    fontSize: '32px', 
                    fontWeight: 600, 
                    marginBottom: '16px', 
                    fontFamily: '"Playfair Display", serif',
                    textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.6)' : 'none',
                    color: colors.textPrimary
                  }}>
                    {room.name}
                  </h3>
                  <p style={{ 
                    fontSize: '15px', 
                    color: colors.textSecondary, 
                    lineHeight: '1.6', 
                    marginBottom: '24px', 
                    fontFamily: '"Inter", sans-serif',
                    textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                  }}>
                    {room.description}
                  </p>
                  
                  <div className="explore-room-meta" style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    justifyContent: isEven ? 'flex-start' : 'flex-end',
                    marginBottom: '24px', 
                    fontFamily: '"Inter", sans-serif', 
                    fontSize: '14px', 
                    color: colors.textSecondary,
                    textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                      </svg>
                      {room.size}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {room.capacity}
                    </span>
                  </div>

                  <div className="explore-room-bullets" style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isEven ? 'flex-start' : 'flex-end',
                    gap: '8px',
                    margin: '0', 
                    color: isDark ? '#fca5a5' : colors.accent, 
                    fontSize: '14px', 
                    fontFamily: '"Inter", sans-serif', 
                    lineHeight: '1.6',
                    textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                  }}>
                    {room.bullets && room.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="explore-room-bullet-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexDirection: isEven ? 'row' : 'row-reverse'
                      }}>
                        <span className="explore-room-bullet-dot" style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: isDark ? '#fca5a5' : colors.accent, flexShrink: 0 }} />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons underneath rooms */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '60px' }}>
          <button
            onClick={() => navigate('/book-stay')}
            style={{
              background: colors.accent,
              color: '#ffffff',
              border: 'none',
              borderRadius: '30px',
              padding: '14px 36px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.accentHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.accent; }}
          >
            Book Now
          </button>
          <button
            onClick={() => navigate('/rooms')}
            style={{
              background: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.borderCard}`,
              borderRadius: '30px',
              padding: '14px 36px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.background = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.borderCard;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Explore More
          </button>
        </div>
      </div>

      {/* Our Services Section */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px', boxSizing: 'border-box' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '60px',
          letterSpacing: '-0.02em',
          fontFamily: '"Playfair Display", serif'
        }}>
          Our Services
        </h2>

        {displayServices.length > 0 && (
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.8)), url(${displayServices[activeServiceIdx]?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 24px',
            transition: 'background-image 0.5s ease-in-out',
          }}>
            {/* Active Service Content */}
            <div style={{
              maxWidth: '650px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '24px',
              zIndex: 2,
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#c85a49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(200, 90, 73, 0.4)',
                transform: 'scale(1.1)'
              }}>
                {displayServices[activeServiceIdx]?.icon}
              </div>
              <h3 style={{
                fontSize: '36px',
                fontWeight: 600,
                fontFamily: '"Playfair Display", serif',
                margin: 0,
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)'
              }}>
                {displayServices[activeServiceIdx]?.name}
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#f3f4f6',
                lineHeight: '1.7',
                margin: 0,
                fontFamily: '"Inter", sans-serif',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)'
              }}>
                {displayServices[activeServiceIdx]?.description}
              </p>
            </div>

            {/* Slider Dots Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              display: 'flex',
              gap: '10px',
              zIndex: 2
            }}>
              {displayServices.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServiceIdx(idx)}
                  style={{
                    width: idx === activeServiceIdx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === activeServiceIdx ? '#c85a49' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guest Reviews Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '60px',
          letterSpacing: '-0.02em',
          fontFamily: '"Playfair Display", serif',
          color: colors.textPrimary
        }}>
          Guest Reviews
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {displayReviews.map((rev, idx) => (
            <ExploreReviewCard key={idx} rev={rev} colors={colors} isDark={isDark} />
          ))}
        </div>

        {/* See More Reviews Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <button
            onClick={() => navigate('/reviews')}
            style={{
              background: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.borderCard}`,
              borderRadius: '30px',
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.background = colors.bgCardHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.borderCard;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            See More Reviews
          </button>
        </div>
      </div>

      {/* Ready for unforgettable stay CTA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{
          background: '#c85a49',
          borderRadius: '24px',
          padding: '64px 24px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(200, 90, 73, 0.2)'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 700,
            marginBottom: '12px',
            fontFamily: '"Playfair Display", serif'
          }}>
            Ready for an Unforgettable Stay?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '32px',
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300
          }}>
            Book directly and receive exclusive benefits
          </p>
          <button
            onClick={() => navigate('/book-stay')}
            style={{
              background: '#ffffff',
              color: '#c85a49',
              border: 'none',
              borderRadius: '30px',
              padding: '14px 36px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Explore Rooms
          </button>
        </div>
      </div>

      {/* Custom Elite Footer */}
      <footer style={{ background: isDark ? '#0a0a0a' : '#fcfbf9', borderTop: `1px solid ${colors.borderCard}`, padding: '80px 24px 40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top Row: Logo & Name on Left, Social Links on Right */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.borderCard}`,
            paddingBottom: '32px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <div>
                <h3 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, fontFamily: '"Playfair Display", serif', color: colors.textPrimary }}>Aethos</h3>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: colors.textSecondary, margin: 0, fontFamily: '"Inter", sans-serif' }}>Luxury Hotel</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Social icons */}
              <a href="#" style={{ color: colors.textSecondary, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" style={{ color: colors.textSecondary, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.565 3.425A9.874 9.874 0 010 19.54a13.94 13.94 0 007.548 2.212c9.058 0 14.01-7.496 14.01-13.986 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" style={{ color: colors.textSecondary, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Middle Content Grid: 4 standard columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}>
            {/* Column 1: Brand Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, fontFamily: '"Inter", sans-serif', fontWeight: 700, margin: '0 0 8px 0' }}>About Us</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6', fontFamily: '"Inter", sans-serif', margin: 0 }}>
                Aethos is an ultra-luxury sanctuary offering curated stays, premium wellness services, and gourmet dining in unmatched locations worldwide.
              </p>
            </div>

            {/* Column 2: Hotel Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, fontFamily: '"Inter", sans-serif', fontWeight: 700, margin: '0 0 12px 0' }}>Hotel</h4>
              <Link to="/rooms" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Rooms</Link>
              <Link to="/services" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Dining</Link>
              <Link to="/services" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Spa & Wellness</Link>
              <Link to="/services" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Events & Meetings</Link>
            </div>

            {/* Column 3: Support Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, fontFamily: '"Inter", sans-serif', fontWeight: 700, margin: '0 0 12px 0' }}>Support</h4>
              <Link to="/help-center" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>FAQs</Link>
              <Link to="/help-center" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Cancellation Policy</Link>
              <Link to="/help-center" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Accessibility</Link>
              <Link to="/help-center" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '14px', fontFamily: '"Inter", sans-serif', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Careers</Link>
            </div>

            {/* Column 4: Contact/Newsletter info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.accent, fontFamily: '"Inter", sans-serif', fontWeight: 700, margin: '0 0 12px 0' }}>Connect</h4>
              <span style={{ color: colors.textSecondary, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Email: info@aethoshotels.com</span>
              <span style={{ color: colors.textSecondary, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Phone: +1 (800) 555-0199</span>
              <span style={{ color: colors.textSecondary, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Address: 45 Ocean Drive, Malibu</span>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${colors.borderCard}`,
            paddingTop: '32px',
            flexWrap: 'wrap',
            gap: '24px',
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: '"Inter", sans-serif'
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: colors.textSecondary, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Privacy Policy</a>
              <a href="#" style={{ color: colors.textSecondary, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Terms of Service</a>
              <a href="#" style={{ color: colors.textSecondary, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>Contact Us</a>
            </div>
            <div>
              © 2026 Aethos. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive custom style injections for hero and best rooms */}
      <style>{`
        /* Desktop Price spacing guarantee and absolute opposite placement */
        .explore-room-opposite-price {
          position: absolute !important;
          top: 48px !important;
          z-index: 3 !important;
        }

        @media (max-width: 991.98px) {
          .explore-hero-section {
            padding: 100px 20px 50px 20px !important;
            min-height: auto !important;
          }

          /* Promise section / Stats centering */
          .explore-promise-card {
            padding: 32px 24px !important;
          }
          .explore-promise-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center !important;
          }
          .explore-stats-wrapper {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : colors.borderCard} !important;
            padding-top: 32px !important;
            justify-content: center !important;
            gap: 40px !important;
            width: 100% !important;
          }

          /* Rooms Section layout - Same design but mobile-suitable */
          .explore-room-card {
            flex-direction: column !important;
            justify-content: flex-end !important;
            align-items: stretch !important;
            min-height: 520px !important;
            transition: transform 0.8s cubic-bezier(0.15, 0.85, 0.35, 1) !important;
          }
          .explore-room-gradient-overlay {
            background: ${isDark 
              ? 'linear-gradient(180deg, rgba(22, 22, 22, 0.1) 0%, rgba(22, 22, 22, 0.6) 60%, rgba(22, 22, 22, 0.92) 100%)' 
              : 'linear-gradient(180deg, rgba(253, 248, 247, 0.05) 0%, rgba(253, 248, 247, 0.35) 60%, rgba(253, 248, 247, 0.82) 100%)'
            } !important;
          }
          .explore-room-overlay {
            padding: 36px 28px !important;
            max-width: 100% !important;
            text-align: left !important;
            margin-top: auto !important;
          }
          .explore-room-opposite-price {
            top: 28px !important;
            left: auto !important;
            right: 28px !important;
          }
          .explore-room-overlay h3 {
            font-size: 26px !important;
            margin-bottom: 12px !important;
          }
          .explore-room-overlay p {
            font-size: 14.5px !important;
            margin-bottom: 20px !important;
          }
          .explore-room-meta {
            justify-content: flex-start !important;
            margin-bottom: 20px !important;
            gap: 20px !important;
          }
          .explore-room-bullets {
            align-items: flex-start !important;
            gap: 6px !important;
          }
          .explore-room-bullet-item {
            flex-direction: row !important;
          }
        }

        @media (max-width: 576px) {
          .explore-room-card {
            min-height: 480px !important;
          }
          .explore-room-overlay {
            padding: 24px 20px !important;
          }
          .explore-room-overlay h3 {
            font-size: 22px !important;
          }
          .explore-room-overlay p {
            font-size: 13.5px !important;
            margin-bottom: 16px !important;
          }
          .explore-room-opposite-price {
            top: 20px !important;
            right: 20px !important;
          }
          .explore-room-meta {
            margin-bottom: 16px !important;
            gap: 16px !important;
          }
          .explore-stats-wrapper {
            gap: 24px !important;
          }
        }
      `}</style>

    </div>
  );
}
