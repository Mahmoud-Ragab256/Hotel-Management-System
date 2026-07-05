import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table
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
import { formatDisplayDate } from '../utils/date.ts';

const PRIMARY_DARK = '#111111';
const SECONDARY_DARK = '#161616';
const BORDER_COLOR = '#222222';
const ACCENT_COLOR = '#c85a49';
const ACCENT_HOVER = '#d16b5a';

const vipLevelStyle = (level = '') => {
  const norm = level.toLowerCase();
  if (norm === 'bronze') return { background: '#cd7f32', color: '#ffffff', border: 'none' };
  if (norm === 'silver') return { background: '#71717a', color: '#ffffff', border: 'none' };
  if (norm === 'gold') return { background: '#ffd700', color: '#78350f', border: 'none' };
  if (norm === 'platinum') return { background: '#94a3b8', color: '#ffffff', border: 'none' };
  return { background: '#222222', color: '#9ca3af', border: '1px solid #2e2e2e' };
};

const toDateInput = formatDisplayDate;

const statusColors = {
  Confirmed: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
  CheckedIn: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
  CheckedOut: { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.2)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
};

function StatusPill({ status }) {
  const colors = statusColors[status] || { bg: '#222222', text: '#9ca3af', border: '#2e2e2e' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      fontFamily: '"Inter", sans-serif'
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.text }} />
      {status}
    </span>
  );
}

const feedbackMeta = (type = 'info') => {
  if (type === 'success') return { title: 'Success', icon: faCircleCheck, tone: 'success', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981' };
  if (type === 'danger') return { title: 'Error', icon: faCircleExclamation, tone: 'danger', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5' };
  if (type === 'warning') return { title: 'Attention', icon: faTriangleExclamation, tone: 'warning', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' };
  return { title: 'Info', icon: faCircleInfo, tone: 'info', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
};

function FeedbackCard({ feedback, onClose }) {
  const meta = feedbackMeta(feedback?.type);
  return (
    <div style={{
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      borderRadius: '12px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'start',
      gap: '14px',
      marginBottom: '20px'
    }}>
      <span style={{ color: meta.text, fontSize: '18px', marginTop: '2px' }}>
        <FontAwesomeIcon icon={meta.icon} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{meta.title}</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 300 }}>{feedback?.message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: meta.text, cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
        >
          &times;
        </button>
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, required = false }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: ACCENT_COLOR, marginLeft: '4px' }}>*</span>}
      </label>
      <div style={{ display: 'flex', position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            flex: 1,
            background: '#222222',
            border: '1px solid #2e2e2e',
            color: '#ffffff',
            padding: '12px 48px 12px 14px',
            borderRadius: '12px',
            outline: 'none',
            fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: '"Inter", sans-serif'
          }}
          className="form-control-custom"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: `1px solid ${BORDER_COLOR}` }}>
      <span style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'rgba(200, 90, 73, 0.1)',
        color: ACCENT_COLOR,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <FontAwesomeIcon icon={icon} size="sm" />
      </span>
      <div>
        <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginTop: '2px' }}>{value || '—'}</div>
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

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '', email: '', phone: '', nationalId: ''
  });

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const showFeedback = (type, message) => setFeedback({ type, message });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hotel_admin_user');
      if (stored) setProfile(JSON.parse(stored));
    } catch { }

    dashboardApi.getMe()
      .then((data) => {
        setProfile(data);
        localStorage.setItem('hotel_admin_user', JSON.stringify(data));
        window.dispatchEvent(new Event('hotel_admin_user_updated'));
      })
      .catch(() => { })
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
      window.dispatchEvent(new Event('hotel_admin_user_updated'));
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
      window.dispatchEvent(new Event('hotel_admin_user_updated'));
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
      window.dispatchEvent(new Event('hotel_admin_user_updated'));
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', color: '#ffffff', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Dynamic Modal dark-styling helper */}
      <style>{`
        .modal-content {
          background-color: #161616 !important;
          border: 1px solid #222222 !important;
          color: #ffffff !important;
          border-radius: 20px !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.8) !important;
        }
        .modal-header {
          border-bottom: 1px solid #222222 !important;
          padding: 24px !important;
        }
        .modal-title {
          font-family: "Playfair Display", serif !important;
          font-weight: 700 !important;
          font-size: 20px !important;
        }
        .modal-footer {
          border-top: 1px solid #222222 !important;
          padding: 16px 24px !important;
        }
        .modal-header .btn-close {
          filter: invert(1) !important;
          opacity: 0.6;
        }
        .modal-header .btn-close:hover {
          opacity: 1;
        }
        .form-control-dark {
          background-color: #222222 !important;
          border: 1px solid #2e2e2e !important;
          color: #ffffff !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          font-size: 14px !important;
          outline: none !important;
          transition: border-color 0.2s !important;
        }
        .form-control-dark:focus {
          border-color: #c85a49 !important;
          box-shadow: none !important;
        }
        .form-control-dark[readonly], .form-control-dark:disabled {
          background-color: #1a1a1a !important;
          border-color: #2e2e2e !important;
          color: #9ca3af !important;
        }
      `}</style>

      {/* Profile Header */}
      <div style={{
        background: SECONDARY_DARK,
        borderRadius: '20px',
        border: `1px solid ${BORDER_COLOR}`,
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <span style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(200, 90, 73, 0.1)',
          color: ACCENT_COLOR,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '18px',
          border: '1px solid rgba(200, 90, 73, 0.2)'
        }}>
          <FontAwesomeIcon icon={faUser} />
        </span>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
            My Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, fontWeight: 300 }}>
            View and manage your account details and hotel activities.
          </p>
        </div>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      {loading && !profile ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "#9ca3af" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #2e2e2e", borderTopColor: "#c85a49", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ margin: 0, fontSize: "14px" }}>Loading your profile...</p>
        </div>
      ) : (
        <>
          {/* Main Photo Card */}
          <div style={{
            background: SECONDARY_DARK,
            borderRadius: '20px',
            border: `1px solid ${BORDER_COLOR}`,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${BORDER_COLOR}` }}
                  />
                ) : (
                  <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    background: '#222222',
                    border: `3px solid ${BORDER_COLOR}`,
                    color: ACCENT_COLOR,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '28px',
                    userSelect: 'none'
                  }}>
                    {initials}
                  </div>
                )}
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: 0, fontFamily: '"Playfair Display", serif' }}>
                    {profile?.fullName || 'Guest Account'}
                  </h2>
                  {profile?.vipLevel && (
                    <span style={{
                      ...vipLevelStyle(profile.vipLevel),
                      fontWeight: '700',
                      fontSize: '10px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {profile.vipLevel}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 300 }}>
                  <FontAwesomeIcon icon={faEnvelope} size="xs" style={{ color: ACCENT_COLOR }} />
                  {profile?.email || '—'}
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '18px' }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2e2e2e',
                      color: '#ffffff',
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT_COLOR; e.currentTarget.style.color = ACCENT_COLOR; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff'; }}
                  >
                    <FontAwesomeIcon icon={faCamera} style={{ marginRight: '8px' }} />
                    Change Photo
                  </button>
                  {profile?.avatar && (
                    <button
                      onClick={handleRemovePhoto}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 0'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div style={{
            background: SECONDARY_DARK,
            borderRadius: '20px',
            border: `1px solid ${BORDER_COLOR}`,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '16px', marginBottom: '8px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 300 }}>
                  Your registered contact details and identity information.
                </p>
              </div>
              <button
                onClick={openEdit}
                style={{
                  background: 'transparent',
                  border: '1px solid #2e2e2e',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT_COLOR; e.currentTarget.style.color = ACCENT_COLOR; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff'; }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                Edit
              </button>
            </div>
            <Row>
              <Col md={6}>
                <InfoRow icon={faUser} label="Full Name" value={profile?.fullName} />
                <InfoRow icon={faEnvelope} label="Email Address" value={profile?.email} />
                <InfoRow icon={faPhone} label="Phone Number" value={profile?.phone} />
              </Col>
              <Col md={6}>
                <InfoRow icon={faBriefcase} label="National ID / Passport" value={profile?.nationalId} />
                <InfoRow icon={faBuilding} label="VIP Account Class" value={profile?.vipLevel} />
              </Col>
            </Row>
          </div>

          {/* Security & Password Card */}
          <div style={{
            background: SECONDARY_DARK,
            borderRadius: '20px',
            border: `1px solid ${BORDER_COLOR}`,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
              Security & Privacy
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px', fontWeight: 300 }}>
              Manage password credentials and account security settings.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '16px 0', borderBottom: `1px solid ${BORDER_COLOR}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(200, 90, 73, 0.1)',
                  color: ACCENT_COLOR,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Password Authentication</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 300, marginTop: '2px' }}>
                    {profile?.passwordUpdatedAt ? (
                      `Last updated ${formatDisplayDate(profile.passwordUpdatedAt, { month: 'long', year: 'numeric' })}.`
                    ) : (
                      'We recommend updating your password periodically to keep your reservation account secure.'
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setPasswordForm({ current: '', next: '', confirm: '' }); setPasswordError(''); setPasswordModal(true); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #2e2e2e',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT_COLOR; e.currentTarget.style.color = ACCENT_COLOR; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff'; }}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Bookings Table Block */}
          <div style={{
            background: SECONDARY_DARK,
            borderRadius: '20px',
            border: `1px solid ${BORDER_COLOR}`,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '16px', marginBottom: '24px' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(200, 90, 73, 0.1)',
                color: ACCENT_COLOR,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FontAwesomeIcon icon={faCalendarCheck} />
              </span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0, fontFamily: '"Playfair Display", serif' }}>
                  My Bookings
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 300 }}>
                  History of room reservations and stay status.
                </p>
              </div>
            </div>

            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #2e2e2e', borderTopColor: ACCENT_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <span style={{ fontSize: '13px' }}>Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: '13px', fontWeight: 300 }}>No bookings found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER_COLOR}`, background: '#1a1a1a' }}>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Booking ID</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Room</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Check-in</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Check-out</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const id = b?._id || b?.id || '';
                      return (
                        <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af', fontFamily: 'monospace' }}>
                            #{id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>
                            Room #{b?.roomId?.roomNumber || b?.roomNumber || 'N/A'}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#ffffff' }}>{toDateInput(b.checkInDate)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#ffffff' }}>{toDateInput(b.checkOutDate)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <StatusPill status={b.status} />
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: ACCENT_COLOR, fontWeight: 700 }}>
                            ${Number(b.totalPrice || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reviews List Block */}
          <div style={{
            background: SECONDARY_DARK,
            borderRadius: '20px',
            border: `1px solid ${BORDER_COLOR}`,
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '16px', marginBottom: '24px' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(200, 90, 73, 0.1)',
                color: ACCENT_COLOR,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FontAwesomeIcon icon={faStar} />
              </span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0, fontFamily: '"Playfair Display", serif' }}>
                  My Reviews
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 300 }}>
                  Feedback and ratings you've submitted.
                </p>
              </div>
            </div>

            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #2e2e2e', borderTopColor: ACCENT_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <span style={{ fontSize: '13px' }}>Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: '13px', fontWeight: 300 }}>No reviews left yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((r) => {
                  const id = r?._id || r?.id || '';
                  return (
                    <div
                      key={id}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: '#1c1c1c',
                        border: `1px solid ${BORDER_COLOR}`
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
                          {r?.roomId?.roomNumber ? `Room #${r.roomId.roomNumber}` : r?.title || 'Luxury Room Review'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              size="xs"
                              style={{ color: i < (r.rating || 0) ? '#f59e0b' : '#2e2e2e' }}
                            />
                          ))}
                          <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, marginLeft: '6px' }}>{r.rating || 0}/5</span>
                        </div>
                      </div>
                      {r.comment && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: '#d1d5db', lineHeight: 1.6, fontWeight: 300, fontStyle: 'italic' }}>
                          "{r.comment}"
                        </p>
                      )}
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {toDateInput(r.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)} centered size="lg">
        <Form onSubmit={handleSaveProfile}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '24px' }}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name <span style={{ color: ACCENT_COLOR }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Enter full name"
                  className="form-control-dark"
                />
              </Col>
              <Col md={6}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</Form.Label>
                <Form.Control
                  readOnly
                  value={editForm.email}
                  className="form-control-dark"
                />
              </Col>
              <Col md={6}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</Form.Label>
                <Form.Control
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="form-control-dark"
                />
              </Col>
              <Col md={12}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>National ID / Passport</Form.Label>
                <Form.Control
                  readOnly
                  value={editForm.nationalId}
                  className="form-control-dark"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setEditModal(false)}
              style={{ borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: '600' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: '20px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', background: ACCENT_COLOR, border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = ACCENT_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.background = ACCENT_COLOR}
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
          <Modal.Body style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              placeholder="Min 8 characters"
            />
            <PasswordField
              label="Confirm New Password"
              required
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Repeat new password"
            />
            {passwordError && (
              <div style={{ color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faCircleExclamation} />
                {passwordError}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setPasswordModal(false)}
              style={{ borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: '600' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: '20px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', background: ACCENT_COLOR, border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = ACCENT_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.background = ACCENT_COLOR}
            >
              {saving ? 'Saving...' : 'Change Password'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
