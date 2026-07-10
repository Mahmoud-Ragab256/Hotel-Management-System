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
        <Button variant="outline-primary" onClick={handleMarkAllRead}>
          <FontAwesomeIcon icon={faCheckDouble} className="me-2" /> Mark All as Read
        </Button>
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
                  backgroundColor: statusTab === tab ? (isDark ? '#2a3554' : '#ffffff') : 'transparent',
                  color: statusTab === tab ? colors.textPrimary : colors.textSecondary,
                  borderRadius: '6px'
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

      <Card
        className="border-0 shadow-sm"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: colors.bgCard,
          border: isDark ? `1px solid ${colors.borderCard}` : 'none'
        }}
      >
        <div className="table-responsive">
          <Table
            className="align-middle mb-0"
            style={{
              '--bs-table-hover-bg': isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa',
              color: colors.textPrimary
            }}
            hover
          >
            <thead style={{ backgroundColor: isDark ? colors.bgCardAlt : '#f8f9fa', borderBottom: isDark ? `1px solid ${colors.borderCard}` : '1px solid #edf2f7' }}>
              <tr>
                <th className="text-uppercase px-4 py-3 small fw-bold" style={{ width: '80px', color: colors.textSecondary, borderBottom: 'none' }}>Status</th>
                <th className="text-uppercase px-3 py-3 small fw-bold" style={{ color: colors.textSecondary, borderBottom: 'none' }}>Message</th>
                <th className="text-uppercase px-3 py-3 small fw-bold" style={{ width: '120px', color: colors.textSecondary, borderBottom: 'none' }}>Type</th>
                <th className="text-uppercase px-4 py-3 small fw-bold text-end" style={{ width: '160px', color: colors.textSecondary, borderBottom: 'none' }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center py-5" style={{ color: colors.textSecondary, borderBottom: 'none' }}>
                    <Spinner animation="border" size="sm" className="me-2" /> Loading notifications...
                  </td>
                </tr>
              )}
              {!loading && filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-5 small" style={{ color: colors.textMuted, borderBottom: 'none' }}>
                    <FontAwesomeIcon icon={faBell} className="mb-2 d-block mx-auto" style={{ fontSize: '24px', opacity: 0.4 }} />
                    No notifications match the active filter.
                  </td>
                </tr>
              )}
              {!loading && filteredNotifications.map((notif) => {
                const tc = typeColors(notif.type);
                return (
                  <tr
                    key={notif._id}
                    onClick={() => handleOpenDetails(notif)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: isDark ? `1px solid ${colors.borderCard}` : '1px solid #edf2f7',
                      backgroundColor: !notif.isRead ? (isDark ? 'rgba(200, 90, 73, 0.06)' : 'rgba(200, 90, 73, 0.03)') : 'transparent'
                    }}
                  >
                    <td className="px-4 py-3 text-center" style={{ borderBottom: 'none' }}>
                      {!notif.isRead ? (
                        <span className="d-inline-block bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                      ) : (
                        <span className="d-inline-block rounded-circle border" style={{ width: '8px', height: '8px', backgroundColor: 'transparent', borderColor: isDark ? colors.borderCard : '#cbd5e1' }}></span>
                      )}
                    </td>
                    <td className="px-3 py-3" style={{ borderBottom: 'none' }}>
                      <div className="fw-bold" style={{ fontSize: '15px', color: !notif.isRead ? colors.textPrimary : colors.textSecondary }}>
                        {notif.title}
                      </div>
                      <div className="small mt-1" style={{ color: colors.textMuted, maxWidth: '550px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {notif.message}
                      </div>
                    </td>
                    <td className="px-3 py-3" style={{ borderBottom: 'none' }}>
                      <span
                        className="fw-medium px-3 py-1 d-inline-block"
                        style={{ fontSize: '13px', borderRadius: '50px', backgroundColor: tc.bg, color: tc.text }}
                      >
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end small" style={{ color: colors.textSecondary, borderBottom: 'none' }}>
                      {formatTimeAgo(notif.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal show={!!selectedNotif} onHide={() => setSelectedNotif(null)} centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.bgCard, borderColor: isDark ? colors.borderCard : '#dee2e6' }}>
          <Modal.Title className="fw-bold" style={{ color: colors.textPrimary }}>Notification Details</Modal.Title>
        </Modal.Header>
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
        <Modal.Footer style={{ backgroundColor: colors.bgCard, borderColor: isDark ? colors.borderCard : '#dee2e6' }}>
          <Button variant="secondary" onClick={() => setSelectedNotif(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyNotificationsPage;