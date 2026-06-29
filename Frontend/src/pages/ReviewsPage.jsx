import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEye, faRefresh, faStar, faXmark, faComments } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getAllReviews();
      setReviews(data);
    } catch (error) {
      showFeedback('danger', `Could not read reviews: ${getApiErrorMessage(error)}`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id, event) => {
    event.stopPropagation();
    try {
      await dashboardApi.approveReview(id);
      showFeedback('success', 'Review approved successfully.');
      await loadReviews();
    } catch (error) {
      showFeedback('danger', `Could not approve review: ${getApiErrorMessage(error)}`);
    }
  };

  const handleReject = async (id, event) => {
    event.stopPropagation();
    try {
      await dashboardApi.updateReview(id, { status: 'Rejected' });
      showFeedback('success', 'Review rejected successfully.');
      await loadReviews();
    } catch (error) {
      showFeedback('danger', `Could not reject review: ${getApiErrorMessage(error)}`);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
      const matchesRating = ratingFilter === 'All' || review.rating === parseInt(ratingFilter);
      return matchesStatus && matchesRating;
    });
  }, [reviews, statusFilter, ratingFilter]);

  const counts = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'Pending').length,
    flagged: reviews.filter((r) => r.rating <= 2).length
  }), [reviews]);

  const renderStars = (rating) => {
    return (
      <div className="text-warning d-flex justify-content-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <FontAwesomeIcon
            key={index}
            icon={faStar}
            className={index < rating ? "text-warning" : "text-black-50 opacity-25"}
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

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <FontAwesomeIcon icon={faComments} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Review Moderation Queue</h1>
                  <p className="text-muted mb-0">Monitor and manage guest feedback across all active properties.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              <Button variant="outline-secondary" onClick={loadReviews} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className="me-2" />Refresh Queue
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Row className="g-3">
        <Col md={6}>
          <StatCard title="Pending Approval" value={counts.pending} description="Requires moderation" icon={faComments} variant="warning" />
        </Col>
        <Col md={6}>
          <StatCard title="Flagged Reviews" value={counts.flagged} description="Low score warning" icon={faComments} variant="danger" />
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Review Records</h2>
              <p className="text-muted mb-0">Filter and moderate submitted hotel community reviews.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                    <option value="All">All Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-center admin-table-centered">
              <thead className="table-light">
                <tr>
                  <th>Review ID</th>
                  <th>Guest Details</th>
                  <th>Room Details</th>
                  <th>Rating</th>
                  <th>Feedback Comment</th>
                  <th>Media</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="8" className="py-4"><Spinner size="sm" className="me-2" />Loading reviews...</td></tr>}
                {!loading && filteredReviews.length === 0 && <tr><td colSpan="8" className="text-muted py-4">No reviews found.</td></tr>}
                {!loading && filteredReviews.map((review) => (
                  <tr key={review._id} onClick={() => navigate(`/dashboard/reviews/${review._id}`)} style={{ cursor: 'pointer' }}>
                    <td className="font-mono text-xs text-muted">#REV-{review._id.substring(review._id.length - 6).toUpperCase()}</td>
                    <td>
                      <div className="fw-bold">{review.guestId?.fullName || 'Guest'}</div>
                      <div className="text-muted small">{review.guestId?.email || '-'}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">Room {review.roomId?.roomNumber || 'N/A'}</div>
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>{review.comment || <span className="text-muted italic">No comment</span>}</td>
                    <td>
                      {review.images && review.images.length > 0 ? (
                        <div className="d-flex gap-1 justify-content-center align-items-center">
                          {review.images.slice(0, 2).map((img, idx) => (
                            <img key={idx} src={img} alt="" className="rounded object-cover border" style={{ width: '28px', height: '28px' }} />
                          ))}
                          {review.images.length > 2 && (
                            <Badge bg="light" text="dark" className="border">+{review.images.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small">None</span>
                      )}
                    </td>
                    <td><Badge bg={getStatusBadge(review.status)}>{review.status}</Badge></td>
                    <td>
                      {review.status === 'Pending' ? (
                        <div className="d-flex gap-1 justify-content-center" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline-success" onClick={(e) => handleApprove(review._id, e)}>
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={(e) => handleReject(review._id, e)}>
                            <FontAwesomeIcon icon={faXmark} />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/dashboard/reviews/${review._id}`)}>
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReviewsPage;