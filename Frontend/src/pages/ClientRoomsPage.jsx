import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, dashboardApi, getApiErrorMessage } from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

const BASE_URL = API_BASE_URL;

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/${img}`;
};

// Luxury styled dark-mode status colors
const statusColors = {
  Available:   { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', dot: '#10b981' },
  Occupied:    { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', dot: '#3b82f6' },
  Maintenance: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', dot: '#f59e0b' },
};

function StatusPill({ status }) {
  const colors = statusColors[status] || { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', dot: '#9ca3af' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: colors.bg, color: colors.text, border: `1px solid rgba(${colors.dot === '#10b981' ? '16,185,129' : colors.dot === '#3b82f6' ? '59,130,246' : '245,158,11'}, 0.2)` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function RoomCard({ room }) {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
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
      onClick={handleClick}
      style={{
        background: colors.bgCard,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${colors.borderCard}`,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: colors.shadow,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = colors.borderHover;
        e.currentTarget.style.boxShadow = colors.shadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = colors.borderCard;
        e.currentTarget.style.boxShadow = colors.shadow;
      }}
    >
      <div style={{ height: 220, background: colors.inputBg, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={`Room ${room.roomNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, gap: 8 }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
            </svg>
            <span style={{ fontSize: 11, fontFamily: '"Inter", sans-serif' }}>No preview image</span>
          </div>
        )}
        
        {/* Luxury Top Right Floating Price Tag */}
        {basePrice !== undefined && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#c85a49',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '"Inter", sans-serif'
          }}>
            ${basePrice}/night
          </div>
        )}
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
            Room #{room.roomNumber}
          </div>
          <div style={{ fontSize: '13px', color: colors.accent, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Inter", sans-serif' }}>
            {categoryName}
          </div>
          
          <div style={{ height: '1px', background: colors.borderCard, margin: '8px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: colors.textSecondary, fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Floor</span>
              <span style={{ color: colors.textPrimary, fontWeight: '500' }}>{room.floor ?? '—'}</span>
            </div>
            {room.categoryId?.capacity && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Capacity</span>
                <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                  {room.categoryId.capacity.adults ?? 0} adults
                  {room.categoryId.capacity.children > 0 ? ` · ${room.categoryId.capacity.children} children` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <div>
            <StatusPill status={room.status} />
          </div>
          <button
            onClick={handleClick}
            style={{
              padding: '12px 0',
              borderRadius: '24px',
              border: 'none',
              background: '#c85a49',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#d16b5a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#c85a49')}
          >
            View Details / Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientRoomsPage() {
  const { colors, isDark } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New filtering and UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('default');

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

  // Determine dynamic maximum price based on actual categories
  const absoluteMaxPrice = useMemo(() => {
    if (categories.length === 0) return 1000;
    const prices = categories.map(c => c.basePrice || 0);
    const maxVal = Math.max(...prices);
    return maxVal > 1000 ? maxVal : 1000;
  }, [categories]);

  // Adjust maxPrice filter limit when categories load
  useEffect(() => {
    if (absoluteMaxPrice) {
      setMaxPrice(absoluteMaxPrice);
    }
  }, [absoluteMaxPrice]);

  // Extract all unique amenities dynamically from room categories
  const allAvailableAmenities = useMemo(() => {
    const amenitiesSet = new Set();
    categories.forEach(cat => {
      if (Array.isArray(cat.amenities)) {
        cat.amenities.forEach(a => {
          if (a && a.trim()) {
            amenitiesSet.add(a.trim());
          }
        });
      }
    });
    if (amenitiesSet.size === 0) {
      return ["WiFi", "TV", "Sea View", "AC", "Minibar", "Bathtub", "Balcony"];
    }
    return Array.from(amenitiesSet);
  }, [categories]);

  // Multi-tier customized filtering logic
  const filtered = useMemo(() => {
    let result = [...rooms];

    // 1. Category Dropdown filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => (r.categoryId?._id || r.categoryId) === selectedCategory);
    }

    // 2. Slider Price filter
    result = result.filter((r) => {
      const price = r.categoryId?.basePrice || 250;
      return price <= maxPrice;
    });

    // 3. Capacity filter
    if (selectedCapacity !== 'all') {
      const requiredCapacity = parseInt(selectedCapacity, 10);
      result = result.filter((r) => {
        const adults = r.categoryId?.capacity?.adults || 0;
        const children = r.categoryId?.capacity?.children || 0;
        const total = adults + children;
        if (requiredCapacity === 4) {
          return total >= 4;
        }
        return total === requiredCapacity;
      });
    }

    // 4. Amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter((r) => {
        const roomAmenities = r.categoryId?.amenities || [];
        return selectedAmenities.every(amenity =>
          roomAmenities.some(ra => ra.toLowerCase() === amenity.toLowerCase())
        );
      });
    }

    // 5. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.categoryId?.basePrice || 0) - (b.categoryId?.basePrice || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.categoryId?.basePrice || 0) - (a.categoryId?.basePrice || 0));
    } else if (sortBy === 'capacity-desc') {
      result.sort((a, b) => {
        const aCap = (a.categoryId?.capacity?.adults || 0) + (a.categoryId?.capacity?.children || 0);
        const bCap = (b.categoryId?.capacity?.adults || 0) + (b.categoryId?.capacity?.children || 0);
        return bCap - aCap;
      });
    } else if (sortBy === 'roomNumber-asc') {
      result.sort((a, b) => parseInt(a.roomNumber || 0) - parseInt(b.roomNumber || 0));
    }

    return result;
  }, [rooms, selectedCategory, maxPrice, selectedCapacity, selectedAmenities, sortBy]);

  const available = filtered.filter((r) => r.status === 'Available').length;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, fontFamily: '"Inter", sans-serif', paddingBottom: '120px' }}>
      
      {/* Header Banner - Room shape/photo Background */}
      <div style={{
        position: 'relative',
        backgroundImage: isDark
          ? `linear-gradient(to bottom, rgba(44, 22, 19, 0.5) 0%, rgba(17, 17, 17, 0.95) 100%), url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80')`
          : `linear-gradient(to bottom, rgba(253, 248, 247, 0.3) 0%, rgba(247, 245, 242, 0.95) 100%), url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: `1px solid ${colors.borderCard}`,
        boxShadow: 'none',
        padding: '120px 24px 90px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: '11px', color: '#c85a49', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.6)' : 'none' }}>
          Our Sanctuary
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '700', color: colors.textPrimary, margin: '0 0 16px', letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif', textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.8)' : 'none' }}>
          Find Your Perfect Room
        </h1>
        <p style={{ fontSize: '15px', color: colors.textSecondary, margin: '0 auto 24px', maxWidth: '480px', fontWeight: '300', lineHeight: '1.6', textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.6)' : 'none' }}>
          Browse all available rooms and customize your luxury escape.
        </p>
      </div>

      {/* Stats and Filter feedback bar with Filter Trigger beside */}
      <div style={{ background: 'transparent', borderBottom: `1px solid ${colors.borderCard}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: colors.textSecondary }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>
              Showing <strong style={{ color: colors.textPrimary }}>{filtered.length}</strong> rooms
              {selectedCategory !== 'all' && <> in <strong style={{ color: '#c85a49' }}>{categories.find(c => c._id === selectedCategory)?.name}</strong></>}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              {available} available right now
            </span>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{
              background: isFilterOpen ? '#c85a49' : (isDark ? '#1c1c1c' : '#ffffff'),
              color: isFilterOpen ? '#ffffff' : colors.textPrimary,
              border: isFilterOpen ? '1px solid #c85a49' : `1px solid ${colors.borderCard}`,
              borderRadius: '24px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: '"Inter", sans-serif',
              boxShadow: isFilterOpen ? '0 4px 16px rgba(200, 90, 73, 0.4)' : colors.shadow,
              transform: isFilterOpen ? 'scale(1.05)' : 'scale(1)',
              outline: 'none'
            }}
          >
            <svg 
              width="16" 
              height="16" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.2}
              style={{
                transform: isFilterOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {isFilterOpen ? 'Hide Filters' : 'Filter Options'}
          </button>
        </div>
      </div>

      {/* Main Container - Split sidebar on left, card grid on right */}
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '40px 24px',
        display: 'flex',
        gap: isFilterOpen ? '40px' : '0px',
        position: 'relative',
        alignItems: 'flex-start',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Left Side Cards Panel (Shrinks when Filter Sidebar expands) */}
        <div style={{ flex: 1, minWidth: 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>
              <div style={{ width: '36px', height: '36px', border: `3px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Loading luxury rooms...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px 20px', color: '#fca5a5', fontSize: '14px' }}>
              <strong>Could not load rooms:</strong> {error}
            </div>
          )}
          
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary, border: `1px dashed ${colors.borderCard}`, borderRadius: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>No rooms match your specific criteria. Try adjusting your filter parameters.</p>
            </div>
          )}
          
          {!loading && !error && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {filtered.map((room) => (
                <RoomCard key={room._id || room.id} room={room} />
              ))}
            </div>
          )}
        </div>

        {/* Expandable Right Filter Panel */}
        <div style={{
          width: isFilterOpen ? '320px' : '0px',
          opacity: isFilterOpen ? 1 : 0,
          transform: isFilterOpen ? 'scale(1) translateX(0)' : 'scale(0.9) translateX(40px)',
          transformOrigin: 'top right',
          pointerEvents: isFilterOpen ? 'auto' : 'none',
          flexShrink: 0,
          background: colors.bgCard,
          border: isFilterOpen ? `1px solid ${colors.borderCard}` : '0px solid transparent',
          borderRadius: '20px',
          padding: isFilterOpen ? '28px' : '0px',
          height: isFilterOpen ? 'auto' : '0px',
          overflow: isFilterOpen ? 'visible' : 'hidden',
          position: 'sticky',
          top: '110px',
          display: 'flex',
          flexDirection: 'column',
          gap: isFilterOpen ? '24px' : '0px',
          boxShadow: isFilterOpen ? colors.shadow : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isFilterOpen ? `1px solid ${colors.borderCard}` : 'none', paddingBottom: isFilterOpen ? '16px' : '0px', opacity: isFilterOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
              Refine Search
            </h3>
            <button
              onClick={() => {
                setMaxPrice(absoluteMaxPrice);
                setSelectedCapacity('all');
                setSelectedAmenities([]);
                setSortBy('default');
                setSelectedCategory('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#c85a49',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontFamily: '"Inter", sans-serif',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e27362'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#c85a49'}
            >
              Reset All
            </button>
          </div>

          {/* Price Limit Slider */}
          <div style={{ display: isFilterOpen ? 'flex' : 'none', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Max Price</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#c85a49' }}>${maxPrice}/night</span>
            </div>
            <input
              type="range"
              min="0"
              max={absoluteMaxPrice}
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#c85a49',
                background: colors.borderCard,
                height: '6px',
                borderRadius: '3px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.textSecondary }}>
              <span>$0</span>
              <span>${absoluteMaxPrice}</span>
            </div>
          </div>

          {/* Category Dropdown inside sidebar */}
          <div style={{ display: isFilterOpen ? 'flex' : 'none', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Category</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderCard}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%239ca3af' : '%235a5a5a'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity Dropdown */}
          <div style={{ display: isFilterOpen ? 'flex' : 'none', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Room Capacity</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderCard}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%239ca3af' : '%235a5a5a'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="all">Any Capacity</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
          </div>

          {/* Amenities Boxes */}
          <div style={{ display: isFilterOpen ? 'flex' : 'none', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Amenities</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allAvailableAmenities.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                      } else {
                        setSelectedAmenities([...selectedAmenities, amenity]);
                      }
                    }}
                    style={{
                      background: isChecked ? colors.accent : colors.inputBg,
                      border: isChecked ? `1px solid ${colors.accent}` : `1px solid ${colors.borderCard}`,
                      color: isChecked ? '#ffffff' : colors.textSecondary,
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '12px',
                      fontWeight: isChecked ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isChecked ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isChecked 
                        ? (isDark ? '0 0 0 2px #161616, 0 0 0 4px #c85a49, 0 6px 16px rgba(200, 90, 73, 0.35)' : '0 0 0 2px #ffffff, 0 0 0 4px #c85a49, 0 6px 16px rgba(200, 90, 73, 0.2)')
                        : 'none',
                      fontFamily: '"Inter", sans-serif',
                      userSelect: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.border = `1px solid ${colors.accent}`;
                        e.currentTarget.style.background = colors.bgCardHover;
                        e.currentTarget.style.color = colors.textPrimary;
                        e.currentTarget.style.transform = 'scale(1.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.border = `1px solid ${colors.borderCard}`;
                        e.currentTarget.style.background = colors.inputBg;
                        e.currentTarget.style.color = colors.textSecondary;
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: isFilterOpen ? 'flex' : 'none', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${colors.borderCard}`, paddingTop: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Sort Results By</label>
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderCard}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%239ca3af' : '%235a5a5a'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="capacity-desc">Capacity: High to Low</option>
                <option value="roomNumber-asc">Room Number</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
