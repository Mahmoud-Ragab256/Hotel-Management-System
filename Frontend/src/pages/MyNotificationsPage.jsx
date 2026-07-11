import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Spinner, Table, ButtonGroup, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { getCurrentUser } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

function MyNotificationsPage() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [statusTab, setStatusTab] = useState('All');
  const [selectedNotif, setSelectedNotif] = useState(null);

  const location = useLocation();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getMyNotifications(currentUserId);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (error) {
      showFeedback('danger', `Could not load notifications: ${getApiErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const targetId = location.state?.openNotificationId;
    if (!targetId || notifications.length === 0) return;
    const target = notifications.find((n) => n._id === targetId);
    if (target) setSelectedNotif(target);
  }, [notifications, location.state]);

  const handleOpenDetails = async (notif) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      try {
        await dashboardApi.readNotificationById(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        showFeedback('danger', `Could not mark as read: ${getApiErrorMessage(error)}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (!hasUnread) return;
    try {
      await dashboardApi.readAllMineNotifications(currentUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showFeedback('success', 'All notifications marked as read.');
    } catch (error) {
      showFeedback('danger', `Failed to update notifications: ${getApiErrorMessage(error)}`);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (statusTab === 'Unread' && notif.isRead) return false;
    if (statusTab === 'Read' && !notif.isRead) return false;
    return true;
  });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const typeColors = (type) => {
    const typeLower = type ? type.toLowerCase() : '';
    if (typeLower === 'booking') {
      return {
        bg: isDark ? 'rgba(30, 90, 62, 0.25)' : '#e6f7ed',
        text: isDark ? '#86efac' : '#1e5a3e'
      };
    }
    if (typeLower === 'service') {
      return {
        bg: isDark ? 'rgba(146, 64, 14, 0.25)' : '#fef3c7',
        text: isDark ? '#fde047' : '#92400e'
      };
    }
    return {
      bg: isDark ? 'rgba(76, 108, 179, 0.25)' : '#e8f0fe',
      text: isDark ? '#a0bdfa' : '#4c6cb3'
    };
  };

  return (
    <div className="d-flex flex-column gap-4" style={{ backgroundColor: 'transparent', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center pt-2">
        <div>
          <h1 className="h2 fw-bold mb-1" style={{ color: colors.textPrimary }}>My Notifications</h1>
          <p className="mb-0" style={{ color: colors.textSecondary }}>All updates and alerts related to your account.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.accent}`,
            color: colors.accent,
            borderRadius: '20px',
            padding: '8px 20px',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.accent; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.accent; }}
        >
          <FontAwesomeIcon icon={faCheckDouble} /> Mark All as Read
        </button>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Card
        className="border-0 shadow-sm"
        style={{
          borderRadius: '12px',
          backgroundColor: colors.bgCard,
          border: isDark ? `1px solid ${colors.borderCard}` : 'none'
        }}
      >
        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
          <ButtonGroup size="sm" className="p-1" style={{ borderRadius: '8px', backgroundColor: isDark ? colors.bgCardAlt : '#f1f5f9' }}>
            {['All', 'Unread', 'Read'].map((tab) => (
              <Button
                key={tab}
                variant="none"
                style={{
                  backgroundColor: statusTab === tab ? colors.accent : 'transparent',
                  color: statusTab === tab ? '#ffffff' : colors.textSecondary,
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                className={`px-3 border-0 small fw-medium ${statusTab === tab ? 'shadow-sm' : ''}`}
                onClick={() => setStatusTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </ButtonGroup>
        </Card.Body>
      </Card>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '200px' }}>
          <div style={{ width: '32px', height: '32px', border: `2px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
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
          <FontAwesomeIcon icon={faBell} className="mb-2" style={{ fontSize: '28px', color: colors.textMuted, opacity: 0.5 }} />
          <p className="m-0" style={{ color: colors.textSecondary }}>No notifications match the active filter criteria.</p>
        </div>
      )}

      {!loading && filteredNotifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotifications.map((notif) => {
            const tc = typeColors(notif.type);
            return (
              <div
                key={notif._id}
                onClick={() => handleOpenDetails(notif)}
                style={{
                  background: colors.bgCard,
                  borderRadius: '16px',
                  border: `1px solid ${colors.borderCard}`,
                  borderLeft: !notif.isRead ? `4px solid ${colors.accent}` : `1px solid ${colors.borderCard}`,
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: colors.shadow,
                  transition: 'all 0.2s ease',
                  backgroundColor: !notif.isRead 
                    ? (isDark ? 'rgba(200, 90, 73, 0.06)' : 'rgba(200, 90, 73, 0.02)') 
                    : colors.bgCard
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = colors.accent; 
                  e.currentTarget.style.transform = 'translateY(-2px)'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = colors.borderCard; 
                  e.currentTarget.style.transform = 'translateY(0)'; 
                }}
              >
                {/* Header of Notification Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!notif.isRead && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: '50px',
                        backgroundColor: tc.bg,
                        color: tc.text,
                        padding: '4px 10px'
                      }}
                    >
                      {notif.type}
                    </span>
                  </div>
                  <span style={{ fontSize: '12.5px', color: colors.textMuted }}>
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 6px', fontFamily: '"Playfair Display", serif' }}>
                    {notif.title}
                  </h4>
                  <p style={{ fontSize: '13.5px', color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal show={!!selectedNotif} onHide={() => setSelectedNotif(null)} centered>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.borderCard}`,
          backgroundColor: colors.bgCard
        }}>
          <h5 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: colors.textPrimary }}>Notification Details</h5>
          <button
            onClick={() => setSelectedNotif(null)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textMuted,
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0
            }}
          >&times;</button>
        </div>
        {selectedNotif && (
          <Modal.Body className="p-4" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge
                style={{
                  backgroundColor: typeColors(selectedNotif.type).bg,
                  color: typeColors(selectedNotif.type).text,
                  fontWeight: 500,
                  padding: '6px 12px',
                  borderRadius: '50px'
                }}
              >
                {selectedNotif.type}
              </Badge>
              <span className="small" style={{ color: colors.textMuted }}>
                {formatTimeAgo(selectedNotif.createdAt)}
              </span>
            </div>
            <h5 className="fw-bold mb-3" style={{ color: colors.textPrimary }}>{selectedNotif.title}</h5>
            <p style={{ color: colors.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {selectedNotif.message}
            </p>
          </Modal.Body>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 24px',
          borderTop: `1px solid ${colors.borderCard}`,
          backgroundColor: colors.bgCard
        }}>
          <button
            onClick={() => setSelectedNotif(null)}
            style={{
              background: colors.accent,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 24px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default MyNotificationsPage;