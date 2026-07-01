import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faIdCard,
  faLock,
  faPhone,
  faUser,
  faUserPen
} from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import { getClientUser, updateStoredClientUser } from '../services/auth.js';
import '../styles/clientPages.css';

const initialProfileForm = {
  fullName: '',
  phone: '',
  nationalId: ''
};

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

function ProfilePage() {
  const [profile, setProfile] = useState(getClientUser());
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;

    clientApi.getMe()
      .then((guest) => {
        if (!mounted) return;
        setProfile(guest);
        updateStoredClientUser(guest);
      })
      .catch((error) => {
        if (mounted) setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setProfileForm({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      nationalId: profile?.nationalId || ''
    });
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile?.fullName) return 'G';
    return profile.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  }, [profile?.fullName]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setSavingProfile(true);

    try {
      const updated = await clientApi.updateMe(profileForm);
      setProfile(updated);
      updateStoredClientUser(updated);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'warning', message: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);

    try {
      await clientApi.changePassword(passwordForm);
      setPasswordForm(initialPasswordForm);
      setFeedback({ type: 'success', message: 'Password changed successfully.' });
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faUser} /> Guest profile</span>
          <h1 className="client-title">Manage your guest account.</h1>
          <p className="client-subtitle">This is a client-only profile page. It is separate from the admin dashboard account.</p>
        </div>
      </section>

      <Container className="py-5">
        {feedback && (
          <div className={`client-alert client-alert-${feedback.type} mb-4`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading profile...</div>
        ) : (
          <Row className="g-4">
            <Col lg={4}>
              <Card className="client-dashboard-card h-100">
                <Card.Body className="p-4 text-center">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.fullName} className="client-profile-avatar mb-3" />
                  ) : (
                    <div className="client-profile-avatar client-profile-avatar-fallback mb-3">{initials}</div>
                  )}
                  <h2 className="h4 fw-bold mb-1">{profile?.fullName || 'Guest'}</h2>
                  <p className="text-muted mb-3">{profile?.email}</p>
                  <Badge bg="dark" className="px-3 py-2 rounded-pill">{profile?.vipLevel || 'Bronze'} guest</Badge>

                  <div className="client-profile-info mt-4 text-start">
                    <div><FontAwesomeIcon icon={faEnvelope} /><span>{profile?.email || '—'}</span></div>
                    <div><FontAwesomeIcon icon={faPhone} /><span>{profile?.phone || '—'}</span></div>
                    <div><FontAwesomeIcon icon={faIdCard} /><span>{profile?.nationalId || '—'}</span></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Row className="g-4">
                <Col md={12}>
                  <Card className="client-dashboard-card">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                        <div>
                          <h3 className="h5 fw-bold mb-1"><FontAwesomeIcon icon={faUserPen} className="me-2" /> Personal information</h3>
                          <p className="text-muted mb-0">Update your public guest information.</p>
                        </div>
                      </div>

                      <Form onSubmit={handleSaveProfile}>
                        <Row className="g-3">
                          <Col md={12}>
                            <Form.Label>Full name</Form.Label>
                            <Form.Control name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
                          </Col>
                          <Col md={6}>
                            <Form.Label>Phone</Form.Label>
                            <Form.Control name="phone" value={profileForm.phone} onChange={handleProfileChange} required />
                          </Col>
                          <Col md={6}>
                            <Form.Label>National ID</Form.Label>
                            <Form.Control name="nationalId" value={profileForm.nationalId} onChange={handleProfileChange} required />
                          </Col>
                        </Row>

                        <Button type="submit" variant="dark" className="mt-4 px-4" disabled={savingProfile}>
                          {savingProfile ? <Spinner size="sm" animation="border" /> : 'Save changes'}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={12}>
                  <Card className="client-dashboard-card">
                    <Card.Body className="p-4">
                      <h3 className="h5 fw-bold mb-1"><FontAwesomeIcon icon={faLock} className="me-2" /> Change password</h3>
                      <p className="text-muted mb-4">Keep your guest account secure.</p>

                      <Form onSubmit={handleChangePassword}>
                        <Row className="g-3">
                          <Col md={12}>
                            <Form.Label>Current password</Form.Label>
                            <Form.Control type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                          </Col>
                          <Col md={6}>
                            <Form.Label>New password</Form.Label>
                            <Form.Control type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength={6} required />
                          </Col>
                          <Col md={6}>
                            <Form.Label>Confirm password</Form.Label>
                            <Form.Control type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength={6} required />
                          </Col>
                        </Row>

                        <Button type="submit" variant="outline-dark" className="mt-4 px-4" disabled={savingPassword}>
                          {savingPassword ? <Spinner size="sm" animation="border" /> : 'Update password'}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default ProfilePage;
