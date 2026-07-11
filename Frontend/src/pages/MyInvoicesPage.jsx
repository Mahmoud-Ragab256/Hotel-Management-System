import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import FeedbackCard from "../components/FeedbackCard.jsx";

const MyInvoicesPage = ({ hideHeader = false }) => {
  const { colors, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get("bookingId") || "";
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";

      if (!email) {
        showFeedback('danger', 'Could not identify the logged-in user.');
        setInvoices([]);
        return;
      }

      const [allBookings, allRooms, allInvoices] = await Promise.all([
        dashboardApi.getBookings(),
        dashboardApi.getRooms(),
        dashboardApi.getInvoices()
      ]);

      const userBookings = (allBookings || []).filter(
        (b) => b?.guestId?.email?.toLowerCase() === email.toLowerCase()
      );

      const userBookingIds = userBookings.map((b) => (b._id || b.id || "").toString());

      const roomMap = new Map();
      (allRooms || []).forEach(room => {
        roomMap.set(room._id || room.id, room);
      });

      const userInvoices = (allInvoices || []).filter((invoice) => {
        if (!invoice) return false;

        const invoiceBookingStr = invoice.bookingId?._id || invoice.bookingId;
        if (!invoiceBookingStr) return false;

        return userBookingIds.includes(invoiceBookingStr.toString());
      }).map(invoice => {
        const bookingIdStr = (invoice.bookingId?._id || invoice.bookingId || "").toString();
        const matchedBooking = userBookings.find(b => (b._id || b.id || "").toString() === bookingIdStr);

        let roomNumber = "N/A";
        if (matchedBooking) {
          const roomIdStr = matchedBooking.roomId?._id || matchedBooking.roomId;
          const roomObj = roomMap.get(roomIdStr);
          if (roomObj) {
            roomNumber = roomObj.roomNumber || "N/A";
          } else if (matchedBooking.roomNumber) {
            roomNumber = matchedBooking.roomNumber;
          }
        }

        return {
          ...invoice,
          roomNumber
        };
      });

      setInvoices(userInvoices);
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId, bookingId) => {
    try {
      setActionLoading(invoiceId);
      setPendingAction(null);
      await dashboardApi.updateInvoice(invoiceId, { status: "Paid" });

      if (bookingId) {
        await dashboardApi.updateBooking(bookingId, { status: "Confirmed" });
      }

      showFeedback('success', 'Payment successful. Your booking is now confirmed.');
      await fetchInvoices();
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvoice = async (invoiceId, bookingId) => {
    try {
      setActionLoading(invoiceId);
      setPendingAction(null);

      await dashboardApi.updateInvoice(invoiceId, { status: "Cancelled" });

      if (bookingId) {
        await dashboardApi.cancelBooking(bookingId, "Invoice cancelled by user");
      }

      showFeedback('success', 'Invoice and booking cancelled successfully.');
      await fetchInvoices();
    } catch (err) {
      showFeedback('danger', getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors = {
    Paid: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
    Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' },
  };

  const getStatusPill = (status) => {
    const currentStatus = status?.trim() || "Pending";
    const colorsObj = statusColors[currentStatus] || { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
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

  const hasPendingHighlight = highlightBookingId && invoices.some((inv) => {
    const bid = (inv.bookingId?._id || inv.bookingId || "").toString();
    return bid === highlightBookingId && inv.status?.trim() === "Pending";
  });

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
          <h2 className="fw-bold m-0" style={{ color: colors.textPrimary }}>My Invoices</h2>
          <p className="m-0" style={{ color: colors.textSecondary }}>Manage your billing, payments, and invoice statements</p>
        </div>
      )}

      {hasPendingHighlight && !feedback && (
        <div className="mb-3">
          <FeedbackCard feedback={{ type: 'info', message: 'Complete payment below to confirm your reservation.' }} />
        </div>
      )}

      {feedback && (
        <div className="mb-3">
          <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
        </div>
      )}

      {!loading && invoices.length === 0 && (
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
          <p className="m-0" style={{ color: colors.textSecondary }}>You don't have any invoices at the moment.</p>
        </div>
      )}

      {invoices.length > 0 && (
        <div
          style={{
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow,
            overflow: 'hidden'
          }}
        >
          <div className="table-responsive">
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                color: colors.textPrimary,
                fontSize: '14.5px'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    borderBottom: `1px solid ${colors.borderCard}`,
                    textAlign: 'left'
                  }}
                >
                  <th className="px-4 py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary, width: '15%' }}>Invoice ID</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Room</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Amount</th>
                  <th className="py-3 text-uppercase small fw-bold text-center" style={{ color: colors.textSecondary }}>Status</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Issue Date</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-end" style={{ color: colors.textSecondary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const id = invoice._id || invoice.id || "";
                  const bId = invoice?.bookingId?._id || invoice?.bookingId || "";
                  const isHighlighted = highlightBookingId && bId.toString() === highlightBookingId;
                  const isPayPending = pendingAction?.type === 'pay' && pendingAction.invoiceId === id;
                  const isCancelPending = pendingAction?.type === 'cancel' && pendingAction.invoiceId === id;

                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: `1px solid ${colors.borderCard}`,
                        transition: 'background-color 0.2s',
                        backgroundColor: isHighlighted ? (isDark ? 'rgba(200, 90, 73, 0.08)' : 'rgba(200, 90, 73, 0.06)') : 'transparent',
                        outline: isHighlighted ? `2px solid ${colors.accent}` : 'none',
                        outlineOffset: '-2px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isHighlighted) {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.01)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isHighlighted
                          ? (isDark ? 'rgba(200, 90, 73, 0.08)' : 'rgba(200, 90, 73, 0.06)')
                          : 'transparent';
                      }}
                    >
                      <td className="px-4 py-3 fw-mono small" style={{ color: colors.textSecondary }}>
                        #{id ? id.substring(0, 8).toUpperCase() : "N/A"}
                      </td>
                      <td className="py-3 fw-semibold" style={{ color: colors.textPrimary }}>
                        Room #{invoice.roomNumber || "N/A"}
                      </td>
                      <td className="py-3 fw-bold" style={{ color: colors.accent }}>
                        ${Number(invoice.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        {getStatusPill(invoice.status)}
                      </td>
                      <td className="py-3" style={{ color: colors.textSecondary }}>
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {invoice.status?.trim() === "Pending" && !isPayPending && !isCancelPending && (
                          <div className="d-flex justify-content-end gap-2 align-items-center">
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => setPendingAction({ type: 'pay', invoiceId: id, bookingId: bId })}
                              style={{
                                background: colors.accent,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              Pay
                            </button>
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => setPendingAction({ type: 'cancel', invoiceId: id, bookingId: bId })}
                              style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {isPayPending && (
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 8px' }}>
                              Confirm payment of ${Number(invoice.totalAmount || 0).toLocaleString()}?
                            </p>
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handlePayInvoice(id, bId)}
                                style={{
                                  background: colors.accent,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                {actionLoading === id ? 'Paying...' : 'Confirm Pay'}
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => setPendingAction(null)}
                                style={{
                                  background: 'transparent',
                                  color: colors.textSecondary,
                                  border: `1px solid ${colors.borderCard}`,
                                  borderRadius: '8px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Back
                              </button>
                            </div>
                          </div>
                        )}

                        {isCancelPending && (
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 8px' }}>
                              Cancel this invoice and its booking?
                            </p>
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleCancelInvoice(id, bId)}
                                style={{
                                  background: 'transparent',
                                  color: '#ef4444',
                                  border: '1px solid #ef4444',
                                  borderRadius: '8px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                {actionLoading === id ? 'Cancelling...' : 'Confirm Cancel'}
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => setPendingAction(null)}
                                style={{
                                  background: 'transparent',
                                  color: colors.textSecondary,
                                  border: `1px solid ${colors.borderCard}`,
                                  borderRadius: '8px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Back
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvoicesPage;
