import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner
} from 'react-bootstrap';

import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faHotel,
  faIdCard,
  faLock,
  faPhone,
  faUser,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { saveAuthSession } from '../services/auth.js';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  nationalId: '',
  password: '',
  confirmPassword: ''
};

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.nationalId.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      !loading
    );
  }, [form, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedback(null);

    if (form.password !== form.confirmPassword) {
      setFeedback({
        type: 'warning',
        message: 'Passwords do not match.'
      });
      return;
    }

    setLoading(true);

    try {
      const session = await dashboardApi.guestRegister({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        nationalId: form.nationalId
      });
      

      saveAuthSession({
        token: session.token,
        user: session.user
      });

      navigate('/login');
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: getApiErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={6}>
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-lg-5">

                <div className="text-center mb-4">
                  <span className="login-brand-icon d-inline-flex align-items-center justify-content-center rounded-4 mb-3">
                    <FontAwesomeIcon icon={faHotel} />
                  </span>

                  <h2 className="fw-bold">Guest Sign Up</h2>

                  <p className="text-muted">
                    Create your hotel account
                  </p>
                </div>

                {feedback && (
                  <FeedbackCard
                    feedback={feedback}
                    onClose={() => setFeedback(null)}
                  />
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
  <Form.Label>Full Name</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faUser} />
    </InputGroup.Text>
    <Form.Control
      name="fullName"
      value={form.fullName}
      onChange={handleChange}
      placeholder="Enter full name"
    />
  </InputGroup>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Email</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faEnvelope} />
    </InputGroup.Text>
    <Form.Control
      type="email"
      name="email"
      value={form.email}
      onChange={handleChange}
      placeholder="Enter email"
    />
  </InputGroup>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Phone</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faPhone} />
    </InputGroup.Text>
    <Form.Control
      name="phone"
      value={form.phone}
      onChange={handleChange}
      placeholder="Enter phone"
    />
  </InputGroup>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>National ID</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faIdCard} />
    </InputGroup.Text>
    <Form.Control
      name="nationalId"
      value={form.nationalId}
      onChange={handleChange}
      placeholder="Enter National ID"
    />
  </InputGroup>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faLock} />
    </InputGroup.Text>

    <Form.Control
      type={showPassword ? 'text' : 'password'}
      name="password"
      value={form.password}
      onChange={handleChange}
      placeholder="Password"
    />

    <Button
      type="button"
      variant="light"
      onClick={() => setShowPassword(!showPassword)}
    >
      <FontAwesomeIcon
        icon={showPassword ? faEyeSlash : faEye}
      />
    </Button>
  </InputGroup>
</Form.Group>

<Form.Group className="mb-4">
  <Form.Label>Confirm Password</Form.Label>
  <InputGroup>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faLock} />
    </InputGroup.Text>

    <Form.Control
      type={showConfirmPassword ? 'text' : 'password'}
      name="confirmPassword"
      value={form.confirmPassword}
      onChange={handleChange}
      placeholder="Confirm Password"
    />

    <Button
      type="button"
      variant="light"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      <FontAwesomeIcon
        icon={showConfirmPassword ? faEyeSlash : faEye}
      />
    </Button>
  </InputGroup>
</Form.Group>

<Button
  type="submit"
  className="w-100"
  variant="dark"
  disabled={!canSubmit}
>
  {loading ? (
    <Spinner animation="border" size="sm" />
  ) : (
    <>
      <FontAwesomeIcon
        icon={faUserPlus}
        className="me-2"
      />
      Sign Up
    </>
  )}
</Button>

<div className="text-center mt-3">
  Already have an account?{' '}
  <Link to="/login">
    Login
  </Link>
</div>

</Form>

</Card.Body>
</Card>
</Col>
</Row>
</Container>
</main>
);
}

export default SignupPage;