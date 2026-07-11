import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spinner, Alert, Table } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const MyInvoicesPage = ({ hideHeader = false }) => {
  const { colors, isDark } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";

      if (!email) {
        setError("Could not identify the logged-in user.");
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
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    try {
      setActionLoading(invoiceId);
      setError("");
      await dashboardApi.updateInvoice(invoiceId, { status: "Paid" });
      await fetchInvoices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvoice = async (invoiceId, bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this invoice and its related booking?")) {
      return;
    }

    try {
      setActionLoading(invoiceId);
      setError("");

      await dashboardApi.updateInvoice(invoiceId, { status: "Cancelled" });

      if (bookingId) {
        await dashboardApi.cancelBooking(bookingId, "Invoice cancelled by user");
      }

      await fetchInvoices();
    } catch (err) {
      setError(getApiErrorMessage(err));
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

      {error && <Alert variant="danger">{error}</Alert>}

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

                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: `1px solid ${colors.borderCard}`,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.01)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                        {invoice.status?.trim() === "Pending" && (
                          <div className="d-flex justify-content-end gap-2 align-items-center">
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => handlePayInvoice(id)}
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
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                            >
                              {actionLoading === id ? (
                                <div style={{ width: '12px', height: '12px', border: '1.5px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              ) : (
                                "Pay"
                              )}
                            </button>
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
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              {actionLoading === id ? (
                                <div style={{ width: '12px', height: '12px', border: '1.5px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              ) : (
                                "Cancel"
                              )}
                            </button>
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