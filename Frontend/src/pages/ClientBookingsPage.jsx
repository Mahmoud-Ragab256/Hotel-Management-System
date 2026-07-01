import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Modal, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faHotel, faXmark } from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/date.js';
import '../styles/clientPages.css';

const statusVariant = (status = '') => {
  if (['Confirmed', 'CheckedIn'].includes(status)) return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'CheckedOut') return 'info';
  if (status === 'Cancelled') return 'danger';
  return 'secondary';
};

function ClientBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await clientApi.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const activeCount = useMemo(() => bookings.filter((booking) => !['Cancelled', 'CheckedOut'].includes(booking.status)).length, [bookings]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setFeedback(null);
    try {
      await clientApi.cancelBooking(cancelTarget._id || cancelTarget.id, 'Cancelled by guest');
      setCancelTarget(null);
      setFeedback({ type: 'success', message: 'Booking cancelled successfully.' });
      await loadBookings();
    } catch (error) {
      setFeedback({ type: 'danger', message: getApiErrorMessage(error) });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faCalendarCheck} /> My bookings</span>
          <h1 className="client-title">Your stays in one clear place.</h1>
          <p className="client-subtitle">This page is protected. Guests can browse rooms without login, but booking history needs a guest account.</p>
        </div>
      </section>

      <Container className="py-5">
        {feedback && <div className={`client-alert client-alert-${feedback.type} mb-4`}>{feedback.message}</div>}

        <div className="client-summary-grid mb-4">
          <Card className="client-dashboard-card"><Card.Body><div className="small-muted">Total bookings</div><h2>{bookings.length}</h2></Card.Body></Card>
          <Card className="client-dashboard-card"><Card.Body><div className="small-muted">Active bookings</div><h2>{activeCount}</h2></Card.Body></Card>
          <Card className="client-dashboard-card"><Card.Body><div className="small-muted">Next action</div><Link to="/rooms" className="client-inline-link">Book another room</Link></Card.Body></Card>
        </div>

        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faHotel} className="mb-3" size="2x" />
            <h3>No bookings yet</h3>
            <p>Browse available rooms and confirm your first stay.</p>
            <Link to="/rooms" className="client-btn client-btn-dark">Browse Rooms</Link>
          </div>
        ) : (
          <Row className="g-4">
            {bookings.map((booking) => {
              const room = booking.roomId || {};
              const bookingId = booking._id || booking.id;
              const canCancel = !['Cancelled', 'CheckedIn', 'CheckedOut'].includes(booking.status);

              return (
                <Col lg={6} key={bookingId}>
                  <Card className="client-dashboard-card h-100">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <h3 className="h5 fw-bold mb-1">Room #{room.roomNumber || '—'}</h3>
                          <div className="text-muted small">Booking ID: {bookingId}</div>
                        </div>
                        <Badge bg={statusVariant(booking.status)}>{booking.status}</Badge>
                      </div>

                      <div className="booking-meta-grid">
                        <div><span>Check-in</span><strong>{formatDate(booking.checkInDate)}</strong></div>
                        <div><span>Check-out</span><strong>{formatDate(booking.checkOutDate)}</strong></div>
                        <div><span>Total</span><strong>${booking.totalPrice ?? 0}</strong></div>
                        <div><span>Payment</span><strong>{booking.paymentStatus || 'Pending'}</strong></div>
                      </div>

                      {booking.specialRequests && <p className="booking-note mt-3">{booking.specialRequests}</p>}

                      <div className="d-flex gap-2 mt-4 flex-wrap">
                        {room._id && <Link to={`/rooms/${room._id}`} className="client-btn client-btn-outline client-btn-sm">Room details</Link>}
                        {canCancel && (
                          <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => setCancelTarget(booking)}>
                            <FontAwesomeIcon icon={faXmark} className="me-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      <Modal show={Boolean(cancelTarget)} onHide={() => setCancelTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Cancel booking</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to cancel this booking?</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setCancelTarget(null)}>Keep booking</Button>
          <Button variant="danger" onClick={handleCancel} disabled={cancelling}>{cancelling ? <Spinner size="sm" animation="border" /> : 'Cancel booking'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ClientBookingsPage;
