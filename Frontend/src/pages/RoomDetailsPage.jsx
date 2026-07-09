import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser, isAuthenticated } from '../services/auth.js';
import { daysBetweenDateInputs, todayDateInputValue } from '../utils/date.js';
import { useTheme } from '../context/ThemeContext.jsx';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://hotel-management-system-sigma-ruby.vercel.app';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img}`;
};

const statusColors = {
  Available: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', dot: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
  Occupied: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', dot: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
  Maintenance: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', dot: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' },
};

function StatusPill({ status }) {
  const colors = statusColors[status] || { bg: '#2e2e2e', text: '#9ca3af', dot: '#9ca3af', border: '1px solid #3e3e3e' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: colors.bg, color: colors.text, border: colors.border }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

const LUXURY_FALLBACKS = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
];

function BookingForm({ room, onSuccess }) {
  const { colors, isDark } = useTheme();
  const basePrice = room.categoryId?.basePrice || 0;
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ checkInDate: '', checkOutDate: '', specialRequests: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const nights = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) return 0;
    const diff = new Date(form.checkOutDate) - new Date(form.checkInDate);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [form.checkInDate, form.checkOutDate]);

  const totalPrice = nights * basePrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (nights <= 0) { setError('Check-out must be after check-in.'); return; }
    const user = getCurrentUser();
    const guestId = user?._id || user?.id;
    if (!guestId) { setError('Could not find your account. Please login again.'); return; }
    setSaving(true);
    try {
      const booking = await dashboardApi.createClientBooking({
        guestId,
        roomId: room._id || room.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        totalPrice,
        specialRequests: form.specialRequests,
        paymentMethod: 'Cash',
      });

      const newBookingId =
        booking?._id || booking?.id || booking?.booking?._id;

      // الفاتورة بتتعمل تلقائياً من الـ Backend
      // لذلك لا تستدعي createInvoice هنا

      if (newBookingId) {
        try {
          console.log("Creating notification...");

          const res = await dashboardApi.createNotification({
            recipientId: guestId,
            recipientType: "Guest",
            type: "Booking",
            title: "Booking Created Successfully",
            message:
              "Your booking is pending confirmation. We will notify you once it is confirmed.",
          });

          console.log("Notification Success:", res);
        } catch (e) {
          console.log("Notification Error:");
          console.log(e.response?.data);
          console.log(e.response?.status);
          console.log(e);
        }
      }

      onSuccess();

    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Check-in</label>
          <input type="date" required min={today} value={form.checkInDate}
            onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.borderCard}`, background: colors.inputBg, fontSize: 14, color: colors.textPrimary, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Check-out</label>
          <input type="date" required min={form.checkInDate || today} value={form.checkOutDate}
            onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.borderCard}`, background: colors.inputBg, fontSize: 14, color: colors.textPrimary, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Special Requests <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: colors.textMuted }}>(optional)</span></label>
        <textarea rows={3} maxLength={500} value={form.specialRequests}
          onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
          placeholder="Any special requests or notes..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.borderCard}`, background: colors.inputBg, fontSize: 14, color: colors.textPrimary, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {nights > 0 && (
        <div style={{ background: 'rgba(200, 90, 73, 0.05)', border: `1px solid ${colors.borderCard}`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>${basePrice} × {nights} night{nights > 1 ? 's' : ''}</span>
            <span style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '600' }}>${totalPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.borderCard}`, paddingTop: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#c85a49' }}>${totalPrice}</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#ef4444' }}>{error}</div>
      )}

      <button type="submit" disabled={saving}
        style={{
          padding: '14px 0',
          borderRadius: 12,
          border: 'none',
          background: saving ? '#4b5563' : '#c85a49',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 16px rgba(200, 90, 73, 0.2)'
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#d16b5a'; }}
        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#c85a49'; }}
      >
        {saving ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
}

export default function RoomDetailsPage() {
  const { colors, isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/guest-login'); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomData, imagesData] = await Promise.all([
          dashboardApi.getRoom(id),
          dashboardApi.getRoomImages(id),
        ]);
        setRoom(roomData);
        setImages(Array.isArray(imagesData) ? imagesData : []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Construct displayImages array of exactly 6 unique/fallback images
  const roomImages = images.map(resolveImageUrl).filter(Boolean);
  if (roomImages.length === 0 && room) {
    const fallbackImg = resolveImageUrl(room.images?.[0]) || resolveImageUrl(room.categoryId?.images?.[0]);
    if (fallbackImg) roomImages.push(fallbackImg);
  }

  const displayImages = [...roomImages];
  let fallbackIdx = 0;
  while (displayImages.length < 6) {
    const fallbackCandidate = LUXURY_FALLBACKS[fallbackIdx % LUXURY_FALLBACKS.length];
    if (!displayImages.includes(fallbackCandidate)) {
      displayImages.push(fallbackCandidate);
    } else {
      displayImages.push(`${fallbackCandidate}&dup=${displayImages.length}`);
    }
    fallbackIdx++;
  }

  const sixImages = displayImages.slice(0, 6);

  // Automatically cycle through room photos every 4 seconds
  useEffect(() => {
    if (sixImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % sixImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sixImages.length, activeImg]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: colors.textSecondary }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0 }}>Loading room details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: '16px 24px', marginBottom: 16 }}>{error}</div>
        <button onClick={() => navigate('/rooms')} style={{ fontSize: 14, color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back to Rooms</button>
      </div>
    </div>
  );

  if (!room) return null;

  const categoryName = room.categoryId?.name || 'N/A';
  const basePrice = room.categoryId?.basePrice;
  const amenities = room.categoryId?.amenities || [];

  if (bookingDone) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", background: 'transparent', padding: 24 }}>
      <div style={{ background: colors.bgCard, borderRadius: 20, padding: '48px 40px', textAlign: 'center', maxWidth: 420, width: '100%', border: `1px solid ${colors.borderCard}`, boxShadow: colors.shadow }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, fontFamily: '"Playfair Display", serif', marginBottom: 10 }}>Booking Confirmed!</div>
        <div style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 28 }}>Room #{room.roomNumber} has been booked successfully.</div>
        <button onClick={() => navigate('/my-bookings')} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: colors.accent, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#d16b5a'} onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}>View My Bookings</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 80 }}>
      {/* Top bar navigation */}
      <div style={{ background: colors.bgCard, borderBottom: `1px solid ${colors.borderCard}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/rooms')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: colors.textSecondary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onMouseEnter={(e) => e.currentTarget.style.color = colors.textPrimary} onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Rooms
        </button>
        <span style={{ color: colors.borderCard, fontSize: 14 }}>/</span>
        <span style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 600 }}>Room #{room.roomNumber} Details</span>
      </div>

      {/* Top Main Image Area - 85% width, centered */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '48px auto 0', padding: '0 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: colors.bgCard,
          aspectRatio: '21/9',
          position: 'relative',
          border: 'none',
          boxShadow: colors.shadow
        }}>
          {sixImages.length > 0 ? (
            sixImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Room ${room.roomNumber} - View ${i + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: i === activeImg ? 1 : 0,
                  transform: i === activeImg ? 'scale(1.04)' : 'scale(1)',
                  transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: i === activeImg ? 1 : 0,
                }}
              />
            ))
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 10 }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>
              <span style={{ fontSize: 14 }}>No images available</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2 }}><StatusPill status={room.status} /></div>
        </div>

        {/* Center thumbnails, exactly 6 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
          {sixImages.map((img, i) => (
            <div key={i} onClick={() => setActiveImg(i)}
              style={{
                width: '100px',
                height: '68px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: 'none',
                boxShadow: i === activeImg ? '0 0 12px rgba(200, 90, 73, 0.4)' : 'none',
                opacity: i === activeImg ? 1 : 0.6,
                transform: i === activeImg ? 'scale(1.15)' : 'scale(1)',
                flexShrink: 0,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => { if (i !== activeImg) e.currentTarget.style.opacity = '0.95'; }}
              onMouseLeave={(e) => { if (i !== activeImg) e.currentTarget.style.opacity = '0.6'; }}
            >
              <img src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Rest of the page as it is, but styled with dark theme */}
      <div style={{ maxWidth: 1100, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }} className="room-details-grid">

          {/* LEFT — Room Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: colors.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${colors.borderCard}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Room Number</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: colors.textPrimary, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}>#{room.roomNumber}</div>
                </div>
                {basePrice !== undefined && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Per Night</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#c85a49', fontFamily: '"Playfair Display", serif' }}>${basePrice}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Category', value: categoryName },
                  { label: 'Floor', value: room.floor ?? '—' },
                  { label: 'Adults', value: room.categoryId?.capacity?.adults ?? '—' },
                  { label: 'Children', value: room.categoryId?.capacity?.children ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: colors.inputBg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${colors.borderCard}` }}>
                    <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>{value}</div>
                  </div>
                ))}
              </div>

              {amenities.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Amenities</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {amenities.map((a, i) => (
                      <span key={i} style={{ padding: '5px 14px', background: isDark ? 'rgba(200, 90, 73, 0.08)' : 'rgba(200, 90, 73, 0.04)', color: colors.textPrimary, border: `1px solid ${colors.borderCard}`, borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {room.categoryId?.description && (
                <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>{room.categoryId.description}</p>
              )}
            </div>
          </div>

          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: colors.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${colors.borderCard}`, boxShadow: colors.shadow }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary, fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>Book This Room</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Fill in your dates to confirm your stay.</div>
              {room.status === 'Available' ? (
                <BookingForm room={room} onSuccess={() => setBookingDone(true)} />
              ) : (
                <div style={{ background: colors.inputBg, borderRadius: 10, padding: '20px', textAlign: 'center', border: `1px solid ${colors.borderCard}` }}>
                  <StatusPill status={room.status} />
                  <p style={{ fontSize: 13, color: colors.textSecondary, margin: '12px 0 0' }}>This room is currently not available for booking.</p>
                </div>
              )}
            </div>
          </div>
        </div >
      </div >

      <style>{`
        @media (max-width: 768px) {
          .room-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div >
  );
}
