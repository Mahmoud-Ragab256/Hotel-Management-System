import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser, isAuthenticated } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://hotel-management-system-sigma-ruby.vercel.app';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${BASE_URL}/${img}`;
  return null;
};

const DETAILS_TEXT =
  'Available around the clock with a specialized, certified hotel team that ensures fast execution and consistently high quality.';

function MessageBox({ type, message, onClose }) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', icon: '✅' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5', icon: '❌' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', icon: '⚠️' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ fontSize: 13, color: c.text, fontWeight: 500, flex: 1, fontFamily: '"Inter", sans-serif' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: c.text, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ServiceCard({ service, index, onRequest, msgRef }) {
  const { colors, isDark } = useTheme();
  const isLeft = index % 2 === 0;
  const imageUrl = resolveImageUrl(service.image || service.imageUrl || service.img);
  const isAvailable = service.status !== 'Unavailable' && service.isActive !== false;
  const [localMsg, setLocalMsg] = useState(null);

  const handleRequest = async () => {
    setLocalMsg(null);
    const result = await onRequest(service);
    if (result) {
      setLocalMsg(result);
      setTimeout(() => {
        msgRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isLeft ? 'flex-start' : 'flex-end',
      width: '100%',
    }}>
      <div 
        style={{
          background: colors.bgCard,
          borderRadius: 20,
          overflow: 'hidden',
          border: `1px solid ${colors.borderCard}`,
          display: 'flex',
          flexDirection: isLeft ? 'row' : 'row-reverse',
          alignItems: 'stretch',
          gap: 32,
          width: '100%',
          maxWidth: '880px',
          flexWrap: 'wrap',
          boxShadow: colors.shadow,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = colors.shadowHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = colors.borderCard;
          e.currentTarget.style.boxShadow = colors.shadow;
        }}
      >
        {/* Service Image Block */}
        <div style={{ flex: '1 1 320px', background: colors.inputBg, position: 'relative', minHeight: 320 }}>
          {imageUrl ? (
            <img src={imageUrl} alt={service.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div style={{ height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4b5563', gap: 10 }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: 12, fontFamily: '"Inter", sans-serif' }}>No preview image</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 1 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isAvailable ? '#10b981' : '#fca5a5',
              border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              fontFamily: '"Inter", sans-serif'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Details and Request Form */}
        <div style={{
          flex: '1 1 380px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {service.category && (
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: '"Inter", sans-serif' }}>
                {service.category}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, margin: 0, fontFamily: '"Playfair Display", serif' }}>{service.name}</h3>
              {service.price !== undefined && (
                <div style={{ fontSize: 22, fontWeight: 700, color: colors.accent, flexShrink: 0, fontFamily: '"Inter", sans-serif' }}>${service.price}</div>
              )}
            </div>

            {service.description && (
              <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, margin: 0, fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>{service.description}</p>
            )}

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontFamily: '"Inter", sans-serif' }}>Details</div>
              <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, margin: 0, fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>{DETAILS_TEXT}</p>
            </div>

            {localMsg && (
              <div ref={msgRef} style={{ marginTop: '10px' }}>
                <MessageBox type={localMsg.type} message={localMsg.text} onClose={() => setLocalMsg(null)} />
              </div>
            )}
          </div>

          <button
            onClick={handleRequest}
            disabled={!isAvailable}
            style={{
              padding: '12px 28px', borderRadius: '24px', border: 'none',
              background: isAvailable ? colors.accent : colors.inputBg,
              color: isAvailable ? '#ffffff' : colors.textMuted,
              fontWeight: 600, fontSize: 14,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              alignSelf: isLeft ? 'flex-end' : 'flex-start',
              transition: 'background 0.2s',
              fontFamily: '"Inter", sans-serif',
              marginTop: '16px'
            }}
            onMouseEnter={(e) => { if (isAvailable) e.currentTarget.style.background = colors.accentHover; }}
            onMouseLeave={(e) => { if (isAvailable) e.currentTarget.style.background = colors.accent; }}
          >
            Request Service
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientServicesPage() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const msgRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getServices();
        setServices(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRequest = async (service) => {
    if (!isAuthenticated()) {
      navigate('/guest-login', { state: { from: { pathname: '/our-services' } } });
      return null;
    }

    try {
      const user = getCurrentUser();
      const guestId = user?._id || user?.id;
      const bookings = await dashboardApi.getBookings();
      const activeBooking = bookings.find((b) => {
        const isGuest = (b.guestId?._id || b.guestId) === guestId;
        const isActive = ['Pending', 'Confirmed', 'CheckedIn'].includes(b.status);
        return isGuest && isActive;
      });

      if (!activeBooking) {
        return { type: 'warning', text: 'You cannot request a service without an active room booking. Please book a room first.' };
      }

      await dashboardApi.createServiceOrder({
        bookingId: activeBooking._id || activeBooking.id,
        serviceId: service._id || service.id,
        quantity: 1,
        totalPrice: service.price || 0,
        notes: '',
      });

      return { type: 'success', text: 'Service request sent successfully!' };
    } catch (err) {
      return { type: 'error', text: getApiErrorMessage(err) };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, fontFamily: '"Inter", sans-serif', paddingBottom: '120px' }}>
      
      {/* Services Header - Sleek Dynamic Theme */}
      <div style={{
        background: colors.accent,
        borderBottom: `1px solid ${colors.borderCard}`,
        boxShadow: '0 10px 30px rgba(200, 90, 73, 0.15)',
        padding: '60px 24px 48px',
        textAlign: 'center',
        borderRadius: '24px',
        margin: '20px 24px 0',
      }}>
        <div style={{ 
          fontSize: '11px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          marginBottom: '12px' 
        }}>
          Hotel Services
        </div>
        <h1 style={{ 
          fontSize: 'clamp(26px, 5vw, 42px)', 
          fontWeight: '700', 
          color: '#ffffff', 
          margin: '0 0 12px', 
          letterSpacing: '-0.02em', 
          fontFamily: '"Playfair Display", serif' 
        }}>
          Our Premium Services
        </h1>
        <p style={{ 
          fontSize: '15px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          margin: '0 auto', 
          maxWidth: '480px', 
          fontWeight: '300', 
          lineHeight: '1.6' 
        }}>
          Everything you need for a perfect stay, curated with exceptional hospitality.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>
            <div style={{ width: '36px', height: '36px', border: `3px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Loading services...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px 18px', color: '#fca5a5', fontSize: '14px' }}>
            Could not load services: {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No services available at the moment.</p>
          </div>
        )}

        {!loading && !error && services.map((service, index) => (
          <ServiceCard
            key={service._id || service.id || index}
            service={service}
            index={index}
            onRequest={handleRequest}
            msgRef={msgRef}
          />
        ))}
      </div>
    </div>
  );
}
