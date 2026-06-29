import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faBriefcase,
  faBuilding,
  faLock,
  faPenToSquare,
  faCamera,
  faTrash,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faEye,
  faEyeSlash,
  faCalendarCheck,
  faStar,
  faBed
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const PRIMARY = '#111827';

const vipLevelStyle = (level = '') => {
  if (level === 'Bronze') return { background: '#cd7f32', color: '#fff', border: 'none' };
  if (level === 'Silver') return { background: '#71717a', color: '#fff', border: 'none' };
  if (level === 'Gold') return { background: '#ffd700', color: '#78350f', border: 'none' };
  if (level === 'Platinum') return { background: '#94a3b8', color: '#fff', border: 'none' };
  return { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
};

const toDateInput = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const bookingStatusVariant = (status = '') => {
  if (status === 'Confirmed' || status === 'CheckedIn') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'CheckedOut') return 'info';
  if (status === 'Cancelled') return 'danger';
  return 'secondary';
};

const feedbackMeta = (type = 'info') => {
  if (type === 'success') return { title: 'Success', icon: faCircleCheck, tone: 'success' };
  if (type === 'danger') return { title: 'Error', icon: faCircleExclamation, tone: 'danger' };
  if (type === 'warning') return { title: 'Attention', icon: faTriangleExclamation, tone: 'warning' };
  return { title: 'Info', icon: faCircleInfo, tone: 'info' };
};

function FeedbackCard({ feedback, onClose }) {
  const meta = feedbackMeta(feedback?.type);
  return (
    <Card className={`border-0 shadow-sm feedback-card feedback-card-${meta.tone}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-start gap-3">
          <span className={`feedback-icon bg-${meta.tone}-subtle text-${meta.tone} rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0`}>
            <FontAwesomeIcon icon={meta.icon} />
          </span>
          <div className="flex-grow-1">
            <div className="fw-semibold">{meta.title}</div>
            <div className="small text-muted">{feedback?.message}</div>
          </div>
          {onClose && (
            <Button variant="light" size="sm" className="rounded-circle lh-1" onClick={onClose} aria-label="Close">×</Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function PasswordField({ label, value, onChange, placeholder, required = false }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Form.Label className="text-muted small fw-semibold">{label}{required && <span className="text-danger ms-1">*</span>}</Form.Label>
      <div className="input-group">
        <Form.Control
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="border-end-0"
          style={{ borderRadius: '8px 0 0 8px' }}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setShow((s) => !s)}
          style={{ borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="d-flex align-items-start gap-3 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span
        className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
        style={{ width: 36, height: 36, background: '#f8fafc', color: '#64748b' }}
      >
        <FontAwesomeIcon icon={icon} size="sm" />
      </span>
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fw-semibold" style={{ color: PRIMARY }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '', email: '', phone: '', nationalId: ''
  });

  // Password modal
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const showFeedback = (type, message) => setFeedback({ type, message });

  useEffect(() => {
    // 1. عرض البيانات من localStorage فوراً
    try {
      const stored = localStorage.getItem('hotel_admin_user');
      if (stored) setProfile(JSON.parse(stored));
    } catch { /* ignore */ }

    // 2. جيب من الـ backend في الـ background وحدّث
    dashboardApi.getMe()
      .then((data) => {
        setProfile(data);
        localStorage.setItem('hotel_admin_user', JSON.stringify(data));
      })
      .catch(() => { /* localStorage data is still shown */ })
      .finally(() => setLoading(false));
  }, []);

  const openEdit = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      nationalId: profile?.nationalId || ''
    });
    setEditModal(true);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await dashboardApi.updateMe(editForm);
      const merged = { ...profile, ...updated };
      setProfile(merged);
      localStorage.setItem('hotel_admin_user', JSON.stringify(merged));
      setEditModal(false);
      showFeedback('success', 'Profile updated successfully.');
    } catch (error) {
      showFeedback('danger', `Could not update profile: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await dashboardApi.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
        confirmPassword: passwordForm.confirm
      });
      setPasswordModal(false);
      setPasswordForm({ current: '', next: '', confirm: '' });
      showFeedback('success', 'Password changed successfully.');
    } catch (error) {
      showFeedback('danger', `Could not change password: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const updated = await dashboardApi.updateProfileImage(formData);
      const merged = { ...profile, avatar: updated ? `${updated}?t=${Date.now()}` : null };
      setProfile(merged);
      localStorage.setItem('hotel_admin_user', JSON.stringify(merged));
      showFeedback('success', 'Photo updated.');
    } catch (error) {
      showFeedback('danger', `Could not upload photo: ${getApiErrorMessage(error)}`);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const updated = await dashboardApi.removeProfileImage();
      const merged = { ...profile, avatar: updated ? `${updated}?t=${Date.now()}` : null };
      setProfile(merged);
      localStorage.setItem('hotel_admin_user', JSON.stringify(merged));
      showFeedback('success', 'Photo removed.');
    } catch (error) {
      showFeedback('danger', `Could not remove photo: ${getApiErrorMessage(error)}`);
    }
  };

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));

    dashboardApi.getMyReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, []);

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-3">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{ width: 44, height: 44, background: '#f0f4ff', color: PRIMARY, flexShrink: 0 }}
            >
              <FontAwesomeIcon icon={faUser} />
            </span>
            <div>
              <h1 className="h3 fw-bold mb-1">My Profile</h1>
              <p className="text-muted mb-0">View and manage your account details.</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      {loading && !profile ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          {/* Avatar card */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex flex-wrap align-items-center gap-4">
                {/* Avatar */}
                <div className="position-relative flex-shrink-0">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold fs-3"
                      style={{ width: 96, height: 96, borderRadius: '50%', background: '#e2e8f0', color: PRIMARY, border: '3px solid #cbd5e1', userSelect: 'none' }}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name + role */}
                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h2 className="h4 fw-bold mb-0" style={{ color: PRIMARY }}>{profile?.fullName || 'No Name'}</h2>
                    {profile?.vipLevel && (
                      <span style={{ ...vipLevelStyle(profile.vipLevel), fontWeight: 600, fontSize: '0.7rem', padding: '1px 8px', borderRadius: '5px', whiteSpace: 'nowrap', display: 'inline-block', lineHeight: '1.6', flexShrink: 0 }}>
                        {profile.vipLevel.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-muted small d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} size="xs" />
                    {profile?.email || '—'}
                  </div>
                  {/* Photo actions */}
                  <div className="d-flex gap-2 mt-3">
                    <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => fileRef.current?.click()}
                      style={{ borderRadius: 8 }}
                    >
                      <FontAwesomeIcon icon={faCamera} className="me-2" />
                      Change Photo
                    </Button>
                    {profile?.avatar && (
                      <Button size="sm" variant="link" className="text-danger p-0 ms-1" onClick={handleRemovePhoto}>
                        <FontAwesomeIcon icon={faTrash} className="me-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Personal Information */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 p-4 pb-3">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <h2 className="h5 fw-bold mb-1">Personal Information</h2>
                  <p className="text-muted mb-0 small">Your contact details and role.</p>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={openEdit}
                  style={{ borderRadius: 8, flexShrink: 0 }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                  Edit
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="px-4 pb-4 pt-0">
              <Row>
                <Col md={6}>
                  <InfoRow icon={faUser} label="Full Name" value={profile?.fullName} />
                  <InfoRow icon={faEnvelope} label="Email" value={profile?.email} />
                  <InfoRow icon={faPhone} label="Phone" value={profile?.phone} />
                </Col>
                <Col md={6}>
                  <InfoRow icon={faBriefcase} label="National ID" value={profile?.nationalId} />
                  <InfoRow icon={faBuilding} label="VIP Level" value={profile?.vipLevel} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 p-4 pb-3">
              <h2 className="h5 fw-bold mb-1">Security & Privacy</h2>
              <p className="text-muted mb-0 small">Manage how you authenticate and protect your account.</p>
            </Card.Header>
            <Card.Body className="px-4 pb-4 pt-0">
              <div
                className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-3"
                style={{ borderBottom: '1px solid #f1f5f9' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                    style={{ width: 40, height: 40, background: '#f8fafc', color: '#64748b' }}
                  >
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <div>
                    <div className="fw-semibold" style={{ color: PRIMARY }}>Password Authentication</div>
                    {profile?.passwordUpdatedAt ? (
                      <div className="text-muted small">
                        Last updated {new Date(profile.passwordUpdatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                        {' '}We recommend changing it every 6 months.
                      </div>
                    ) : (
                      <div className="text-muted small">We recommend changing it every 6 months.</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ borderRadius: 8, flexShrink: 0 }}
                  onClick={() => { setPasswordForm({ current: '', next: '', confirm: '' }); setPasswordError(''); setPasswordModal(true); }}
                >
                  Change
                </Button>
              </div>
            </Card.Body>
          </Card>
          {/* My Bookings */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 p-4 pb-3">
              <div className="d-flex align-items-center gap-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 36, height: 36, background: '#f0f4ff', color: PRIMARY }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} size="sm" />
                </span>
                <div>
                  <h2 className="h5 fw-bold mb-0">My Bookings</h2>
                  <p className="text-muted mb-0 small">All reservations linked to your account.</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
              {bookingsLoading ? (
                <div className="text-center py-4"><Spinner size="sm" className="me-2" />Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-muted text-center py-4 small">No bookings found.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0 text-center admin-table-centered">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>Room</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => {
                        const id = b?._id || b?.id || '';
                        return (
                          <tr key={id}>
                            <td className="fw-semibold">{id.slice(-8)}</td>
                            <td>
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <FontAwesomeIcon icon={faBed} className="text-muted" size="sm" />
                                {b?.roomId?.roomNumber || b?.roomNumber || 'N/A'}
                              </div>
                            </td>
                            <td>{toDateInput(b.checkInDate)}</td>
                            <td>{toDateInput(b.checkOutDate)}</td>
                            <td>
                              <Badge bg={bookingStatusVariant(b.status)}>{b.status || 'Pending'}</Badge>
                            </td>
                            <td className="fw-semibold">${Number(b.totalPrice || 0).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* My Reviews */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 p-4 pb-3">
              <div className="d-flex align-items-center gap-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 36, height: 36, background: '#fffbeb', color: '#b45309' }}
                >
                  <FontAwesomeIcon icon={faStar} size="sm" />
                </span>
                <div>
                  <h2 className="h5 fw-bold mb-0">My Reviews</h2>
                  <p className="text-muted mb-0 small">Feedback you've left on your stays.</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
              {reviewsLoading ? (
                <div className="text-center py-4"><Spinner size="sm" className="me-2" />Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-muted text-center py-4 small">No reviews yet.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((r) => {
                    const id = r?._id || r?.id || '';
                    return (
                      <div
                        key={id}
                        className="p-3 rounded-3"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                      >
                        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                          <div className="fw-semibold" style={{ color: PRIMARY }}>
                            {r?.roomId?.roomNumber ? `Room ${r.roomId.roomNumber}` : r?.title || 'Review'}
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                size="xs"
                                style={{ color: i < (r.rating || 0) ? '#f59e0b' : '#e2e8f0' }}
                              />
                            ))}
                            <span className="text-muted small ms-1">{r.rating || 0}/5</span>
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-muted small mb-1">{r.comment}</p>
                        )}
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {toDateInput(r.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Edit Profile Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)} centered size="lg">
        <Form onSubmit={handleSaveProfile}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="text-muted small fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Full name"
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-semibold">Email Address</Form.Label>
                <Form.Control
                  readOnly
                  value={editForm.email}
                  className="bg-light"
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-semibold">Phone Number</Form.Label>
                <Form.Control
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-semibold">National ID</Form.Label>
                <Form.Control
                  readOnly
                  value={editForm.nationalId}
                  className="bg-light"
                  style={{ borderRadius: 8 }}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setEditModal(false)} style={{ borderRadius: 8 }}>
              Discard Changes
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: 8, background: PRIMARY, border: 'none', minWidth: 140 }}
            >
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={passwordModal} onHide={() => setPasswordModal(false)} centered>
        <Form onSubmit={handleChangePassword}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column gap-3">
              <PasswordField
                label="Current Password"
                required
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Enter current password"
              />
              <PasswordField
                label="New Password"
                required
                value={passwordForm.next}
                onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                placeholder="At least 8 characters"
              />
              <PasswordField
                label="Confirm New Password"
                required
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Repeat new password"
              />
              {passwordError && (
                <div className="text-danger small d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faCircleExclamation} />
                  {passwordError}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setPasswordModal(false)} style={{ borderRadius: 8 }}>
              Discard Changes
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: 8, background: PRIMARY, border: 'none', minWidth: 140 }}
            >
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;