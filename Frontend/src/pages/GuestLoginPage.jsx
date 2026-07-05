import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightToBracket,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHotel,
  faLock,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { saveAuthSession } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

const initialForm = {
  email: '',
  password: ''
};

function GuestLoginPage() {
  const { colors, isDark } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/rooms';

  const canSubmit = useMemo(() => {
    return form.email.trim() && form.password.trim() && !loading;
  }, [form, loading]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.email.trim() || !form.password.trim()) {
      setFeedback({ type: 'warning', message: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    try {
      const session = await dashboardApi.guestLogin({
        email: form.email.trim(),
        password: form.password
      });

      saveAuthSession({ token: session.token, user: session.user });
      navigate(redirectTo, { replace: true });
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
                  <h1 style={{ fontSize: '28px', fontWeight: '700', fontFamily: '"Playfair Display", serif', color: colors.textPrimary, margin: '0 0 8px' }}>Guest Login</h1>
                  <p className="text-muted mb-0" style={{ fontSize: '14px', fontWeight: '300' }}>Sign in to manage your stay</p>
                </div>

                {feedback && (
                  <div className="mb-3">
                    <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
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
                        placeholder="guest@example.com"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="loginPassword">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faLock} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={loading}
                        style={{ borderLeft: 'none' }}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="text-end mb-4">
                    <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" variant="dark" size="lg" className="w-100 d-flex align-items-center justify-content-center gap-2" disabled={!canSubmit}>
                    {loading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faArrowRightToBracket} />}
                    {loading ? 'Signing in...' : 'Login'}
                  </Button>

                  <div className="text-center mt-3" style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ fontWeight: '500', textDecoration: 'none' }}>
                      Sign Up
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} xl={5} className="d-none d-lg-block">
            <div className="text-white ps-xl-5">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4 login-pill" style={{ fontSize: '13px', fontWeight: '500' }}>
                <FontAwesomeIcon icon={faHotel} />
                Portal Access
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '700', fontFamily: '"Playfair Display", serif', lineHeight: '1.3', color: colors.textPrimary, marginBottom: '20px' }}>
                Welcome to your Guest Portal
              </h2>
              <p className="lead text-white-75 mb-4" style={{ fontSize: '15px', fontWeight: '300', lineHeight: '1.6' }}>
                Log in to view your bookings, invoices, request room services, and manage your luxury stay effortlessly.
              </p>
              <div className="d-flex align-items-center gap-3">
                <span className="login-feature-icon rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '15px' }}>Guest access only</div>
                  <small className="text-white-75" style={{ fontSize: '13px', fontWeight: '300' }}>Use your personal guest account info.</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default GuestLoginPage;