import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { dashboardApi } from "../services/api.js";
import { getCurrentUser } from "../services/auth.js";
import { formatDisplayDate } from "../utils/date.js";
import "../styles/notificationsBell.css";

const getStoredUserId = () => {
  const user = getCurrentUser('guest');
  return user?.id || user?._id || null;
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);

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
    <div className="notification-wrapper" ref={boxRef}>
      <button className="notification-bell-btn" onClick={() => setOpen((prev) => !prev)}>
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-box">
          <div className="notification-box-header">
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="notification-unread-label">{unreadCount} unread</span>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.isRead ? "notification-read" : "notification-unread"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-date">
                    {formatDisplayDate(n.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notification-box-footer">
            <button className="notification-btn-view-all" onClick={handleViewAll}>
              View All
            </button>
            <button className="notification-btn-read-all" onClick={handleReadAll}>
              Read All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;