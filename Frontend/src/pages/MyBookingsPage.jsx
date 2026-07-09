import React, { useState, useEffect } from "react";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";
import { formatDisplayDate } from "../utils/date.ts";
import { useTheme } from "../context/ThemeContext.jsx";

const getStatusColors = (status, isDark) => {
  const themeColors = {
    Confirmed: { 
      bg: "rgba(16, 185, 129, 0.1)", 
      text: isDark ? "#10b981" : "#059669", 
      border: "rgba(16, 185, 129, 0.2)" 
    },
    CheckedIn: { 
      bg: "rgba(59, 130, 246, 0.1)", 
      text: isDark ? "#3b82f6" : "#2563eb", 
      border: "rgba(59, 130, 246, 0.2)" 
    },
    CheckedOut: { 
      bg: isDark ? "rgba(156, 163, 175, 0.1)" : "rgba(107, 114, 128, 0.08)", 
      text: isDark ? "#9ca3af" : "#4b5563", 
      border: isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(107, 114, 128, 0.15)" 
    },
    Cancelled: { 
      bg: "rgba(239, 68, 68, 0.1)", 
      text: isDark ? "#fca5a5" : "#dc2626", 
      border: "rgba(239, 68, 68, 0.2)" 
    },
    Pending: { 
      bg: "rgba(245, 158, 11, 0.1)", 
      text: isDark ? "#f59e0b" : "#d97706", 
      border: "rgba(245, 158, 11, 0.2)" 
    },
  };
  return themeColors[status] || { 
    bg: isDark ? "#222222" : "#f3f4f6", 
    text: isDark ? "#9ca3af" : "#4b5563", 
    border: isDark ? "#2e2e2e" : "#e5e7eb" 
  };
};

function StatusPill({ status }) {
  const { isDark } = useTheme();
  const colors = getStatusColors(status, isDark);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      fontFamily: '"Inter", sans-serif'
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.text }} />
      {status}
    </span>
  );
}

export default function MyBookingsPage() {
  const { colors, isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.getMyBookings()
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: colors.textSecondary }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: `3px solid ${colors.borderCard}`,
          borderTopColor: colors.accent,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ margin: 0, fontSize: "14px", fontFamily: '"Inter", sans-serif' }}>Loading your booking history...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ color: colors.textPrimary, fontFamily: '"Inter", sans-serif' }}>
      
      {/* Page Header Banner */}
      <div style={{
        background: colors.accent,
        borderRadius: "20px",
        border: `1px solid ${colors.borderCard}`,
        padding: "40px 32px",
        marginBottom: "32px",
        position: "relative",
        boxShadow: "0 10px 30px rgba(200, 90, 73, 0.15)"
      }}>
        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>
          Reservations
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff", margin: "0 0 8px", fontFamily: '"Playfair Display", serif' }}>
          My Bookings
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.95)", margin: 0, fontWeight: "300", lineHeight: "1.5" }}>
          Manage and track your entire hotel reservation history and active stays.
        </p>
      </div>

      {error && (
        <div style={{
          background: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
          border: isDark ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(239, 68, 68, 0.15)",
          borderRadius: "12px",
          padding: "14px 18px",
          color: isDark ? "#fca5a5" : "#b91c1c",
          fontSize: "14px",
          marginBottom: "24px"
        }}>
          <strong>Could not load bookings:</strong> {error}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderCard}`,
          borderRadius: "16px",
          padding: "48px 24px",
          textAlign: "center",
          color: colors.textSecondary
        }}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={colors.accent} strokeWidth="1.5" style={{ marginBottom: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "500" }}>You haven't made any bookings yet.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div style={{
            background: colors.bgCard,
            borderRadius: "20px",
            border: `1px solid ${colors.borderCard}`,
            overflow: "hidden",
            boxShadow: colors.shadow
          }} className="desktop-bookings-table">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderCard}`, background: colors.bgCardAlt }}>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Booking ID</th>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Accommodation</th>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Check-In</th>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Check-Out</th>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Cost</th>
                    <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id || booking.id} style={{ borderBottom: `1px solid ${colors.borderCard}`, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgCardHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={{ padding: "18px 24px", fontSize: "13px", color: colors.textSecondary, fontFamily: "monospace" }}>
                        #{ (booking._id || booking.id || '').substring(0, 8).toUpperCase() }...
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: colors.textPrimary }}>
                            {booking.roomId ? `Room #${booking.roomId.roomNumber}` : "N/A"}
                          </span>
                          {booking.roomId?.categoryId?.name && (
                            <span style={{ fontSize: "12px", color: colors.accent }}>{booking.roomId.categoryId.name}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px", fontSize: "14px", color: colors.textPrimary }}>
                        {formatDisplayDate(booking.checkInDate)}
                      </td>
                      <td style={{ padding: "18px 24px", fontSize: "14px", color: colors.textPrimary }}>
                        {formatDisplayDate(booking.checkOutDate)}
                      </td>
                      <td style={{ padding: "18px 24px", fontSize: "16px", fontWeight: "700", color: colors.accent }}>
                        ${booking.totalPrice}
                      </td>
                      <td style={{ padding: "18px 24px", textAlign: "right" }}>
                        <StatusPill status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-bookings-cards" style={{ display: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bookings.map((booking) => (
                <div key={booking._id || booking.id} style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.borderCard}`,
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: colors.shadow,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.borderHover;
                  e.currentTarget.style.boxShadow = colors.shadowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderCard;
                  e.currentTarget.style.boxShadow = colors.shadow;
                }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: colors.textMuted, display: "block" }}>BOOKING ID</span>
                      <span style={{ fontSize: "13px", color: colors.textPrimary, fontWeight: "500", fontFamily: "monospace" }}>
                        #{ (booking._id || booking.id || '').substring(0, 8).toUpperCase() }
                      </span>
                    </div>
                    <StatusPill status={booking.status} />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <span style={{ fontSize: "11px", color: colors.textMuted, display: "block" }}>ACCOMMODATION</span>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
                      {booking.roomId ? `Room #${booking.roomId.roomNumber}` : "N/A"}
                    </span>
                    {booking.roomId?.categoryId?.name && (
                      <span style={{ fontSize: "12px", color: colors.accent, display: "block" }}>{booking.roomId.categoryId.name}</span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px", borderTop: `1px solid ${colors.borderCard}`, borderBottom: `1px solid ${colors.borderCard}`, padding: "10px 0" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: colors.textMuted, display: "block" }}>CHECK-IN</span>
                      <span style={{ fontSize: "13px", color: colors.textPrimary }}>{formatDisplayDate(booking.checkInDate)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: colors.textMuted, display: "block" }}>CHECK-OUT</span>
                      <span style={{ fontSize: "13px", color: colors.textPrimary }}>{formatDisplayDate(booking.checkOutDate)}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: colors.textSecondary }}>Total Cost</span>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: colors.accent }}>${booking.totalPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Media Queries for Responsive Table vs Cards */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-bookings-table { display: none !important; }
          .mobile-bookings-cards { display: block !important; }
        }
      `}</style>
    </div>
  );
}
