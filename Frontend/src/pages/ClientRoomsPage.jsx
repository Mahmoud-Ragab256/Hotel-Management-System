import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi, getApiErrorMessage } from '../services/api.js';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'http://localhost:3000';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img}`;
};

const statusColors = {
  Available: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  Occupied: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  Maintenance: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
};

const defaultFilters = {
  search: '',
  category: 'all',
  status: 'all',
  minPrice: '',
  maxPrice: '',
  adults: '',
  children: '',
  sortBy: 'recommended',
};

const getCategory = (room) => {
  if (room?.categoryId && typeof room.categoryId === 'object') return room.categoryId;
  return null;
};

const getCategoryId = (room) => {
  const category = getCategory(room);
  return category?._id || room?.categoryId || '';
};

const getCategoryName = (room) => {
  const category = getCategory(room);
  return category?.name || room?.categoryName || 'N/A';
};

const getRoomPrice = (room) => {
  const price = getCategory(room)?.basePrice;
  return Number.isFinite(Number(price)) ? Number(price) : 0;
};

const getRoomCapacity = (room) => {
  const capacity = getCategory(room)?.capacity || {};
  return {
    adults: Number(capacity.adults || 0),
    children: Number(capacity.children || 0),
  };
};

const getAmenities = (room) => {
  const amenities = getCategory(room)?.amenities;
  return Array.isArray(amenities) ? amenities : [];
};

const hasActiveFilters = (filters) => Object.entries(filters).some(([key, value]) => {
  if (key === 'sortBy') return value !== defaultFilters.sortBy;
  return value !== defaultFilters[key];
});

function StatusPill({ status }) {
  const colors = statusColors[status] || { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: colors.bg, color: colors.text }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function RoomCard({ room }) {
  const navigate = useNavigate();
  const imageUrl = resolveImageUrl(room.images?.[0]);
  const categoryName = getCategoryName(room);
  const basePrice = getRoomPrice(room);
  const capacity = getRoomCapacity(room);
  const amenities = getAmenities(room).slice(0, 3);
  const roomId = room._id || room.id;

  const handleClick = () => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div
      style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.18s ease, box-shadow 0.18s ease', border: '1px solid #eef2f7' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ height: 205, background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={`Room ${room.roomNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 8 }}>
            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>
            <span style={{ fontSize: 12 }}>No image</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <StatusPill status={room.status} />
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Room #{room.roomNumber}</div>
            <div style={{ marginTop: 4, fontSize: 14, color: '#475569', fontWeight: 700 }}>{categoryName}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0ea5e9' }}>${basePrice}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>/ Night</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Floor</div>
            <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 800 }}>{room.floor ?? '—'}</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Capacity</div>
            <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 800 }}>{capacity.adults}A {capacity.children ? `· ${capacity.children}C` : ''}</div>
          </div>
        </div>

        {amenities.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {amenities.map((amenity) => (
              <span key={amenity} style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 999, padding: '5px 9px', fontWeight: 800 }}>
                {amenity}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleClick}
          style={{ marginTop: 'auto', padding: '12px 0', borderRadius: 12, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s ease' }}
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
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomsData, catsData] = await Promise.all([
          clientApi.getRooms(),
          clientApi.getRoomCategories(),
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

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return value !== defaultFilters.sortBy;
      return value !== defaultFilters[key];
    }).length;
  }, [filters]);

  const filtered = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
    const adults = filters.adults === '' ? 0 : Number(filters.adults);
    const children = filters.children === '' ? 0 : Number(filters.children);

    const result = rooms.filter((room) => {
      const category = getCategory(room);
      const categoryName = getCategoryName(room);
      const categoryId = getCategoryId(room);
      const price = getRoomPrice(room);
      const capacity = getRoomCapacity(room);
      const amenities = getAmenities(room);

      if (filters.category !== 'all' && categoryId !== filters.category) return false;
      if (filters.status !== 'all' && room.status !== filters.status) return false;
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      if (adults > 0 && capacity.adults < adults) return false;
      if (children > 0 && capacity.children < children) return false;

      if (searchText) {
        const searchableText = [
          room.roomNumber,
          room.floor,
          room.status,
          categoryName,
          category?.description,
          ...amenities,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchText)) return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      const priceA = getRoomPrice(a);
      const priceB = getRoomPrice(b);
      const capacityA = getRoomCapacity(a).adults + getRoomCapacity(a).children;
      const capacityB = getRoomCapacity(b).adults + getRoomCapacity(b).children;

      switch (filters.sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'capacity-high':
          return capacityB - capacityA;
        case 'room-number':
          return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true });
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          if (a.status === 'Available' && b.status !== 'Available') return -1;
          if (a.status !== 'Available' && b.status === 'Available') return 1;
          return priceA - priceB;
      }
    });
  }, [rooms, filters]);

  const available = filtered.filter((r) => r.status === 'Available').length;
  const selectedCategoryName = categories.find((cat) => cat._id === filters.category)?.name;
  const filtersAreActive = hasActiveFilters(filters);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 980px) {
          .rooms-filter-grid-top,
          .rooms-filter-grid-bottom {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .rooms-filter-grid-top,
          .rooms-filter-grid-bottom {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '58px 24px 84px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Our Rooms</div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.04em' }}>Find Your Perfect Room</h1>
        <p style={{ fontSize: 16, color: '#cbd5e1', margin: '0 auto', maxWidth: 620, lineHeight: 1.7 }}>
          Search by room number, category, amenities, price, capacity and availability.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '-54px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, boxShadow: '0 22px 60px rgba(15, 23, 42, 0.13)', padding: 18 }}>
          <div className="rooms-filter-grid-top" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.45fr) minmax(180px, 0.95fr) minmax(150px, 0.75fr)', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Search</label>
              <input
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Room number, category, amenity..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} style={inputStyle}>
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name} — ${cat.basePrice}/night</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Availability</label>
              <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} style={inputStyle}>
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="rooms-filter-grid-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr)) auto', gap: 14, alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Min Price</label>
              <input value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} min="0" type="number" placeholder="$0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max Price</label>
              <input value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} min="0" type="number" placeholder="$500" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Adults</label>
              <input value={filters.adults} onChange={(e) => updateFilter('adults', e.target.value)} min="0" type="number" placeholder="Any" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Children</label>
              <input value={filters.children} onChange={(e) => updateFilter('children', e.target.value)} min="0" type="number" placeholder="Any" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sort By</label>
              <select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)} style={inputStyle}>
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="capacity-high">Highest Capacity</option>
                <option value="room-number">Room Number</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              disabled={!filtersAreActive}
              style={{ height: 48, borderRadius: 14, border: '1px solid #dbe4ef', background: filtersAreActive ? '#0f172a' : '#f1f5f9', color: filtersAreActive ? '#fff' : '#94a3b8', fontWeight: 900, padding: '0 18px', cursor: filtersAreActive ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', marginTop: 26, padding: '14px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> rooms found
            {selectedCategoryName && <> in <strong style={{ color: '#0ea5e9' }}>{selectedCategoryName}</strong></>}
          </span>
          <span style={{ fontSize: 14, color: '#10b981', fontWeight: 800 }}>{available} available</span>
          {activeFilterCount > 0 && (
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 700, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 999, padding: '6px 10px' }}>
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: 15 }}>Loading rooms...</p>
            
          </div>
        )}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#991b1b', fontSize: 14 }}><strong>Could not load rooms:</strong> {error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 24px', color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24 }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🔎</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: 22 }}>No rooms match these filters</h3>
            <p style={{ margin: '0 0 18px' }}>Try changing category, price, capacity or search text.</p>
            <button onClick={() => setFilters(defaultFilters)} style={{ border: 'none', borderRadius: 12, background: '#0ea5e9', color: '#fff', padding: '11px 18px', fontWeight: 900, cursor: 'pointer' }}>Clear filters</button>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
            {filtered.map((room) => (
              <RoomCard key={room._id || room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: 7,
  fontSize: 12,
  color: '#475569',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle = {
  width: '100%',
  height: 48,
  border: '1px solid #dbe4ef',
  borderRadius: 14,
  padding: '0 14px',
  outline: 'none',
  color: '#0f172a',
  fontWeight: 800,
  background: '#ffffff',
  boxSizing: 'border-box',
};
