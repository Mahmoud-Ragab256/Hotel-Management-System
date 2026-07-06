import { useEffect, useState } from 'react';
import {
  Button, Card, Col, Form, Row, Spinner, Table, ButtonGroup, Modal
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPaperPlane, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

function NotificationsPage() {
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
    <div className="d-flex flex-column gap-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

      {/* Header with logo */}
      <div className="d-flex align-items-center justify-content-between pt-2">
        <div className="d-flex align-items-center gap-3">
          {/* Logo */}
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 12px rgba(14,165,233,0.3)'
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="h2 fw-bold text-dark mb-0">Notification Center</h1>
            <p className="text-muted mb-0 small">Manage and monitor all system, booking, and service alerts.</p>
          </div>
        </div>
        <Button variant="primary" className="px-4 py-2 fw-semibold" onClick={() => setShowFormModal(true)} style={{ borderRadius: '8px' }}>
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Notification
        </Button>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      {/* Filters */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Type:</span>
              <Form.Select size="sm" className="border-light-subtle bg-light fw-medium text-dark" style={{ width: '160px', borderRadius: '6px' }}
                value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Notifications</option>
                <option value="System">System</option>
                <option value="Booking">Booking</option>
                <option value="Service">Service</option>
              </Form.Select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Recipient:</span>
              <Form.Select size="sm" className="border-light-subtle bg-light fw-medium text-dark" style={{ width: '130px', borderRadius: '6px' }}
                value={filterRecipient} onChange={(e) => setFilterRecipient(e.target.value)}>
                <option value="All">All</option>
                <option value="Guest">Guest</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <ButtonGroup size="sm" className="bg-light p-1" style={{ borderRadius: '8px' }}>
              {['All', 'Unread', 'Read'].map((tab) => (
                <Button key={tab} variant={statusTab === tab ? 'white' : 'light'}
                  className={`px-3 border-0 rounded-2 small fw-medium ${statusTab === tab ? 'shadow-sm text-dark' : 'text-muted'}`}
                  onClick={() => setStatusTab(tab)}>
                  {tab}
                </Button>
              ))}
            </ButtonGroup>
            <Button variant="link" className="text-muted text-decoration-none small p-0 fw-medium">
              <FontAwesomeIcon icon={faSlidersH} className="me-1" /> Advanced Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <Table className="align-middle mb-0" hover>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #edf2f7' }}>
              <tr>
                <th className="text-muted text-uppercase px-4 py-3 small fw-bold" style={{ width: '80px' }}>Status</th>
                <th className="text-muted text-uppercase px-3 py-3 small fw-bold">Message</th>
                <th className="text-muted text-uppercase px-3 py-3 small fw-bold" style={{ width: '120px' }}>Type</th>
                <th className="text-muted text-uppercase px-3 py-3 small fw-bold" style={{ width: '140px' }}>Recipient</th>
                <th className="text-muted text-uppercase px-4 py-3 small fw-bold text-end" style={{ width: '160px' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5" className="text-center py-5 text-muted">
                  <Spinner animation="border" size="sm" className="me-2" /> Loading notifications...
                </td></tr>
              )}
              {!loading && filteredNotifications.length === 0 && (
                <tr><td colSpan="5" className="text-center py-5 text-muted small">
                  No notifications match the active filter criteria.
                </td></tr>
              )}
              {/* لا يوجد onClick على الصف — مش بيتحول لمقروء */}
              {!loading && filteredNotifications.map((notif) => (
                <tr key={notif._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td className="px-4 py-3 text-center">
                    {!notif.isRead ? (
                      <span className="d-inline-block bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                    ) : (
                      <span className="d-inline-block bg-light-subtle rounded-circle border" style={{ width: '8px', height: '8px', borderColor: '#cbd5e1' }}></span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{notif.title}</div>
                    <div className="text-muted small mt-1" style={{ maxWidth: '550px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{notif.message}</div>
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const t = notif.type?.toLowerCase() || '';
                      const colors = t === 'booking' ? { bg: '#e6f7ed', text: '#1e5a3e' }
                        : t === 'service' ? { bg: '#fef3c7', text: '#92400e' }
                        : { bg: '#e8f0fe', text: '#4c6cb3' };
                      return (
                        <span className="fw-medium px-3 d-inline-block" style={{ fontSize: '13px', borderRadius: '50px', backgroundColor: colors.bg, color: colors.text, padding: '4px 12px' }}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      );
                    })()}
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
        <style>{`.notification-modal-fixed-width { max-width: 650px !important; width: 100% !important; }`}</style>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">New Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Recipient Type</Form.Label>
                  <Form.Select className="py-2" value={formData.recipientType} onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}>
                    <option value="Guest">Guest Only</option>
                    <option value="Employee">Employee Only</option>
                    <option value="Admin">Admin Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Notification Type</Form.Label>
                  <Form.Select className="py-2" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="System">System</option>
                    <option value="Booking">Booking</option>
                    <option value="Service">Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Recipient User ID</Form.Label>
                  <Form.Control type="text" required placeholder="Paste a valid user ObjectId" className="py-2"
                    value={formData.recipientId} onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Notification Title</Form.Label>
                  <Form.Control type="text" required placeholder="e.g., New Room Service Order" className="py-2"
                    value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Message Content</Form.Label>
                  <Form.Control as="textarea" rows={4} required placeholder="Provide clear details..." style={{ resize: 'none' }}
                    value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12} className="text-end mt-4">
                <Button variant="light" className="me-2 px-4" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
                <Button type="submit" variant="primary" className="px-4" disabled={saving}>
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
