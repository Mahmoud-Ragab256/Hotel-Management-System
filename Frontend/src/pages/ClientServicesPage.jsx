import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser, isAuthenticated } from '../services/auth.js';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://hotel-management-system-sigma-ruby.vercel.app';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${BASE_URL}/${img}`;
  return null;
};

const STATIC_DETAILS = [
  { icon: '🕐', label: 'Available 24/7' },
  { icon: '👨‍💼', label: 'Specialized Team' },
  { icon: '⚡', label: 'Fast Execution' },
  { icon: '⭐', label: 'High Quality' },
  { icon: '✅', label: 'Hotel Certified' },
];

function MessageBox({ type, message, onClose }) {
  const colors = {
    success: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: '✅' },
    error:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <span style={{ fontSize: 14, color: c.text, fontWeight: 500, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: c.text, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ServiceCard({ service, index, onRequest, msgRef }) {
  const isLeft = index % 2 === 0;
  const imageUrl = resolveImageUrl(service.image || service.imageUrl || service.img);
  const isAvailable = service.status !== 'Unavailable' && service.isActive !== false;
  const [localMsg, setLocalMsg] = useState(null);

  const handleRequest = async () => {
    setLocalMsg(null);
    const result = await onRequest(service);
    if (result) {
      setLocalMsg(result);
      // scroll to message
      setTimeout(() => {
        msgRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'row-reverse',
    }}>
      {/* Image */}
      <div style={{ flex: '0 0 40%', background: '#f1f5f9', position: 'relative', minHeight: 280 }}>
        {imageUrl ? (
          <img src={imageUrl} alt={service.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{ height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 10 }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span style={{ fontSize: 13 }}>No image</span>
          </div>
        )}
        {/* Status badge */}
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: isAvailable ? '#d1fae5' : '#fee2e2',
            color: isAvailable ? '#065f46' : '#991b1b',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {service.category && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {service.category}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{service.name}</h3>
          {service.price !== undefined && (
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0ea5e9', flexShrink: 0 }}>${service.price}</div>
          )}
        </div>

        {service.description && (
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{service.description}</p>
        )}

        {/* Details */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Details</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATIC_DETAILS.map((d, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 999, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                {d.icon} {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Local message per card */}
        {localMsg && (
          <div ref={msgRef}>
            <MessageBox type={localMsg.type} message={localMsg.text} onClose={() => setLocalMsg(null)} />
          </div>
        )}

        <button
          onClick={handleRequest}
          disabled={!isAvailable}
          style={{
            marginTop: 4, padding: '12px 28px', borderRadius: 12, border: 'none',
            background: isAvailable ? '#0ea5e9' : '#e2e8f0',
            color: isAvailable ? '#fff' : '#94a3b8',
            fontWeight: 700, fontSize: 14,
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            alignSelf: 'flex-start',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { if (isAvailable) e.currentTarget.style.background = '#0284c7'; }}
          onMouseLeave={(e) => { if (isAvailable) e.currentTarget.style.background = '#0ea5e9'; }}
        >
          Request Service
        </button>
      </div>
    </div>
  );
}

export default function ClientServicesPage() {
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '52px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Hotel Services</div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Our Premium Services</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 auto', maxWidth: 480 }}>Everything you need for a perfect stay, all in one place.</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0 }}>Loading services...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', color: '#991b1b', fontSize: 14 }}>
            Could not load services: {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <p style={{ margin: 0 }}>No services available at the moment.</p>
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

      <style>{`
        @media (max-width: 640px) {
          div[style*="flex-direction: row"] { flex-direction: column !important; }
          div[style*="flex-direction: row-reverse"] { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
