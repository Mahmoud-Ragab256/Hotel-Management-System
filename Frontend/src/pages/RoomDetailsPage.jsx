import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser, isAuthenticated } from '../services/auth.js';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://hotel-management-system-sigma-ruby.vercel.app';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img}`;
};

const statusColors = {
  Available:   { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  Occupied:    { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  Maintenance: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
};

function StatusPill({ status }) {
  const colors = statusColors[status] || { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: colors.bg, color: colors.text }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function BookingForm({ room, onSuccess }) {
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
      await dashboardApi.createBooking({
        guestId,
        roomId: room._id || room.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        totalPrice,
        specialRequests: form.specialRequests,
      });
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
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Check-in</label>
          <input type="date" required min={today} value={form.checkInDate}
            onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Check-out</label>
          <input type="date" required min={form.checkInDate || today} value={form.checkOutDate}
            onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Special Requests <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <textarea rows={3} maxLength={500} value={form.specialRequests}
          onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
          placeholder="Any special requests or notes..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#0f172a', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {nights > 0 && (
        <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: '#0369a1' }}>${basePrice} × {nights} night{nights > 1 ? 's' : ''}</span>
            <span style={{ fontSize: 14, color: '#0369a1' }}>${totalPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bae6fd', paddingTop: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0284c7' }}>${totalPrice}</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#991b1b' }}>{error}</div>
      )}

      <button type="submit" disabled={saving}
        style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: saving ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#0284c7'; }}
        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#0ea5e9'; }}
      >
        {saving ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
}

export default function RoomDetailsPage() {
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
        console.log("Room:", roomData);
  console.log("Images:", imagesData);

        setRoom(roomData);
        setImages(Array.isArray(imagesData) ? imagesData : []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0 }}>Loading room details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 24px', marginBottom: 16 }}>{error}</div>
        <button onClick={() => navigate('/rooms')} style={{ fontSize: 14, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back to Rooms</button>
      </div>
    </div>
  );

  if (!room) return null;

  const categoryName = room.categoryId?.name || 'N/A';
  const basePrice = room.categoryId?.basePrice;
  const amenities = room.categoryId?.amenities || [];
  const allImages = images.map(resolveImageUrl).filter(Boolean);
  const fallback = resolveImageUrl(room.images?.[0]);
  const displayImages = allImages.length > 0 ? allImages : (fallback ? [fallback] : []);

  if (bookingDone) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", background: '#f8fafc', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Booking Confirmed!</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>Room #{room.roomNumber} has been booked successfully.</div>
        <button onClick={() => navigate('/rooms')} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Back to Rooms</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: '#0f172a', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/rooms')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Rooms
        </button>
        <span style={{ color: '#334155', fontSize: 14 }}>/</span>
        <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>Room #{room.roomNumber}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }}>

          {/* LEFT — images + info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Main image */}
            <div style={{ borderRadius: 16, overflow: 'hidden', background: '#e2e8f0', aspectRatio: '16/9', position: 'relative' }}>
              {displayImages.length > 0 ? (
                <img src={displayImages[activeImg]} alt={`Room ${room.roomNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 10 }}>
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>
                  <span style={{ fontSize: 14 }}>No images available</span>
                </div>
              )}
              <div style={{ position: 'absolute', top: 16, left: 16 }}><StatusPill status={room.status} /></div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {displayImages.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: i === activeImg ? '2px solid #0ea5e9' : '2px solid transparent', flexShrink: 0, transition: 'border-color 0.15s' }}
                  >
                    <img src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Details card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Room Number</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>#{room.roomNumber}</div>
                </div>
                {basePrice !== undefined && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Per Night</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#0ea5e9' }}>${basePrice}</div>
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
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{value}</div>
                  </div>
                ))}
              </div>

              {amenities.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Amenities</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {amenities.map((a, i) => (
                      <span key={i} style={{ padding: '5px 14px', background: '#f0f9ff', color: '#0369a1', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {room.categoryId?.description && (
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{room.categoryId.description}</p>
              )}
            </div>
          </div>

          {/* RIGHT — booking form */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Book This Room</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Fill in your dates to confirm your stay.</div>
              {room.status === 'Available' ? (
                <BookingForm room={room} onSuccess={() => setBookingDone(true)} />
              ) : (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                  <StatusPill status={room.status} />
                  <p style={{ fontSize: 13, color: '#64748b', margin: '12px 0 0' }}>This room is currently not available for booking.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .room-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
