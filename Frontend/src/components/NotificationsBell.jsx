import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { dashboardApi } from "../services/api.js";
import { formatDisplayDate } from "../utils/date.ts";
import { useTheme } from "../context/ThemeContext.jsx";
import "../styles/notificationsBell.css";

const USER_KEY = "hotel_admin_user";

const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return user?._id || null;
  } catch {
    return null;
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const { colors, isDark } = useTheme();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userId = getStoredUserId();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!userId) return;
    dashboardApi.getMyNotifications(userId)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await dashboardApi.readNotificationById(notification._id);
        setNotifications((prev) =>
          prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch { }
    }
    setOpen(false);
    navigate(`/notifications/${notification._id}`);
  };

  const handleViewAll = async () => {
    try {
      await dashboardApi.readAllMineNotifications(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
    setOpen(false);
    navigate("/notifications");
  };

  const handleReadAll = async () => {
    try {
      await dashboardApi.readAllMineNotifications(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
  };

  if (!userId) return null;

  return (
    <div className="notification-wrapper" ref={boxRef} style={{ position: "relative" }}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: colors.textPrimary,
          padding: "6px 10px",
          borderRadius: "50%",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f3f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: colors.accent,
              color: "#fff",
              fontSize: "10px",
              fontWeight: "700",
              minWidth: "18px",
              height: "18px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-box"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "340px",
            background: colors.bgCard,
            border: `1px solid ${colors.borderCard}`,
            borderRadius: "12px",
            boxShadow: colors.shadow,
            zIndex: 1050,
            overflow: "hidden"
          }}
        >
          <div
            className="notification-box-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: `1px solid ${colors.borderCard}`,
              fontSize: "15px",
              color: colors.textPrimary
            }}
          >
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="notification-unread-label" style={{ fontSize: "12px", color: colors.textSecondary }}>
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="notification-list" style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="notification-empty" style={{ padding: "24px 16px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.isRead ? "notification-read" : "notification-unread"}`}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: `1px solid ${colors.borderCard}`,
                    transition: "all 0.15s ease",
                    backgroundColor: n.isRead 
                      ? (isDark ? "transparent" : "#f8fafc") 
                      : (isDark ? "rgba(200, 90, 73, 0.12)" : "rgba(200, 90, 73, 0.06)")
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead
                      ? (isDark ? "rgba(255, 255, 255, 0.04)" : "#f1f5f9")
                      : (isDark ? "rgba(200, 90, 73, 0.18)" : "rgba(200, 90, 73, 0.12)");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead 
                      ? (isDark ? "transparent" : "#f8fafc") 
                      : (isDark ? "rgba(200, 90, 73, 0.12)" : "rgba(200, 90, 73, 0.06)");
                  }}
                >
                  <div className="notification-title" style={{ fontSize: "13px", fontWeight: "600", color: colors.textPrimary, marginBottom: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {n.title}
                  </div>
                  <div className="notification-message" style={{ fontSize: "12px", color: colors.textSecondary, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {n.message}
                  </div>
                  <div className="notification-date" style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>
                    {formatDisplayDate(n.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className="notification-box-footer"
            style={{
              display: "flex",
              gap: "8px",
              padding: "12px 16px",
              borderTop: `1px solid ${colors.borderCard}`
            }}
          >
            <button
              className="notification-btn-view-all"
              onClick={handleViewAll}
              style={{
                flex: 1,
                backgroundColor: colors.accent,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 0",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.accent;
              }}
            >
              View All
            </button>
            <button
              className="notification-btn-read-all"
              onClick={handleReadAll}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                color: colors.textPrimary,
                border: `1px solid ${colors.borderCard}`,
                borderRadius: "8px",
                padding: "8px 0",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Read All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;