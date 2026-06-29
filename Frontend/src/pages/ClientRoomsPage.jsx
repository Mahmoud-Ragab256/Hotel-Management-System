import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';

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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: colors.bg, color: colors.text }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function RoomCard({ room }) {
  const navigate = useNavigate();
  const imageUrl = resolveImageUrl(room.images?.[0]);
  const categoryName = room.categoryId?.name || room.categoryName || 'N/A';
  const basePrice = room.categoryId?.basePrice;
  const roomId = room._id || room.id;

  const handleClick = () => {
    if (!isAuthenticated()) {
      navigate('/guest-login');
    } else {
      navigate(`/rooms/${roomId}`);
    }
  };

  return (
    <div
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ height: 200, background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
        {imageUrl ? (
          <img src={imageUrl} alt={`Room ${room.roomNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 8 }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>
            <span style={{ fontSize: 12 }}>No image</span>
          </div>
        )}
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Room #{room.roomNumber}</div>
        <div style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{categoryName}</div>
        {basePrice !== undefined && (
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>
            ${basePrice} <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>/ Night</span>
          </div>
        )}
        <div style={{ fontSize: 13, color: '#64748b' }}><span style={{ fontWeight: 600, color: '#334155' }}>Floor</span> {room.floor ?? '—'}</div>
        {room.categoryId?.capacity && (
          <div style={{ fontSize: 13, color: '#64748b' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Capacity</span>{' '}
            {room.categoryId.capacity.adults ?? 0} adults
            {room.categoryId.capacity.children > 0 ? ` · ${room.categoryId.capacity.children} children` : ''}
          </div>
        )}
        <div><StatusPill status={room.status} /></div>
        <button
          onClick={handleClick}
          style={{ marginTop: 6, padding: '11px 0', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#0284c7')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#0ea5e9')}
        >
          View Details / Book
        </button>
      </div>
    </div>
  );
}

export default function ClientRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomsData, catsData] = await Promise.all([
          dashboardApi.getRooms(),
          dashboardApi.getRoomCategories(),
        ]);
        setRooms(roomsData);
        setCategories(catsData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return rooms;
    return rooms.filter((r) => (r.categoryId?._id || r.categoryId) === selectedCategory);
  }, [rooms, selectedCategory]);

  const available = filtered.filter((r) => r.status === 'Available').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '48px 24px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Our Rooms</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Find Your Perfect Room</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 auto 28px', maxWidth: 480 }}>Browse all available rooms and filter by category.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 16px' }}>
          <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ background: '#fff', border: 'none', borderRadius: 10, padding: '8px 36px 8px 14px', fontSize: 14, fontWeight: 600, color: '#0f172a', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px', minWidth: 180 }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name} — ${cat.basePrice}/night</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> rooms
            {selectedCategory !== 'all' && <> in <strong style={{ color: '#0ea5e9' }}>{categories.find(c => c._id === selectedCategory)?.name}</strong></>}
          </span>
          <span style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>{available} available</span>
          {selectedCategory !== 'all' && (
            <button onClick={() => setSelectedCategory('all')} style={{ marginLeft: 'auto', fontSize: 13, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>← All rooms</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: 15 }}>Loading rooms...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#991b1b', fontSize: 14 }}><strong>Could not load rooms:</strong> {error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: 15 }}>No rooms found in this category.</p>
          </div>
        )}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map((room) => (
              <RoomCard key={room._id || room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
