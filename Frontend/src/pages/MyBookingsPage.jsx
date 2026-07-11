import React, { useState, useEffect } from "react";
import { Table, Badge, Spinner, Alert, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${base}${path}`;
};

const MyBookingsPage = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const loadPageData = async () => {
    try {
      setError("");

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";
      setUserEmail(email);

      if (!email) {
        setError("Could not identify the logged-in user.");
        setLoading(false);
        return;
      }


      const [allBookings, allRooms, categories] = await Promise.all([
        dashboardApi.getBookings(),
        dashboardApi.getRooms(),
        dashboardApi.getRoomCategories()
      ]);

      const roomMap = new Map();
      (allRooms || []).forEach(room => {
        roomMap.set(room._id || room.id, room);
      });

      const categoryMap = new Map();
      (categories || []).forEach(cat => {
        categoryMap.set(cat._id || cat.id, cat);
      });

      const userBookings = (allBookings || [])
        .filter((b) => b?.guestId?.email?.toLowerCase() === email.toLowerCase())
        .map((b) => {
          const roomIdStr = b.roomId?._id || b.roomId;
          const fullRoom = roomMap.get(roomIdStr);
          let roomImages = [];
          let categoryName = "Luxury Suite";

          if (fullRoom) {
            const roomCategoryId = fullRoom.categoryId?._id || fullRoom.categoryId;
            const catInfo = categoryMap.get(roomCategoryId);
            
            roomImages = (fullRoom.images && fullRoom.images.length > 0)
              ? fullRoom.images
              : (catInfo?.images || []);
            
            categoryName = catInfo?.name || "Luxury Suite";
          }

          return {
            ...b,
            roomImages,
            roomCategoryName: categoryName
          };
        });

      setBookings(userBookings);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);


  const handleConfirm = async (bookingId) => {
    if (!window.confirm("Are you sure you want to confirm this booking?")) return;
    setActionLoading(true);
    try {

      await dashboardApi.updateBooking(bookingId, { status: "Confirmed" });
      await loadPageData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };


  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Please enter the reason for cancellation:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Cancellation reason is required.");
      return;
    }

    setActionLoading(true);
    try {

      await dashboardApi.cancelBooking(bookingId, reason);
      await loadPageData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const statusColors = {
    Confirmed: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    CheckedIn: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
    CheckedOut: { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.2)' },
    Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' },
    Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  };

  const getStatusPill = (status) => {
    const currentStatus = status?.trim() || "Pending";
    const key = currentStatus.replace(" ", "");
    const colorsObj = statusColors[key] || { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '600',
        background: colorsObj.bg,
        color: colorsObj.text,
        border: `1px solid ${colorsObj.border}`,
        fontFamily: '"Inter", sans-serif'
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colorsObj.text }} />
        {currentStatus}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '200px' }}>
        <div style={{ width: '32px', height: '32px', border: `2px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0" style={{ color: colors.textPrimary }}>
      {!hideHeader && (
        <div className="mb-4">
          <h2 className="fw-bold m-0" style={{ color: colors.textPrimary }}>My Bookings</h2>
          <p className="m-0" style={{ color: colors.textSecondary }}>Manage and track your entire hotel reservation history</p>
        </div>
      )}

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {!loading && bookings.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow
          }}
        >
          <p className="m-0" style={{ color: colors.textSecondary }}>You haven't made any bookings yet.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking) => {
            const id = booking._id || booking.id || "";
            const roomNum = booking.roomId?.roomNumber || booking.roomNumber || "N/A";
            const isPending = booking.status?.trim() === "Pending";
            const imgUrl = resolveImageUrl(booking.roomImages?.[0]) || "https://placehold.co/600x400?text=Room";

            return (
              <div
                key={id}
                style={{
                  background: colors.bgCard,
                  borderRadius: '20px',
                  border: `1px solid ${colors.borderCard}`,
                  boxShadow: colors.shadow,
                  display: 'flex',
                  overflow: 'hidden',
                  flexWrap: 'wrap',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderCard; }}
              >
                {/* Left Side: Room Photo (Start of the Row) */}
                <div
                  style={{
                    width: '200px',
                    minHeight: '150px',
                    background: `url("${imgUrl}") center/cover no-repeat`,
                    position: 'relative'
                  }}
                  className="booking-card-image-left"
                />

                {/* Right Side: Booking Details and Actions */}
                <div
                  style={{
                    flex: 1,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    minWidth: '280px'
                  }}
                >
                  {/* Top Line: Category Name and Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.accent, fontWeight: '700', marginBottom: '2px' }}>
                        {booking.roomCategoryName}
                      </div>
                      <h4 style={{ fontSize: '20px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>
                        Room #{roomNum}
                      </h4>
                      <div style={{ fontSize: '11.5px', color: colors.textSecondary, fontFamily: 'monospace', marginTop: '3px' }}>
                        ID: #{id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      {getStatusPill(booking.status)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: colors.borderCard, width: '100%' }} />

                  {/* Booking Metadata: Dates & Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Check-in</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: colors.textPrimary }}>
                          {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <span style={{ fontSize: '16px', color: colors.textSecondary }}>&rarr;</span>
                      <div>
                        <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Check-out</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: colors.textPrimary }}>
                          {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Paid</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: colors.accent }}>
                        ${Number(booking.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: colors.borderCard, width: '100%' }} />

                  {/* Bottom Line: Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isPending ? (
                      <div className="d-flex gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleConfirm(id)}
                          style={{
                            background: colors.accent,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                          Confirm Reservation
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCancel(id)}
                          style={{
                            background: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '12px',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (booking.status === "Confirmed" || booking.status === "CheckedIn" || booking.status === "Checked In") ? (
                      <button
                        onClick={() => navigate('/help-center')}
                        style={{
                          background: 'transparent',
                          color: '#c85a49',
                          border: '1px solid rgba(200, 90, 73, 0.4)',
                          borderRadius: '12px',
                          padding: '8px 18px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(200, 90, 73, 0.05)'; e.currentTarget.style.borderColor = '#c85a49'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200, 90, 73, 0.4)'; }}
                      >
                        Complain / Contact Support
                      </button>
                    ) : (
                      <span style={{ color: colors.textSecondary, fontSize: '13px' }}>—</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
