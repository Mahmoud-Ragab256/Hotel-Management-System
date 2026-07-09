import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHotel,
  faKey,
  faLock,
  faPaperPlane,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

const initialForm = {
  email: '',
  resetCode: '',
  newPassword: '',
  confirmPassword: ''
};

function ResetPasswordPage({ accountType = 'guest' }) {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const isEmployee = accountType === 'employee';
  const backUrl = isEmployee ? '/dashboard/login' : '/login';
  const title = isEmployee ? 'Employee Password Reset' : 'Guest Password Reset';
  const subtitle = isEmployee
    ? 'Reset the password for your dashboard account.'
    : 'Reset the password for your guest account.';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (step === 1) return Boolean(form.email.trim());
    if (step === 2) return Boolean(form.email.trim() && form.resetCode.trim());
    return Boolean(form.email.trim() && form.newPassword.trim() && form.confirmPassword.trim());
  }, [form, loading, step]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const sendResetCode = async () => {
    if (isEmployee) {
      return dashboardApi.forgotEmployeePassword(form.email.trim());
    }
    return dashboardApi.forgotGuestPassword(form.email.trim());
  };

  const verifyResetCode = async () => {
    if (isEmployee) {
      return dashboardApi.verifyEmployeeResetCode(form.email.trim(), form.resetCode.trim());
    }
    return dashboardApi.verifyGuestResetCode(form.email.trim(), form.resetCode.trim());
  };

  const resetPassword = async () => {
    if (isEmployee) {
      return dashboardApi.resetEmployeePassword(form.email.trim(), form.newPassword);
    }
    return dashboardApi.resetGuestPassword(form.email.trim(), form.newPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (step === 3 && form.newPassword !== form.confirmPassword) {
      setFeedback({ type: 'warning', message: 'Passwords do not match.' });
      return;
    }

    if (step === 3 && form.newPassword.length < 6) {
      setFeedback({ type: 'warning', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      if (step === 1) {
        await sendResetCode();
        setStep(2);
        setFeedback({ type: 'success', message: 'Reset code sent. Check your email and enter the 6-digit code.' });
      } else if (step === 2) {
        await verifyResetCode();
        setStep(3);
        setFeedback({ type: 'success', message: 'Code verified. Enter your new password.' });
      } else {
        await resetPassword();
        setFeedback({ type: 'success', message: 'Password reset successfully. Redirecting to login...' });
        setTimeout(() => navigate(backUrl, { replace: true }), 900);
      }
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
            <Card className="border-0 shadow-lg login-card overflow-hidden">
              <Card.Body className="p-4 p-lg-5">
                <div className="text-center mb-4">
                  <span className="login-brand-icon d-inline-flex align-items-center justify-content-center rounded-4 mb-3">
                    <FontAwesomeIcon icon={faHotel} />
                  </span>
                  <h1 style={{ fontSize: '28px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: '0 0 8px' }}>{title}</h1>
                  <p className="text-muted mb-0" style={{ fontSize: '14px', fontWeight: '300' }}>{subtitle}</p>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                  {[1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className="rounded-pill"
                      style={{
                        width: item === step ? 34 : 22,
                        height: 6,
                        backgroundColor: item <= step ? '#c85a49' : '#2a2a2a',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
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
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder={isEmployee ? 'employee@example.com' : 'guest@example.com'}
                        autoComplete="email"
                        disabled={loading || step > 1}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  {step >= 2 && (
                    <Form.Group className="mb-3" controlId="resetCode">
                      <Form.Label className="fw-semibold">Reset code</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faKey} />
                        </InputGroup.Text>
                        <Form.Control
                          name="resetCode"
                          value={form.resetCode}
                          onChange={handleChange}
                          placeholder="Enter 6-digit code"
                          inputMode="numeric"
                          maxLength={6}
                          disabled={loading || step > 2}
                          required={step === 2}
                        />
                      </InputGroup>
                    </Form.Group>
                  )}

                  {step === 3 && (
                    <>
                      <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label className="fw-semibold">New password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faLock} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            disabled={loading}
                            required
                          />
                          <Button type="button" onClick={() => setShowPassword((current) => !current)} disabled={loading} style={{ borderLeft: 'none' }}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label className="fw-semibold">Confirm password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faLock} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            disabled={loading}
                            required
                          />
                          <Button type="button" onClick={() => setShowConfirmPassword((current) => !current)} disabled={loading} style={{ borderLeft: 'none' }}>
                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </>
                  )}

                  <Button type="submit" variant="dark" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2" disabled={!canSubmit}>
                    {loading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={step === 1 ? faPaperPlane : step === 2 ? faShieldHalved : faCheckCircle} />}
                    {loading ? 'Please wait...' : step === 1 ? 'Send reset code' : step === 2 ? 'Verify code' : 'Save new password'}
                  </Button>

                  <div className="text-center mt-3">
                    <Link to={backUrl} style={{ fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                      <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} xl={5} className="d-none d-lg-block">
            <div className="text-white ps-xl-5">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4 login-pill" style={{ fontSize: '13px', fontWeight: '500' }}>
                <FontAwesomeIcon icon={faShieldHalved} />
                Password recovery
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '700', fontFamily: '"Playfair Display", serif', lineHeight: '1.3', color: colors.textPrimary, marginBottom: '20px' }}>
                Simple screens for secure password recovery.
              </h2>
              <p className="lead text-white-75 mb-0" style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.6' }}>
                Enter your email address, receive and verify your private security code, then save your new credentials to resume your journey.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default ResetPasswordPage;
