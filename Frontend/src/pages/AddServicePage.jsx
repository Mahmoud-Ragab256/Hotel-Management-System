import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faBellConcierge } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const serviceCategories = ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];

function AddServicePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'RoomService',
    price: '',
    maxCapacity: 1,
    isAvailable: true
  });

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        maxCapacity: Number(form.maxCapacity),
        isAvailable: form.isAvailable,
        images: []
      };

      await dashboardApi.createService(payload);
      showFeedback('success', 'Service created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard/services');
      }, 2000);
    } catch (error) {
      showFeedback('danger', `Could not create service: ${getApiErrorMessage(error)}`);
      setSaving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header Row */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Button variant="link" className="text-decoration-none p-0 mb-2 text-muted sm fw-semibold" onClick={() => navigate('/services')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Services
          </Button>
          <h1 className="h2 fw-bold mb-1">Add New Service</h1>
          <p className="text-muted mb-0">Configure a new operational service for hotel guests.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="bg-white" onClick={() => navigate('/dashboard/services')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save Service'}
          </Button>
        </div>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4">

          {/* Card 1: Basic Details */}
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 p-4 pb-0">
              <h2 className="h5 fw-bold mb-0">Basic Details</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                {/* Service Name */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Service Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g., Premium Spa Wellness Package"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                {/* Category */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Category</Form.Label>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {serviceCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Base Price */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Base Price (USD)</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$ 0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Card 2: Operational Info */}
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 p-4 pb-0">
              <h2 className="h5 fw-bold mb-0">Operational Info</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4 align-items-center">
                {/* Max Capacity */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Max Capacity per Order</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      value={form.maxCapacity}
                      onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      Limits the number of people/items in a single request.
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Service Status Switch */}
                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold mb-0">Service Status</div>
                      <small className="text-muted">Toggle availability on the guest portal</small>
                    </div>
                    <Form.Check
                      type="switch"
                      id="service-status-switch"
                      label={form.isAvailable ? "Available" : "Unavailable"}
                      className="fw-semibold fs-5"
                      checked={form.isAvailable}
                      onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Bottom Actions Row */}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="outline-secondary" className="bg-white" onClick={() => navigate('/dashboard/services')} disabled={saving}>
              Discard Draft
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save Service'
              )}
            </Button>
          </div>

        </div>
      </Form>
    </div>
  );
}

export default AddServicePage;