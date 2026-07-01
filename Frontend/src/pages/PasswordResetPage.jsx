import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCheckCircle,
  faEnvelope,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faShieldHalved,
  faUser,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { clientApi, dashboardApi, getApiErrorMessage } from '../services/api.js';
import '../styles/clientPages.css';

const resetConfig = {
  guest: {
    title: 'Guest Password Recovery',
    subtitle: 'Recover access to your guest account',
    loginPath: '/login',
    forgotPath: '/forgot-password',
    codePath: '/reset-code',
    passwordPath: '/reset-password',
    api: clientApi,
    icon: faUser,
    accent: 'Guest account'
  },
  employee: {
    title: 'Employee Password Recovery',
    subtitle: 'Recover access to the hotel dashboard',
    loginPath: '/dashboard/login',
    forgotPath: '/dashboard/forgot-password',
    codePath: '/dashboard/reset-code',
    passwordPath: '/dashboard/reset-password',
    api: dashboardApi,
    icon: faUserTie,
    accent: 'Employee account'
  }
};

const stepCopy = {
  email: {
    label: 'Step 1 of 3',
    heading: 'Enter your email',
    text: 'We will send a six-digit reset code to the registered email address.',
    action: 'Send reset code'
  },
  code: {
    label: 'Step 2 of 3',
    heading: 'Verify reset code',
    text: 'Enter the six-digit code sent to your email. The code expires after 10 minutes.',
    action: 'Verify code'
  },
  password: {
    label: 'Step 3 of 3',
    heading: 'Create a new password',
    text: 'Choose a strong password and use it next time you sign in.',
    action: 'Reset password'
  }
};

function PasswordResetPage({ accountType = 'guest', step = 'email' }) {
  const config = resetConfig[accountType] || resetConfig.guest;
  const copy = stepCopy[step] || stepCopy.email;
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (step === 'email') return Boolean(email.trim());
    if (step === 'code') return Boolean(email.trim() && resetCode.trim());
    return Boolean(email.trim() && newPassword.trim() && confirmPassword.trim());
  }, [confirmPassword, email, loading, newPassword, resetCode, step]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!email.trim()) {
      setFeedback({ type: 'warning', message: 'Please enter your email address.' });
      return;
    }

    if (step === 'code' && !resetCode.trim()) {
      setFeedback({ type: 'warning', message: 'Please enter the reset code.' });
      return;
    }

    if (step === 'password') {
      if (!newPassword.trim() || !confirmPassword.trim()) {
        setFeedback({ type: 'warning', message: 'Please enter and confirm your new password.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'warning', message: 'New password and confirmation do not match.' });
        return;
      }
      if (newPassword.length < 6) {
        setFeedback({ type: 'warning', message: 'Password must be at least 6 characters.' });
        return;
      }
    }

    setLoading(true);
    try {
      if (step === 'email') {
        await config.api.forgotPassword({ email: email.trim() });
        navigate(config.codePath, { state: { email: email.trim() } });
        return;
      }

      if (step === 'code') {
        await config.api.verifyResetCode({ email: email.trim(), resetCode: resetCode.trim() });
        navigate(config.passwordPath, { state: { email: email.trim() } });
        return;
      }

      await config.api.resetPassword({ email: email.trim(), newPassword });
      setFeedback({ type: 'success', message: 'Password reset successfully. You can login now.' });
      setTimeout(() => navigate(config.loginPath, { replace: true }), 900);
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center align-items-center g-4">
          <Col lg={5} xl={4}>
            <Card className="border-0 shadow-lg login-card reset-card overflow-hidden">
              <Card.Body className="p-4 p-lg-5">
                <div className="text-center mb-4">
                  <span className="login-brand-icon d-inline-flex align-items-center justify-content-center rounded-4 mb-3">
                    <FontAwesomeIcon icon={step === 'password' ? faLock : step === 'code' ? faKey : faEnvelope} />
                  </span>
                  <div className="reset-step-label mb-2">{copy.label}</div>
                  <h1 className="h3 fw-bold mb-1">{copy.heading}</h1>
                  <p className="text-muted mb-0">{copy.text}</p>
                </div>

                <div className="reset-progress mb-4" aria-hidden="true">
                  <span className={step === 'email' || step === 'code' || step === 'password' ? 'active' : ''} />
                  <span className={step === 'code' || step === 'password' ? 'active' : ''} />
                  <span className={step === 'password' ? 'active' : ''} />
                </div>

                {feedback && (
                  <div className="mb-3">
                    <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="resetEmail">
                    <Form.Label className="fw-semibold">Email address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </InputGroup>
                  </Form.Group>

                  {step === 'code' && (
                    <Form.Group className="mb-4" controlId="resetCode">
                      <Form.Label className="fw-semibold">Reset code</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light">
                          <FontAwesomeIcon icon={faKey} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          value={resetCode}
                          onChange={(event) => setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          autoComplete="one-time-code"
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                  )}

                  {step === 'password' && (
                    <>
                      <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label className="fw-semibold">New password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light">
                            <FontAwesomeIcon icon={faLock} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="light"
                            className="border"
                            onClick={() => setShowPassword((current) => !current)}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label className="fw-semibold">Confirm password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            disabled={loading}
                          />
                        </InputGroup>
                      </Form.Group>
                    </>
                  )}

                  <Button type="submit" variant="dark" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2" disabled={!canSubmit}>
                    {loading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faArrowRight} />}
                    {loading ? 'Please wait...' : copy.action}
                  </Button>

                  <div className="text-center mt-3">
                    <Link to={config.loginPath}>Back to login</Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} xl={5} className="d-none d-lg-block">
            <div className="text-white ps-xl-5">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4 login-pill">
                <FontAwesomeIcon icon={faShieldHalved} />
                Secure password reset
              </div>
              <h2 className="display-6 fw-bold mb-3">{config.title}</h2>
              <p className="lead text-white-75 mb-4">{config.subtitle}</p>
              <div className="d-flex align-items-center gap-3">
                <span className="login-feature-icon rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={config.icon} />
                </span>
                <div>
                  <div className="fw-semibold">{config.accent}</div>
                  <small className="text-white-75">Reset code verification is connected to the existing backend endpoint.</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default PasswordResetPage;
