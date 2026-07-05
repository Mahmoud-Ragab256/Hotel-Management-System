import { useEffect, useState } from 'react';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= rating ? '#f59e0b' : '#e2e8f0'} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
 const guestName = review.guestId?.fullName || 
  (review.guestId?.firstName && review.guestId?.lastName 
    ? `${review.guestId.firstName} ${review.guestId.lastName}` 
    : null) || 
  'Anonymous';
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const initial = guestName?.[0]?.toUpperCase() || '?';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)'; }}
    >
      {/* Stars */}
      <StarRating rating={review.rating || 0} />

      {/* Comment */}
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0, flex: 1 }}>
        "{review.comment || review.review || 'No comment provided.'}"
      </p>

      {/* Guest info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{guestName}</div>
          {date && <div style={{ fontSize: 12, color: '#94a3b8' }}>{date}</div>}
        </div>
        {review.roomId?.roomNumber && (
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '3px 10px', borderRadius: 999, border: '1px solid #e2e8f0' }}>
            Room #{review.roomId.roomNumber}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardApi.getAllReviews();
        setReviews(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '52px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Guest Reviews</div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>What Our Guests Say</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 auto 20px', maxWidth: 480 }}>Real experiences from our valued guests.</p>
        {reviews.length > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 20px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{avgRating}</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>average from {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0 }}>Loading reviews...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', color: '#991b1b', fontSize: 14 }}>
            Could not load reviews: {error}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p style={{ margin: 0 }}>No reviews yet.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {reviews.map((review, i) => (
              <ReviewCard key={review._id || i} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
