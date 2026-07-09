import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, getApiErrorMessage, API_BASE_URL } from '../services/api.js';
import { getCurrentUser, isAuthenticated } from '../services/auth.js';
import { daysBetweenDateInputs, todayDateInputValue, formatDisplayDate } from '../utils/date.js';
import { useTheme } from '../context/ThemeContext.jsx';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${API_BASE_URL}/${img}`;
};

export default function BookStayPage() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();

  // Date States
  const todayStr = todayDateInputValue();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Guest States
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Calendar render state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Room search results states
  const [allRooms, setAllRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  // Fetch initial room data on mount to allow immediate client-side queries
  useEffect(() => {
    (async () => {
      try {
        const [roomsData, catsData] = await Promise.all([
          dashboardApi.getRooms().catch(() => []),
          dashboardApi.getRoomCategories().catch(() => []),
        ]);
        setAllRooms(roomsData);
        setCategories(catsData);
      } catch (err) {
        console.error("Error loading rooms for booking:", err);
      }
    })();
  }, []);

  // Check for restored pending booking
  useEffect(() => {
    const pendingStr = sessionStorage.getItem('pending_booking');
    if (pendingStr && isAuthenticated()) {
      try {
        const pending = JSON.parse(pendingStr);
        sessionStorage.removeItem('pending_booking');

        // Auto submit the booking
        (async () => {
          setBookingLoading(true);
          try {
            const user = getCurrentUser();
            const guestId = user?._id || user?.id;
            await dashboardApi.createClientBooking({
              guestId,
              roomId: pending.roomId,
              checkInDate: pending.checkInDate,
              checkOutDate: pending.checkOutDate,
              totalPrice: pending.totalPrice,
              specialRequests: 'Auto-booked from search',
              paymentMethod: 'Cash',
            });
            setBookingSuccess(true);
          } catch (err) {
            setError(getApiErrorMessage(err));
          } finally {
            setBookingLoading(false);
          }
        })();
      } catch (e) {
        console.error("Error processing pending booking:", e);
      }
    }
  }, []);

  // Compute number of nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, daysBetweenDateInputs(checkIn, checkOut));
  }, [checkIn, checkOut]);

  // Calendar Day Click Handler
  const handleDayClick = (date) => {
    if (!date) return;

    // Clear time for today comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    // Convert date object to YYYY-MM-DD local string
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      if (dateStr < checkIn) {
        setCheckIn(dateStr);
      } else if (dateStr === checkIn) {
        // Toggle/Clear
        setCheckIn('');
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  // Previous / Next Month Navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate days in current calendar view month
  const calendarDays = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIdx = new Date(currentYear, currentMonth, 1).getDay();
    const list = [];

    // Fill previous padding
    for (let i = 0; i < firstDayIdx; i++) {
      list.push(null);
    }

    // Fill current days
    for (let d = 1; d <= totalDays; d++) {
      list.push(new Date(currentYear, currentMonth, d));
    }

    return list;
  }, [currentYear, currentMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filtered available rooms matching search parameters
  const availableRooms = useMemo(() => {
    if (!searched) return [];

    // Filter rooms by status and capacity
    return allRooms.filter(room => {
      // Must be available status
      if (room.status !== 'Available') return false;

      const cap = room.categoryId?.capacity || {};
      const maxAdults = cap.adults || 2;
      const maxChildren = cap.children || 0;

      // Guest checks
      if (adults > maxAdults) return false;
      if (children > maxChildren) return false;

      return true;
    });
  }, [searched, allRooms, adults, children]);

  const handleCheckAvailability = () => {
    setError(null);
    if (!checkIn || !checkOut) {
      setError('Please select both Check-in and Check-out dates first.');
      return;
    }
    if (nights <= 0) {
      setError('Check-out date must be after your Check-in date.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSearched(true);
      setLoading(false);
      // Scroll to results beautifully
      setTimeout(() => {
        const resElem = document.getElementById('search-results-section');
        if (resElem) {
          resElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 600);
  };

  const startBookingRoom = (room) => {
    setSelectedRoomToBook(room);
    setSpecialRequests('');
    setError(null);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoomToBook) return;

    if (!isAuthenticated()) {
      // Save search state to sessionStorage so we can restore it after login!
      sessionStorage.setItem('pending_booking', JSON.stringify({
        roomId: selectedRoomToBook._id || selectedRoomToBook.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children,
        totalPrice: (selectedRoomToBook.categoryId?.basePrice || 250) * nights
      }));
      navigate('/guest-login');
      return;
    }

    setBookingLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      const guestId = user?._id || user?.id;
      const price = (selectedRoomToBook.categoryId?.basePrice || 250) * nights;

      await dashboardApi.createClientBooking({
        guestId,
        roomId: selectedRoomToBook._id || selectedRoomToBook.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: price,
        specialRequests,
        paymentMethod: 'Cash',
      });
      setBookingSuccess(true);
      setSelectedRoomToBook(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, padding: '120px 24px 140px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: '0 0 12px' }}>Book Your Stay</h1>
          <p style={{ fontSize: '16px', fontWeight: '300', color: colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
            Select your preferred dates to check availability
          </p>
        </div>

        {/* Booking Card Grid */}
        <div style={{
          background: colors.bgCard,
          borderRadius: '24px',
          border: `1px solid ${colors.borderCard}`,
          boxShadow: colors.shadow,
          overflow: 'hidden',
          marginBottom: '50px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', divideX: `1px solid ${colors.borderCard}` }} className="booking-card-grid">

            {/* Left Column: Select Dates */}
            <div style={{ padding: '36px', borderRight: `1px solid ${colors.borderCard}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={colors.accent} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>Select Dates</h3>
              </div>

              {/* Interactive Calendar UI */}
              <div style={{ background: colors.bgCardAlt, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.borderCard}` }}>

                {/* Calendar Month Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '4px 8px' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Inter", sans-serif', color: colors.textPrimary }}>
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '4px 8px' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Days of Week Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <span key={day} style={{ fontSize: '10px', fontWeight: '700', color: colors.textMuted, letterSpacing: '0.05em' }}>{day}</span>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {calendarDays.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} />
                    }

                    const isToday = new Date().toDateString() === date.toDateString();
                    const dateOffset = date.getTimezoneOffset();
                    const localDateObj = new Date(date.getTime() - (dateOffset * 60 * 1000));
                    const dStr = localDateObj.toISOString().split('T')[0];

                    const isCheckIn = checkIn === dStr;
                    const isCheckOut = checkOut === dStr;
                    const isInRange = checkIn && checkOut && dStr > checkIn && dStr < checkOut;

                    // Past check
                    const tempToday = new Date();
                    tempToday.setHours(0, 0, 0, 0);
                    const isPast = date < tempToday;

                    let bg = 'transparent';
                    let color = colors.textPrimary;
                    let borderRadius = '50%';

                    if (isCheckIn || isCheckOut) {
                      bg = colors.accent;
                      color = '#ffffff';
                    } else if (isInRange) {
                      bg = isDark ? 'rgba(200, 90, 73, 0.15)' : 'rgba(200, 90, 73, 0.08)';
                      color = colors.accent;
                      borderRadius = '4px';
                    } else if (isPast) {
                      color = colors.textMuted;
                    } else if (isToday) {
                      bg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
                    }

                    return (
                      <button
                        key={`day-${idx}`}
                        disabled={isPast}
                        onClick={() => handleDayClick(date)}
                        style={{
                          aspectRatio: '1',
                          width: '100%',
                          background: bg,
                          color: color,
                          border: 'none',
                          borderRadius: borderRadius,
                          fontSize: '13px',
                          fontWeight: (isCheckIn || isCheckOut) ? '700' : '500',
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Right Column: Guests & Confirmation */}
            <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '30px' }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={colors.accent} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>Guests</h3>
                </div>

                {/* Adults Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: colors.bgCardAlt, borderRadius: '14px', border: `1px solid ${colors.borderCard}`, marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary }}>Adults</div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>Ages 13 or above</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${colors.borderCard}`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                    >-</button>
                    <span style={{ fontSize: '15px', fontWeight: '600', minWidth: '14px', textAlign: 'center' }}>{adults}</span>
                    <button
                      onClick={() => setAdults(prev => prev + 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${colors.borderCard}`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                    >+</button>
                  </div>
                </div>

                {/* Children Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: colors.bgCardAlt, borderRadius: '14px', border: `1px solid ${colors.borderCard}`, marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary }}>Children</div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>Ages 2-12</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${colors.borderCard}`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                    >-</button>
                    <span style={{ fontSize: '15px', fontWeight: '600', minWidth: '14px', textAlign: 'center' }}>{children}</span>
                    <button
                      onClick={() => setChildren(prev => prev + 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${colors.borderCard}`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                    >+</button>
                  </div>
                </div>

                {/* Selected Duration summary block */}
                <div style={{ background: isDark ? 'rgba(200, 90, 73, 0.05)' : 'rgba(200, 90, 73, 0.03)', border: `1px solid ${isDark ? 'rgba(200, 90, 73, 0.2)' : 'rgba(200, 90, 73, 0.15)'}`, borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: '500', textTransform: 'uppercase' }}>Selected Duration:</span>
                    <span style={{ background: colors.accent, color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                      {nights > 0 ? `${nights} Nights Selected` : 'Select dates'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: `1px solid ${colors.borderCard}`, paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ color: colors.textSecondary }}>Check-in</span>
                    <span style={{ fontWeight: '600', color: colors.textPrimary }}>{checkIn ? formatDisplayDate(checkIn) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: colors.textSecondary }}>Check-out</span>
                    <span style={{ fontWeight: '600', color: colors.textPrimary }}>{checkOut ? formatDisplayDate(checkOut) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Action Error / Check Availability */}
              <div>
                {error && (
                  <div style={{ background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(239, 68, 68, 0.15)', color: isDark ? '#fca5a5' : '#b91c1c', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', marginBottom: '14px' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckAvailability}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: colors.accent,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isDark ? '0 4px 16px rgba(200, 90, 73, 0.2)' : '0 4px 16px rgba(200, 90, 73, 0.08)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.accentHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.accent; }}
                >
                  {loading ? 'Searching...' : (
                    <>
                      Check Availability
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Brand Promises Beneath Card */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px 60px', borderTop: `1px solid ${colors.borderCard}`, paddingTop: '40px', paddingBottom: '40px' }}>
          {[
            { label: 'BEST PRICE GUARANTEED', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { label: 'SECURE BOOKING', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { label: 'INSTANT CONFIRMATION', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          ].map((p, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={colors.textSecondary} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={p.icon} />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textSecondary, letterSpacing: '0.08em' }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Search Results Area */}
        {searched && (
          <div id="search-results-section" style={{ borderTop: `1px solid ${colors.borderCard}`, paddingTop: '60px', marginTop: '20px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', fontFamily: '"Playfair Display", serif', marginBottom: '24px', textAlign: 'center', color: colors.textPrimary }}>
              Available Accommodations
            </h2>

            {availableRooms.length === 0 ? (
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.borderCard}`, borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke={colors.accent} strokeWidth={1.2} style={{ margin: '0 auto 16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, marginBottom: '8px' }}>No matching rooms available</h4>
                <p style={{ color: colors.textSecondary, fontSize: '14px', maxWidth: '460px', margin: '0 auto' }}>
                  There are no available rooms for the chosen dates and guest counts. Please try selecting different dates or updating your guests criteria.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                {availableRooms.map(room => {
                  const category = room.categoryId || {};
                  const basePrice = category.basePrice || 250;
                  const totalPrice = basePrice * nights;
                  const imageUrl = resolveImageUrl(room.images?.[0] || category.images?.[0]);

                  return (
                    <div key={room._id} style={{
                      background: colors.bgCard,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${colors.borderCard}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: 'none'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = colors.accent;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = colors.borderCard;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        {/* Image */}
                        <div style={{ height: '200px', background: colors.bgCardAlt, position: 'relative' }}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={`Room ${room.roomNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                              No preview image
                            </div>
                          )}
                        </div>

                        {/* Room Info */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>
                              Room #{room.roomNumber}
                            </h4>
                            {basePrice !== undefined && (
                              <span style={{ fontSize: '14px', color: colors.accent, fontWeight: '700', fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap' }}>
                                ${basePrice} / night
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.accent, fontWeight: '600' }}>
                            {category.name || 'Luxury Category'}
                          </span>

                          <div style={{ height: '1px', background: colors.borderCard, margin: '14px 0' }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
                            <span>Floor</span>
                            <span style={{ color: colors.textPrimary, fontWeight: '500' }}>{room.floor ?? '—'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: colors.textSecondary }}>
                            <span>Max Capacity</span>
                            <span style={{ color: colors.textPrimary, fontWeight: '500' }}>{category.capacity?.adults || 2} Adults · {category.capacity?.children || 0} Children</span>
                          </div>
                        </div>
                      </div>

                      {/* Total and booking actions */}
                      <div style={{ padding: '20px', background: colors.bgCardAlt, borderTop: `1px solid ${colors.borderCard}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: colors.textSecondary }}>Total ({nights} night{nights > 1 ? 's' : ''})</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary }}>${totalPrice}</span>
                        </div>
                        <button
                          onClick={() => startBookingRoom(room)}
                          style={{
                            width: '100%',
                            background: colors.accent,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 0',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                        >
                          Book Room Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Direct Booking Detail Modal */}
        {selectedRoomToBook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}>
            <div style={{
              background: colors.bgCard,
              borderRadius: '20px',
              border: `1px solid ${colors.borderCard}`,
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: colors.shadow
            }}>
              {/* Modal Header */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderCard}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>
                  Confirm Your Booking
                </h3>
                <button
                  onClick={() => setSelectedRoomToBook(null)}
                  style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '20px' }}
                >
                  &times;
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={confirmBooking} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: colors.bgCardAlt, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.borderCard}` }}>
                  <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>Reservation Summary</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: colors.textSecondary }}>Accomodation</span>
                    <span style={{ color: colors.textPrimary, fontWeight: '600' }}>Room #{selectedRoomToBook.roomNumber} ({selectedRoomToBook.categoryId?.name})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: colors.textSecondary }}>Dates</span>
                    <span style={{ color: colors.textPrimary, fontWeight: '600' }}>{formatDisplayDate(checkIn)} — {formatDisplayDate(checkOut)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: colors.textSecondary }}>Nights</span>
                    <span style={{ color: colors.textPrimary, fontWeight: '600' }}>{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: `1px solid ${colors.borderCard}`, paddingTop: '8px', marginTop: '8px' }}>
                    <span style={{ color: colors.accent, fontWeight: '600' }}>Total Price</span>
                    <span style={{ color: colors.textPrimary, fontWeight: '700', fontSize: '16px' }}>
                      ${(selectedRoomToBook.categoryId?.basePrice || 250) * nights}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="E.g., early check-in, dietary restrictions, airport pickup request..."
                    style={{
                      width: '100%',
                      background: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {!isAuthenticated() && (
                  <div style={{ background: 'rgba(200, 90, 73, 0.05)', border: `1px solid ${isDark ? "rgba(200, 90, 73, 0.2)" : "rgba(200, 90, 73, 0.15)"}`, borderRadius: '10px', padding: '12px', fontSize: '12px', color: colors.textPrimary }}>
                    <strong>Note:</strong> You will be redirected to the secure login screen to complete this reservation. Your dates and room choice are saved.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRoomToBook(null)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: `1px solid ${colors.borderCard}`,
                      color: colors.textPrimary,
                      borderRadius: '10px',
                      padding: '12px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    style={{
                      flex: 1,
                      background: colors.accent,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.accentHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.accent; }}
                  >
                    {bookingLoading ? 'Processing...' : (isAuthenticated() ? 'Confirm Booking' : 'Log in to Book')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal / Banner */}
        {bookingSuccess && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}>
            <div style={{
              background: colors.bgCard,
              borderRadius: '24px',
              border: `1px solid ${colors.borderCard}`,
              maxWidth: '420px',
              width: '100%',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: colors.shadow
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, marginBottom: '12px' }}>
                Booking Confirmed!
              </h3>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                Your luxury reservation has been completed successfully. We are excited to welcome you to Aethos.
              </p>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  navigate('/my-bookings');
                }}
                style={{
                  width: '100%',
                  background: colors.accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Responsive Styles for Booking Grid */}
      <style>{`
        @media (max-width: 768px) {
          .booking-card-grid {
            grid-template-columns: 1fr !important;
          }
          .booking-card-grid > div {
            padding: 24px !important;
            border-right: none !important;
            border-left: none !important;
          }
          .booking-card-grid > div:first-of-type {
            border-bottom: 1px solid ${colors.borderCard} !important;
          }
        }
      `}</style>
    </main>
  );
}
