import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBellConcierge } from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import '../styles/clientPages.css';

function ClientServiceOrderPage() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ serviceId: '', bookingId: '', quantity: 1, notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    Promise.all([clientApi.getServices(), clientApi.getMyBookings()])
      .then(([servicesData, bookingsData]) => {
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      })
      .catch((error) => setFeedback({ type: 'danger', message: getApiErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = useMemo(() => bookings.filter((booking) => !['Cancelled', 'CheckedOut'].includes(booking.status)), [bookings]);
  const selectedService = services.find((service) => (service._id || service.id) === form.serviceId);
  const totalPrice = Number(selectedService?.price || 0) * Number(form.quantity || 1);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      await clientApi.createServiceOrder({
        serviceId: form.serviceId,
        bookingId: form.bookingId,
        quantity: Number(form.quantity),
        notes: form.notes
      });
      setFeedback({ type: 'success', message: 'Service order sent successfully.' });
      setForm({ serviceId: '', bookingId: '', quantity: 1, notes: '' });
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faBellConcierge} /> Order service</span>
          <h1 className="client-title">Request a hotel service.</h1>
          <p className="client-subtitle">Service ordering requires login and an active booking.</p>
        </div>
      </section>

      <Container className="py-5">
        {feedback && <div className={`client-alert client-alert-${feedback.type} mb-4`}>{feedback.message}</div>}

        {loading ? (
          <div className="loading-state">Loading services...</div>
        ) : activeBookings.length === 0 ? (
          <div className="empty-state">
            <h3>No active booking found</h3>
            <p>You need an active booking before ordering guest services.</p>
            <Link to="/rooms" className="client-btn client-btn-dark">Book a Room</Link>
          </div>
        ) : (
          <Row className="justify-content-center">
            <Col lg={7}>
              <Card className="client-dashboard-card">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Active booking</Form.Label>
                      <Form.Select name="bookingId" value={form.bookingId} onChange={handleChange} required>
                        <option value="">Choose booking</option>
                        {activeBookings.map((booking) => (
                          <option key={booking._id || booking.id} value={booking._id || booking.id}>Room #{booking.roomId?.roomNumber || '—'} — {booking.status}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Service</Form.Label>
                      <Form.Select name="serviceId" value={form.serviceId} onChange={handleChange} required>
                        <option value="">Choose service</option>
                        {services.map((service) => (
                          <option key={service._id || service.id} value={service._id || service.id}>{service.name} — ${service.price ?? 0}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes for the hotel team..." />
                    </Form.Group>

                    {selectedService && <div className="service-total-box mb-4">Total: <strong>${totalPrice}</strong></div>}

                    <Button type="submit" variant="dark" disabled={saving}>
                      {saving ? <Spinner size="sm" animation="border" /> : 'Submit Service Order'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default ClientServiceOrderPage;
