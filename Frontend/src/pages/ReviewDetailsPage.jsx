import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

function ReviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => setFeedback({ type, message });

  useEffect(() => {
    const loadReviewDetails = async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getReviewById(id);
        setReview(data);
      } catch (error) {
        showFeedback('danger', `Could not read review details: ${getApiErrorMessage(error)}`);
      } finally {
        setLoading(false);
      }
    };
    loadReviewDetails();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setSaving(true);
    try {
      if (status === 'Approved') {
        await dashboardApi.approveReview(id);
      } else {
        await dashboardApi.updateReview(id, { status: 'Rejected' });
      }
      navigate('/dashboard/reviews');
    } catch (error) {
      showFeedback('danger', `Could not update review status: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="text-warning d-flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <FontAwesomeIcon
            key={index}
            icon={faStar}
            className={index < rating ? "text-warning text-lg" : "text-black-50 opacity-25 text-lg"}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending') return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-4">
        {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}
        <Button variant="link" onClick={() => navigate('/dashboard/reviews')} className="p-0 text-decoration-none">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4 max-w-3xl mx-auto p-2">
      <div className="d-flex justify-content-between align-items-center">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard/reviews')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Queue
        </Button>
        <Badge bg={getStatusBadge(review.status)} className="px-3 py-2 fs-7">{review.status} Review</Badge>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 md:p-5">
          <div className="d-flex align-items-center gap-3 border-b pb-4 mb-4">
            <span className="bg-secondary-subtle text-secondary rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
              <FontAwesomeIcon icon={faUser} className="fs-4" />
            </span>
            <div>
              <h2 className="h4 fw-bold mb-1">{review.guestId?.fullName || 'Anonymous Guest'}</h2>
              <p className="text-muted small mb-0">{review.guestId?.email || '-'}</p>
            </div>
          </div>

          <Row className="g-3 mb-4">
            <Col xs={6}>
              <div className="p-3 bg-light rounded-3">
                <span className="text-muted text-uppercase fw-bold small d-block mb-1" style={{ fontSize: '10px', tracking: 'wider' }}>Assigned Space</span>
                <span className="fw-bold text-dark">Room {review.roomId?.roomNumber || 'N/A'}</span>
              </div>
            </Col>
            <Col xs={6}>
              <div className="p-3 bg-light rounded-3">
                <span className="text-muted text-uppercase fw-bold small d-block mb-1" style={{ fontSize: '10px', tracking: 'wider' }}>Booking Reference</span>
                <span className="fw-bold font-mono text-dark">#{review.bookingId?.substring(review.bookingId.length - 8).toUpperCase() || 'N/A'}</span>
              </div>
            </Col>
          </Row>

          <div className="mb-4">
            <span className="text-muted text-uppercase fw-bold small d-block mb-2" style={{ fontSize: '10px', tracking: 'wider' }}>Score Rating</span>
            {renderStars(review.rating)}
          </div>

          <div className="mb-4">
            <span className="text-muted text-uppercase fw-bold small d-block mb-2" style={{ fontSize: '10px', tracking: 'wider' }}>Written Testimony</span>
            <div className="p-4 bg-light rounded-3 border border-light-subtle text-secondary shadow-inner" style={{ lineHeight: '1.6' }}>
              {review.comment || <span className="text-muted italic">The guest did not submit a written statement.</span>}
            </div>
          </div>

          {review.images && review.images.length > 0 && (
            <div>
              <span className="text-muted text-uppercase fw-bold small d-block mb-3" style={{ fontSize: '10px', tracking: 'wider' }}>Submitted Media</span>
              <div className="d-flex flex-wrap gap-2">
                {review.images.map((img, idx) => (
                  <a href={img} target="_blank" rel="noreferrer" key={idx}>
                    <img src={img} alt="" className="rounded-3 border img-thumbnail object-cover" style={{ width: '96px', height: '96px' }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card.Body>

        {review.status === 'Pending' && (
          <Card.Footer className="bg-light border-0 p-4 d-flex justify-content-end gap-2">
            <Button variant="outline-danger" className="px-4 fw-bold" disabled={saving} onClick={() => handleStatusUpdate('Rejected')}>
              Reject Feedback
            </Button>
            <Button variant="primary" className="px-4 fw-bold" disabled={saving} onClick={() => handleStatusUpdate('Approved')}>
              Approve Feedback
            </Button>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}

export default ReviewDetailsPage;