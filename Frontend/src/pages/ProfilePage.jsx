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
import { useSearchParams } from 'react-router-dom';
import ProfileImageCropper from '../components/ProfileImageCropper.jsx';
import MyRoomsPage from './MyRoomsPage.jsx';
import MyBookingsPage from './MyBookingsPage.jsx';
import MyInvoicesPage from './MyInvoicesPage.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDisplayDate } from '../utils/date.js';
import { useTheme } from '../context/ThemeContext.jsx';

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
  const { colors } = useTheme();
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
        <div style={{ fontWeight: 600, color: colors.textPrimary, fontSize: '14px' }}>{meta.title}</div>
        <div style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: 300 }}>{feedback?.message}</div>
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
  const { colors } = useTheme();
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: colors.accent, marginLeft: '4px' }}>*</span>}
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
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            color: colors.textPrimary,
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
            color: colors.textSecondary,
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
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: `1px solid ${colors.borderCard}`, width: '100%', minWidth: 0 }}>
      <span style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'rgba(200, 90, 73, 0.1)',
        color: colors.accent,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <FontAwesomeIcon icon={icon} size="sm" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: '14.5px', fontWeight: '600', color: colors.textPrimary, marginTop: '2px', wordBreak: 'break-all', overflowWrap: 'break-word' }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { colors, isDark } = useTheme();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(queryTab);

  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab && qTab !== activeTab) {
      setActiveTab(qTab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '', email: '', phone: '', nationalId: ''
  });

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [photoCropModal, setPhotoCropModal] = useState(false);
  const [photoCropFile, setPhotoCropFile] = useState(null);

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

  const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    setSaving(true);
    try {
      const updated = await dashboardApi.updateProfileImage(formData);
      const merged = { ...profile, avatar: updated ? `${updated}?t=${Date.now()}` : null };
      setProfile(merged);
      localStorage.setItem('hotel_admin_user', JSON.stringify(merged));
      window.dispatchEvent(new Event('hotel_admin_user_updated'));
      showFeedback('success', 'Photo updated.');
    } catch (error) {
      showFeedback('danger', `Could not upload photo: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoCropFile(file);
    setPhotoCropModal(true);
  };

  const handleProfilePhotoCropConfirm = async (croppedFile) => {
    setPhotoCropModal(false);
    setPhotoCropFile(null);
    await uploadProfilePhoto(croppedFile);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', color: colors.textPrimary, fontFamily: '"Inter", sans-serif', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>

      {/* Dynamic Modal theme-styling helper */}
      <style>{`
        .modal-content {
          background-color: ${colors.bgCard} !important;
          border: 1px solid ${colors.borderCard} !important;
          color: ${colors.textPrimary} !important;
          border-radius: 20px !important;
          box-shadow: ${isDark ? '0 25px 50px rgba(0,0,0,0.8)' : '0 12px 40px rgba(0,0,0,0.1)'} !important;
        }
        .modal-header {
          border-bottom: 1px solid ${colors.borderCard} !important;
          padding: 24px !important;
        }
        .modal-title {
          font-family: "Playfair Display", serif !important;
          font-weight: 700 !important;
          font-size: 20px !important;
        }
        .modal-footer {
          border-top: 1px solid ${colors.borderCard} !important;
          padding: 16px 24px !important;
        }
        .modal-header .btn-close {
          filter: ${isDark ? 'invert(1)' : 'none'} !important;
          opacity: 0.6;
        }
        .modal-header .btn-close:hover {
          opacity: 1;
        }
        .form-control-dark {
          background-color: ${colors.inputBg} !important;
          border: 1px solid ${colors.inputBorder} !important;
          color: ${colors.textPrimary} !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          font-size: 14px !important;
          outline: none !important;
          transition: border-color 0.2s !important;
        }
        .form-control-dark:focus {
          border-color: ${colors.accent} !important;
          box-shadow: none !important;
        }
        .form-control-dark[readonly], .form-control-dark:disabled {
          background-color: ${colors.bgCardAlt} !important;
          border-color: ${colors.inputBorder} !important;
          color: ${colors.textSecondary} !important;
        }
        
        /* Darker shade thin scrollbar/slider for profile navigations */
        .no-scrollbar::-webkit-scrollbar {
          height: 5px !important;
          display: block !important;
        }
        .no-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? '#111111' : '#f5f3ef'} !important;
          border-radius: 99px !important;
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#333333' : '#c1b4ac'} !important;
          border-radius: 99px !important;
        }
        .no-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.accent} !important;
        }
        .no-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: ${isDark ? '#333333 #111111' : '#c1b4ac #f5f3ef'} !important;
          -webkit-overflow-scrolling: touch !important;
        }

        /* Premium Responsive Layout and Padding Helper */
        .profile-grid-container {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
          align-items: start;
          padding-top: 12px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 992px) {
          .profile-grid-container {
            grid-template-columns: 320px minmax(0, 1fr);
            gap: 32px;
          }
        }
        .profile-card-responsive {
          padding: 20px !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        @media (min-width: 768px) {
          .profile-card-responsive {
            padding: 32px !important;
          }
        }
        @media (max-width: 576px) {
          .booking-card-image {
            width: 100% !important;
            height: 180px !important;
          }
          .profile-grid-container {
            padding-left: 0px;
            padding-right: 0px;
          }
          .profile-card-responsive {
            padding: 16px !important;
          }
          .booking-card-content {
            padding: 16px !important;
          }
        }
      `}</style>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      {loading && !profile ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: colors.textSecondary }}>
          <div style={{ width: "36px", height: "36px", border: `3px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ margin: 0, fontSize: "14px" }}>Loading sanctuary details...</p>
        </div>
      ) : (
        <div className="profile-grid-container">

          {/* LEFT: Premium VIP Sidebar Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            <div style={{
              background: colors.bgCard,
              borderRadius: '20px',
              border: `1px solid ${colors.borderCard}`,
              padding: '32px 20px 24px',
              boxShadow: colors.shadow,
              textAlign: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              overflow: 'hidden',
              minWidth: 0,
              width: '100%'
            }}>

              {/* Overlapping Avatar Container */}
              <div style={{ position: 'relative', width: '108px', height: '108px', margin: '0 auto 20px', zIndex: 3 }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `4px solid ${colors.bgCard}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  background: colors.inputBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      fontWeight: 700,
                      fontSize: '32px',
                      color: colors.accent,
                      fontFamily: '"Playfair Display", serif'
                    }}>
                      {initials}
                    </div>
                  )}
                </div>

                {/* VIP Micro Badge */}
                {profile?.vipLevel && (
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    ...vipLevelStyle(profile.vipLevel),
                    fontSize: '9px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {profile.vipLevel}
                  </span>
                )}
              </div>

              {/* Name and Basic details */}
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 6px', fontFamily: '"Playfair Display", serif' }}>
                {profile?.fullName || 'Valued Guest'}
              </h2>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '24px', fontWeight: 300, wordBreak: 'break-all' }}>
                {profile?.email}
              </div>

              {/* Stats Highlights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', borderTop: `1px solid ${colors.borderCard}`, paddingTop: '20px' }}>
                <div style={{ background: colors.bgCardAlt, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.borderCard}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Stays</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: colors.accent }}>{bookings.length}</div>
                </div>
                <div style={{ background: colors.bgCardAlt, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.borderCard}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Reviews</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: colors.accent }}>{reviews.length}</div>
                </div>
              </div>

              {/* Photo Upload Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%',
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    color: colors.textPrimary,
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.textPrimary; }}
                >
                  <FontAwesomeIcon icon={faCamera} />
                  Change Image
                </button>
                {profile?.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '4px 0'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Remove Image
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT: Dynamic Tab Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>

            {/* Elegant Luxury Tabs Selector */}
            <div style={{
              display: 'flex',
              gap: '24px',
              borderBottom: `1px solid ${colors.borderCard}`,
              paddingBottom: '2px',
              marginBottom: '4px',
              overflowX: 'auto'
            }} className="no-scrollbar">
              {[
                { id: 'profile', label: 'Overview', badge: null },
                { id: 'rooms', label: 'My Rooms', badge: null },
                { id: 'bookings', label: 'Reservations', badge: bookings.length > 0 ? bookings.length : null },
                { id: 'invoices', label: 'My Invoices', badge: null },
                { id: 'reviews', label: 'Guestbook Reviews', badge: reviews.length > 0 ? reviews.length : null }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? `2.5px solid ${colors.accent}` : '2.5px solid transparent',
                      padding: '12px 6px',
                      color: isActive ? colors.textPrimary : colors.textMuted,
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '14.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      marginBottom: '-2px'
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = colors.textPrimary; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = colors.textMuted; }}
                  >
                    {tab.label}
                    {tab.badge !== null && (
                      <span style={{
                        fontSize: '10.5px',
                        background: isActive ? colors.accent : (isDark ? '#222222' : '#e5e7eb'),
                        color: isActive ? '#ffffff' : colors.textSecondary,
                        fontWeight: '700',
                        padding: '1.5px 6.5px',
                        borderRadius: '10px',
                        marginLeft: '2px'
                      }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS 1: Overview & Personal Details */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Personal Information */}
                <div style={{
                  background: colors.bgCard,
                  borderRadius: '20px',
                  border: `1px solid ${colors.borderCard}`,
                  boxShadow: colors.shadow
                }} className="profile-card-responsive">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${colors.borderCard}`, paddingBottom: '16px', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
                        Personal Information
                      </h3>
                      <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0, fontWeight: 300 }}>
                        Your registered contact details and identity information.
                      </p>
                    </div>
                    <button
                      onClick={openEdit}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '20px',
                        padding: '6px 16px',
                        color: colors.textPrimary,
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.textPrimary; }}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                      Edit Details
                    </button>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0 24px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <InfoRow icon={faUser} label="Full Name" value={profile?.fullName} />
                      <InfoRow icon={faEnvelope} label="Email Address" value={profile?.email} />
                      <InfoRow icon={faPhone} label="Phone Number" value={profile?.phone} />
                    </div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <InfoRow icon={faBriefcase} label="National ID / Passport" value={profile?.nationalId} />
                      <InfoRow icon={faBuilding} label="VIP Account Class" value={profile?.vipLevel} />
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div style={{
                  background: colors.bgCard,
                  borderRadius: '20px',
                  border: `1px solid ${colors.borderCard}`,
                  boxShadow: colors.shadow
                }} className="profile-card-responsive">
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
                    Security & Credentials
                  </h3>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 24px', fontWeight: 300 }}>
                    Manage login authentication methods and password credentials.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '16px 0', borderTop: `1px solid ${colors.borderCard}`, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                      <span style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(200, 90, 73, 0.1)',
                        color: colors.accent,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: '600', color: colors.textPrimary, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Password Authentication</div>
                        <div style={{ fontSize: '12.5px', color: colors.textSecondary, fontWeight: 300, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {profile?.passwordUpdatedAt ? (
                            `Last updated ${formatDisplayDate(profile.passwordUpdatedAt, { month: 'long', year: 'numeric' })}.`
                          ) : (
                            'We recommend updating your password periodically to keep your account secure.'
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPasswordForm({ current: '', next: '', confirm: '' }); setPasswordError(''); setPasswordModal(true); }}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '20px',
                        padding: '6px 16px',
                        color: colors.textPrimary,
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.textPrimary; }}
                    >
                      Change Password
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'rooms' && (
              <MyRoomsPage hideHeader={true} />
            )}

            {activeTab === 'bookings' && (
              <MyBookingsPage hideHeader={true} />
            )}

            {activeTab === 'invoices' && (
              <MyInvoicesPage hideHeader={true} />
            )}

            {/* TAB CONTENTS 3: Reviews Left in guestbook card style */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 4px', fontFamily: '"Playfair Display", serif' }}>
                    Guestbook Reviews
                  </h3>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0, fontWeight: 300 }}>
                    Your notes, feedback, and shared experience chronicles at Aethos.
                  </p>
                </div>

                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', background: colors.bgCard, borderRadius: '20px', border: `1px solid ${colors.borderCard}` }}>
                    <div style={{ width: '28px', height: '28px', border: `2px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <span style={{ fontSize: '13px', color: colors.textSecondary }}>Retrieving reviews...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', background: colors.bgCard, borderRadius: '20px', border: `1px solid ${colors.borderCard}` }}>
                    <FontAwesomeIcon icon={faStar} size="2x" style={{ color: colors.textMuted, marginBottom: '16px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, marginBottom: '6px' }}>No reviews left yet</h4>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '320px', margin: '0 auto' }}>
                      After concluding a stay, you can leave a review directly from your past reservations to catalog your feedback.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((r) => {
                      const id = r?._id || r?.id || '';
                      return (
                        <div
                          key={id}
                          style={{
                            padding: '24px',
                            borderRadius: '16px',
                            background: colors.bgCard,
                            border: `1px solid ${colors.borderCard}`,
                            boxShadow: colors.shadow
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                            <div>
                              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.accent, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                Verified Stay Review
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary, fontFamily: '"Playfair Display", serif' }}>
                                {r?.roomId?.roomNumber ? `Accomodation Room #${r.roomId.roomNumber}` : r?.title || 'Luxury Room Review'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${colors.borderCard}` }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <FontAwesomeIcon
                                  key={i}
                                  icon={faStar}
                                  size="xs"
                                  style={{ color: i < (r.rating || 0) ? '#f59e0b' : (isDark ? '#2e2e2e' : 'rgba(0,0,0,0.1)') }}
                                />
                              ))}
                              <span style={{ color: colors.textPrimary, fontSize: '12px', fontWeight: '700', marginLeft: '6px' }}>{r.rating || 0}.0</span>
                            </div>
                          </div>

                          {r.comment && (
                            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: colors.textPrimary, lineHeight: 1.6, fontWeight: 300, fontStyle: 'italic', opacity: 0.9 }}>
                              "{r.comment}"
                            </p>
                          )}
                          <div style={{ fontSize: '11px', color: colors.textMuted, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Chronicle Saved</span>
                            <span style={{ fontWeight: 500 }}>{toDateInput(r.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
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
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name <span style={{ color: colors.accent }}>*</span>
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
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</Form.Label>
                <Form.Control
                  readOnly
                  value={editForm.email}
                  className="form-control-dark"
                />
              </Col>
              <Col md={6}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</Form.Label>
                <Form.Control
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="form-control-dark"
                />
              </Col>
              <Col md={12}>
                <Form.Label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>National ID / Passport</Form.Label>
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
              style={{
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'transparent',
                borderColor: colors.borderCard,
                color: colors.textSecondary
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.textSecondary; e.currentTarget.style.color = colors.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderCard; e.currentTarget.style.color = colors.textSecondary; }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: '20px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', background: colors.accent, border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}
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
              style={{
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'transparent',
                borderColor: colors.borderCard,
                color: colors.textSecondary
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.textSecondary; e.currentTarget.style.color = colors.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderCard; e.currentTarget.style.color = colors.textSecondary; }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ borderRadius: '20px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', background: colors.accent, border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}
            >
              {saving ? 'Saving...' : 'Change Password'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ProfileImageCropper
        show={photoCropModal}
        file={photoCropFile}
        title="Adjust profile photo"
        confirmLabel="Save cropped photo"
        onCancel={() => { setPhotoCropModal(false); setPhotoCropFile(null); }}
        onConfirm={handleProfilePhotoCropConfirm}
      />
    </div>
  );
}

export default ProfilePage;
