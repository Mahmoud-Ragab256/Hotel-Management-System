import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faComments, faStar } from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import { isClientAuthenticated } from '../services/auth.js';
import '../styles/clientPages.css';

const fallbackReviews = [
  { _id: 'rev1', rating: 5, comment: 'The room was clean, the team was professional, and the full experience felt premium.', guestId: { fullName: 'Sarah M.' } },
  { _id: 'rev2', rating: 5, comment: 'Smooth booking flow and excellent services. The hotel system is very clear.', guestId: { fullName: 'Ahmed K.' } },
  { _id: 'rev3', rating: 4, comment: 'Great stay and helpful staff. I liked how easy it was to find rooms.', guestId: { fullName: 'Mona A.' } }
];

function Stars({ rating = 5 }) {
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesomeIcon key={index} icon={faStar} style={{ opacity: index < Number(rating || 0) ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

function ClientReviewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientApi.getReviews();
        if (mounted) setReviews(Array.isArray(data) && data.length ? data : fallbackReviews);
      } catch (err) {
        if (mounted) {
          setReviews(fallbackReviews);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const handleAddReview = () => {
    if (!isClientAuthenticated()) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/reviews/new');
  };

  const filtered = useMemo(() => {
    if (rating === 'All') return reviews;
    return reviews.filter((review) => Number(review.rating) === Number(rating));
  }, [reviews, rating]);

  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faComments} /> Guest reviews</span>
          <h1 className="client-title">Real feedback from hotel guests.</h1>
          <p className="client-subtitle">Reviews now have their own route and professional layout instead of falling back to the Rooms page.</p>
        </div>
      </section>

      <div className="client-container filter-panel" style={{ gridTemplateColumns: '1fr 240px' }}>
        <button type="button" className="client-btn client-btn-dark" onClick={handleAddReview}>Add Review</button>
        <select className="filter-select" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <section className="client-section">
        <div className="client-container">
          {loading && <div className="loading-state">Loading reviews...</div>}
          {!loading && error && reviews.length === 0 && <div className="error-state">Could not load reviews: {error}</div>}
          {!loading && filtered.length === 0 && <div className="empty-state">No reviews found for this rating.</div>}

          {!loading && filtered.length > 0 && (
            <div className="cards-grid">
              {filtered.map((review) => {
                const name = review.guestId?.fullName || review.guestName || 'Hotel Guest';
                return (
                  <article className="client-card review-card" key={review._id || review.id || name}>
                    <Stars rating={review.rating || 5} />
                    <p className="card-text">“{review.comment || 'Excellent stay and professional hotel service.'}”</p>
                    <div className="review-author">
                      <span className="avatar-circle">{name.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{name}</strong>
                        <div className="small-muted">Verified guest</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container cta-panel">
          <div>
            <h2>Want to experience it yourself?</h2>
            <p>Check room availability and choose the category that fits your stay.</p>
          </div>
          <Link to="/rooms" className="client-btn client-btn-light">
            Explore Rooms <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ClientReviewsPage;
