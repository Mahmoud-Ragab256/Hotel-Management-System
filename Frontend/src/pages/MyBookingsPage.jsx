import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import FeedbackCard from "../components/FeedbackCard.jsx";

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${base}${path}`;
};

const actionBtnStyle = (variant = 'primary', accent) => {
  if (variant === 'danger') {
    return {
      background: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    };
  }
  if (variant === 'outline') {
    return {
      background: 'transparent',
      color: accent,
      border: `1px solid ${accent}`,
      borderRadius: '12px',
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    };
  }
  if (variant === 'ghost') {
    return {
      background: 'transparent',
      color: accent,
      border: `1px solid ${accent}55`,
      borderRadius: '12px',
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    };
  }
  return {
    background: accent,
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };
};

const MyBookingsPage = ({ hideHeader = false }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [guestId, setGuestId] = useState("");
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [activeReviewBookingId, setActiveReviewBookingId] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewForms, setReviewForms] = useState({});

  const showFeedback = (type, message) => setFeedback({ type, message });

  const getReviewForm = (bookingId) => reviewForms[bookingId] || { rating: 5, comment: "" };

  const updateReviewForm = (bookingId, patch) => {
    setReviewForms((prev) => ({
      ...prev,
      [bookingId]: { ...getReviewForm(bookingId), ...patch }
    }));
  };

  const loadPageData = async () => {
    try {
      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";
      const currentGuestId = currentUser?._id || currentUser?.id || "";
      setGuestId(currentGuestId);

      if (!email) {
        showFeedback('danger', 'Could not identify the logged-in user.');
        setLoading(false);
        return;
      }

      const [allBookings, allRooms, categories, allReviews] = await Promise.all([
        dashboardApi.getBookings(),
        dashboardApi.getRooms(),
        dashboardApi.getRoomCategories(),
        dashboardApi.getAllReviews().catch(() => [])
      ]);

      const reviewedIds = new Set(
        (allReviews || []).map((r) => {
          const bid = r?.bookingId?._id || r?.bookingId?.id || r?.bookingId || "";
          return bid.toString();
        }).filter(Boolean)
      );
      setReviewedBookingIds(reviewedIds);

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
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleGoToInvoices = (bookingId) => {
    navigate(`/profile?tab=invoices&bookingId=${bookingId}`);
  };

  const handleCheckout = async (booking) => {
    const bookingId = booking._id || booking.id || "";
    const roomId = booking.roomId?._id || booking.roomId || "";

    setActionLoading(true);
    setPendingAction(null);
    try {
      await dashboardApi.updateBooking(bookingId, { status: "CheckedOut" });
      if (roomId) {
        await dashboardApi.updateRoom(roomId, { status: "Available" });
      }
      setActiveReviewBookingId(bookingId.toString());
      updateReviewForm(bookingId.toString(), { rating: 5, comment: "" });
      showFeedback('success', 'Checkout completed. Please share your experience below.');
      await loadPageData();
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (event, booking) => {
    event.preventDefault();
    if (!guestId) return;

    const bookingId = (booking._id || booking.id || "").toString();
    const roomId = booking.roomId?._id || booking.roomId || "";
    const form = getReviewForm(bookingId);

    if (!form.comment.trim()) {
      showFeedback('warning', 'Please write a comment for your review.');
      return;
    }

    setActionLoading(true);
    try {
      await dashboardApi.addReview({
        guestId,
        roomId,
        bookingId,
        rating: Number(form.rating),
        comment: form.comment.trim()
      });
      setActiveReviewBookingId("");
      setReviewForms((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      showFeedback('success', 'Thank you! Your review has been submitted.');
      await loadPageData();
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!cancelReason.trim()) {
      showFeedback('warning', 'Cancellation reason is required.');
      return;
    }

    setActionLoading(true);
    setPendingAction(null);
    try {
      await dashboardApi.cancelBooking(bookingId, cancelReason.trim());
      setCancelReason("");
      showFeedback('success', 'Booking cancelled successfully.');
      await loadPageData();
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
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

  const inlinePanelStyle = {
    marginTop: '4px',
    padding: '16px',
    borderRadius: '14px',
    background: colors.bgCardAlt || colors.bgCard,
    border: `1px solid ${colors.borderCard}`,
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

      {feedback && (
        <div className="mb-3">
          <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
        </div>
      )}

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
            const idStr = id.toString();
            const roomNum = booking.roomId?.roomNumber || booking.roomNumber || "N/A";
            const status = booking.status?.trim() || "Pending";
            const isPending = status === "Pending";
            const isConfirmed = status === "Confirmed" || status === "CheckedIn" || status === "Checked In";
            const isCheckedOut = status === "CheckedOut";
            const hasReview = reviewedBookingIds.has(idStr);
            const showReviewForm = isCheckedOut && !hasReview && (
              activeReviewBookingId === idStr || activeReviewBookingId === ""
            );
            const reviewForm = getReviewForm(idStr);
            const imgUrl = resolveImageUrl(booking.roomImages?.[0]) || "https://placehold.co/600x400?text=Room";
            const isCheckoutPending = pendingAction?.type === 'checkout' && pendingAction.bookingId === idStr;
            const isCancelPending = pendingAction?.type === 'cancel' && pendingAction.bookingId === idStr;

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
                <div
                  style={{
                    width: '200px',
                    minHeight: '150px',
                    background: `url("${imgUrl}") center/cover no-repeat`,
                    position: 'relative'
                  }}
                  className="booking-card-image-left"
                />

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.accent, fontWeight: '700', marginBottom: '2px' }}>
                        {booking.roomCategoryName}
                      </div>
                      <h4 style={{ fontSize: '20px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: 0 }}>
                        Room #{roomNum}
                      </h4>
                      <div style={{ fontSize: '11.5px', color: colors.textSecondary, fontFamily: 'monospace', marginTop: '3px' }}>
                        {booking.bookingNumber ? `Booking #${booking.bookingNumber}` : `ID: #${id.substring(0, 8).toUpperCase()}`}
                      </div>
                    </div>
                    <div>
                      {getStatusPill(booking.status)}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: colors.borderCard, width: '100%' }} />

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
                      <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: colors.accent }}>
                        ${Number(booking.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: colors.borderCard, width: '100%' }} />

                  {isCheckoutPending && (
                    <div style={inlinePanelStyle}>
                      <p style={{ fontSize: '13px', color: colors.textPrimary, margin: '0 0 12px', fontWeight: 600 }}>
                        Confirm checkout?
                      </p>
                      <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 14px' }}>
                        The room will become available for other guests.
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCheckout(booking)}
                          style={actionBtnStyle('primary', colors.accent)}
                        >
                          {actionLoading ? 'Processing...' : 'Yes, Checkout'}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => setPendingAction(null)}
                          style={actionBtnStyle('ghost', colors.textSecondary)}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}

                  {isCancelPending && (
                    <div style={inlinePanelStyle}>
                      <p style={{ fontSize: '13px', color: colors.textPrimary, margin: '0 0 10px', fontWeight: 600 }}>
                        Cancel this booking
                      </p>
                      <Form.Group className="mb-3">
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please enter the reason for cancellation..."
                          style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary, fontSize: '13px' }}
                        />
                      </Form.Group>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCancel(id)}
                          style={actionBtnStyle('danger')}
                        >
                          {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => { setPendingAction(null); setCancelReason(""); }}
                          style={actionBtnStyle('ghost', colors.textSecondary)}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}

                  {showReviewForm && !isCheckoutPending && !isCancelPending && (
                    <div style={inlinePanelStyle}>
                      <p style={{ fontSize: '14px', color: colors.textPrimary, margin: '0 0 4px', fontWeight: 700 }}>
                        How was your stay?
                      </p>
                      <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 14px' }}>
                        Room #{roomNum}
                        {booking.bookingNumber ? ` · Booking #${booking.bookingNumber}` : ""}
                      </p>
                      <Form onSubmit={(e) => handleSubmitReview(e, booking)}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>Rating</Form.Label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateReviewForm(idStr, { rating: star })}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '22px',
                                  cursor: 'pointer',
                                  color: star <= reviewForm.rating ? '#f59e0b' : colors.textMuted,
                                  padding: 0
                                }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>Your review</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            required
                            value={reviewForm.comment}
                            onChange={(e) => updateReviewForm(idStr, { comment: e.target.value })}
                            placeholder="Share your experience..."
                            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary, fontSize: '13px' }}
                          />
                        </Form.Group>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          style={actionBtnStyle('primary', colors.accent)}
                        >
                          {actionLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </Form>
                    </div>
                  )}

                  {!isCheckoutPending && !isCancelPending && !showReviewForm && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleGoToInvoices(id)}
                            style={actionBtnStyle('primary', colors.accent)}
                          >
                            Confirm Reservation
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => { setPendingAction({ type: 'cancel', bookingId: idStr }); setCancelReason(""); }}
                            style={actionBtnStyle('danger')}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <button
                          disabled={actionLoading}
                          onClick={() => setPendingAction({ type: 'checkout', bookingId: idStr })}
                          style={actionBtnStyle('primary', colors.accent)}
                        >
                          Checkout
                        </button>
                      )}

                      {isCheckedOut && hasReview && (
                        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Review submitted ✓</span>
                      )}

                      {!isPending && !isConfirmed && !isCheckedOut && (
                        <span style={{ color: colors.textSecondary, fontSize: '13px' }}>—</span>
                      )}
                    </div>
                  )}
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
