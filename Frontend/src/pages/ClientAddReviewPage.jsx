import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import '../styles/clientPages.css';

function ClientAddReviewPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ bookingId: '', rating: '5', comment: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    clientApi.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((error) => setFeedback({ type: 'danger', message: getApiErrorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);

  const reviewableBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status !== 'Cancelled' && booking.roomId);
  }, [bookings]);

  const selectedBooking = reviewableBookings.find((booking) => (booking._id || booking.id) === form.bookingId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!selectedBooking?.roomId?._id) {
      setFeedback({ type: 'warning', message: 'Please choose a valid booking first.' });
      return;
    }

    setSaving(true);
    try {
      await clientApi.createReview({
        bookingId: selectedBooking._id || selectedBooking.id,
        roomId: selectedBooking.roomId._id,
        rating: Number(form.rating),
        comment: form.comment.trim()
      });
      navigate('/reviews', { replace: true });
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
          <span className="hero-kicker"><FontAwesomeIcon icon={faPenToSquare} /> Add review</span>
          <h1 className="client-title">Share your stay experience.</h1>
          <p className="client-subtitle">Adding a review is a protected action, so it appears only after guest login.</p>
        </div>
      </section>

      <Container className="py-5">
        {feedback && <div className={`client-alert client-alert-${feedback.type} mb-4`}>{feedback.message}</div>}

        {loading ? (
          <div className="loading-state">Loading your bookings...</div>
        ) : reviewableBookings.length === 0 ? (
          <div className="empty-state">
            <h3>No booking available for review</h3>
            <p>You need at least one booking before adding a review.</p>
            <Link to="/rooms" className="client-btn client-btn-dark">Book a Room</Link>
          </div>
        ) : (
          <Row className="justify-content-center">
            <Col lg={7}>
              <Card className="client-dashboard-card">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Booking</Form.Label>
                      <Form.Select value={form.bookingId} onChange={(event) => setForm((current) => ({ ...current, bookingId: event.target.value }))} required>
                        <option value="">Choose booking</option>
                        {reviewableBookings.map((booking) => (
                          <option key={booking._id || booking.id} value={booking._id || booking.id}>
                            Room #{booking.roomId?.roomNumber || '—'} — {booking.status}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <div className="review-rating-options">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            type="button"
                            key={value}
                            className={Number(form.rating) >= value ? 'active' : ''}
                            onClick={() => setForm((current) => ({ ...current, rating: String(value) }))}
                          >
                            <FontAwesomeIcon icon={faStar} />
                          </button>
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Comment</Form.Label>
                      <Form.Control as="textarea" rows={4} value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Write your review..." required />
                    </Form.Group>

                    <Button type="submit" variant="dark" disabled={saving}>
                      {saving ? <Spinner size="sm" animation="border" /> : 'Submit Review'}
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

export default ClientAddReviewPage;
