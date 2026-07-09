import { useEffect, useState } from 'react';
import {
  Button, Card, Col, Form, Row, Spinner, Table, ButtonGroup, Modal
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPaperPlane, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

function NotificationsPage() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterRecipient, setFilterRecipient] = useState('All');
  const [statusTab, setStatusTab] = useState('All');

  const initialFormState = {
    recipientType: 'Guest', title: '', message: '', type: 'System', recipientId: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleCloseModal = () => {
    setShowFormModal(false);
    setFormData(initialFormState);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      showFeedback('danger', `Could not load notifications: ${getApiErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setShowFormModal(false);
    const dataToSend = { ...formData };
    setFormData(initialFormState);
    try {
      await dashboardApi.createNotification(dataToSend);
      showFeedback('success', 'Notification created successfully.');
      await loadNotifications();
    } catch (error) {
      showFeedback('danger', `Failed to create notification: ${getApiErrorMessage(error)}`);
      setFormData(dataToSend);
      setShowFormModal(true);
    } finally {
      setSaving(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filterType !== 'All' && notif.type !== filterType) return false;
    if (filterRecipient !== 'All' && notif.recipientType !== filterRecipient) return false;
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

  return (
    <div className="d-flex flex-column gap-4" style={{ backgroundColor: 'transparent', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center pt-2">
        <div>
          <h1 className="h2 fw-bold mb-1" style={{ color: colors.textPrimary }}>Notification Center</h1>
          <p className="mb-0" style={{ color: colors.textSecondary }}>Manage and monitor all system, booking, and service alerts.</p>
        </div>
        <Button
          variant="primary"
          className="create-notification-btn"
          onClick={() => setShowFormModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Notification
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
        <Card.Body className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span style={{ color: colors.textSecondary }} className="small">Type:</span>
              <Form.Select
                size="sm"
                className="fw-medium"
                style={{
                  width: '160px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? colors.bgCardAlt : '#f8f9fa',
                  color: colors.textPrimary,
                  borderColor: isDark ? colors.borderCard : 'rgba(0,0,0,0.1)'
                }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>All Notifications</option>
                <option value="System" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>System</option>
                <option value="Booking" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Booking</option>
                <option value="Service" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Service</option>
              </Form.Select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ color: colors.textSecondary }} className="small">Recipient:</span>
              <Form.Select
                size="sm"
                className="fw-medium"
                style={{
                  width: '130px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? colors.bgCardAlt : '#f8f9fa',
                  color: colors.textPrimary,
                  borderColor: isDark ? colors.borderCard : 'rgba(0,0,0,0.1)'
                }}
                value={filterRecipient}
                onChange={(e) => setFilterRecipient(e.target.value)}
              >
                <option value="All" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>All</option>
                <option value="Guest" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Guest</option>
                <option value="Employee" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Employee</option>
                <option value="Admin" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Admin</option>
              </Form.Select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
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

            <Button variant="link" className="text-decoration-none small p-0 fw-medium" style={{ color: colors.textSecondary }}>
              <FontAwesomeIcon icon={faSlidersH} className="me-1" /> Advanced Filters
            </Button>
          </div>
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
                <th className="text-uppercase px-3 py-3 small fw-bold" style={{ width: '140px', color: colors.textSecondary, borderBottom: 'none' }}>Recipient</th>
                <th className="text-uppercase px-4 py-3 small fw-bold text-end" style={{ width: '160px', color: colors.textSecondary, borderBottom: 'none' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center py-5" style={{ color: colors.textSecondary, borderBottom: 'none' }}>
                    <Spinner animation="border" size="sm" className="me-2" /> Loading center updates...
                  </td>
                </tr>
              )}
              {!loading && filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 small" style={{ color: colors.textMuted, borderBottom: 'none' }}>
                    No notifications match the active filter criteria.
                  </td>
                </tr>
              )}
              {/* لا يوجد onClick على الصف — مش بيتحول لمقروء */}
              {!loading && filteredNotifications.map((notif) => (
                <tr
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
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
                    <div className="small mt-1" style={{ color: colors.textMuted, maxWidth: '550px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {notif.message}
                    </div>
                  </td>
                  <td className="px-3 py-3" style={{ borderBottom: 'none' }}>
                    {(() => {
                      const typeLower = notif.type ? notif.type.toLowerCase() : '';

                      let bgColor = isDark ? 'rgba(76, 108, 179, 0.2)' : '#e8f0fe';
                      let textColor = isDark ? '#a0bdfa' : '#4c6cb3';

                      if (typeLower === 'booking') {
                        bgColor = isDark ? 'rgba(30, 90, 62, 0.25)' : '#e6f7ed';
                        textColor = isDark ? '#86efac' : '#1e5a3e';
                      } else if (typeLower === 'system') {
                        bgColor = isDark ? 'rgba(76, 108, 179, 0.25)' : '#e8f0fe';
                        textColor = isDark ? '#a0bdfa' : '#4c6cb3';
                      } else if (typeLower === 'service') {
                        bgColor = isDark ? 'rgba(146, 64, 14, 0.25)' : '#fef3c7';
                        textColor = isDark ? '#fde047' : '#92400e';
                      }

                      return (
                        <span
                          className="fw-medium px-3 py-1.5 d-inline-block"
                          style={{
                            fontSize: '13px',
                            borderRadius: '50px',
                            backgroundColor: bgColor,
                            color: textColor
                          }}
                        >
                          {typeLower ? typeLower.charAt(0).toUpperCase() + typeLower.slice(1) : ''}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3 fw-medium small" style={{ color: colors.textPrimary, borderBottom: 'none' }}>
                    {notif.recipientType}
                  </td>
                  <td className="px-4 py-3 text-end small" style={{ color: colors.textSecondary, borderBottom: 'none' }}>
                    {formatTimeAgo(notif.createdAt)}
                  </td>
                  <td className="px-3 py-3 fw-medium text-dark-emphasis small">{notif.recipientType}</td>
                  <td className="px-4 py-3 text-end text-muted small">{formatTimeAgo(notif.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal show={showFormModal} onHide={handleCloseModal} centered dialogClassName="notification-modal-fixed-width">
        <style>{`
          .notification-modal-fixed-width {
            max-width: 650px !important;
            width: 100% !important;
          }
        `}</style>
        <Modal.Header closeButton style={{ backgroundColor: colors.bgCard, borderColor: isDark ? colors.borderCard : '#dee2e6' }}>
          <Modal.Title className="fw-bold" style={{ color: colors.textPrimary }}>New Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: colors.textSecondary }}>Recipient Type</Form.Label>
                  <Form.Select
                    className="py-2 premium-form-control"
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                  >
                    <option value="Guest" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Guest Only</option>
                    <option value="Employee" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Employee Only</option>
                    <option value="Admin" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Admin Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: colors.textSecondary }}>Notification Type</Form.Label>
                  <Form.Select
                    className="py-2 premium-form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="System" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>System</option>
                    <option value="Booking" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Booking</option>
                    <option value="Service" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: colors.textSecondary }}>Recipient User ID (From Database)</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Paste a valid user ObjectId (e.g., 64bcb...)"
                    className="py-2 premium-form-control"
                    value={formData.recipientId}
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: colors.textSecondary }}>Notification Title</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g., New Room Service Order #882"
                    className="py-2 premium-form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: colors.textSecondary }}>Message Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    placeholder="Provide clear details regarding this alert notification..."
                    className="premium-form-control"
                    style={{ resize: 'none' }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={12} className="text-end mt-4">
                <Button
                  variant="outline-secondary"
                  className="me-2 px-4"
                  onClick={handleCloseModal}
                  disabled={saving}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="send-notification-btn"
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  {saving ? 'Sending...' : 'Send Notification'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default NotificationsPage;
