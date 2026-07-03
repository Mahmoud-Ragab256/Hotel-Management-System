import { useEffect, useState } from 'react';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://hotel-management-system-sigma-ruby.vercel.app';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${BASE_URL}/${img}`;
  return null;
};

const isAccepted = (review) => {
  const status = (review.status || '').toString().toLowerCase();
  if (status) return status === 'accepted' || status === 'approved';
  if (typeof review.isAccepted === 'boolean') return review.isAccepted;
  if (typeof review.isApproved === 'boolean') return review.isApproved;
  return false;
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};


function Stars({ rating }) {
  const value = Number(rating) || 0;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 15, color: n <= value ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, guest }) {
  const guestName = guest?.fullName || guest?.name || 'Guest';
  const avatarUrl = resolveImageUrl(guest?.avatar);
  const targetLabel = review.roomId?.name || review.serviceId?.name || review.roomName || review.serviceName || null;
  const comment = review.comment || review.message || review.text || '';
  const date = formatDate(review.createdAt || review.date);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)',
      padding: '26px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={guestName}
              style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{guestName}</div>
            {date && <div style={{ fontSize: 12, color: '#94a3b8' }}>{date}</div>}
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      {targetLabel && (
        <span style={{
          alignSelf: 'flex-start',
          fontSize: 11, fontWeight: 700, color: '#0ea5e9',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          background: '#f0f9ff', padding: '4px 12px', borderRadius: 999,
        }}>
          {targetLabel}
        </span>
      )}

      {comment && (
        <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{comment}</p>
      )}
    </div>
  );
}

export default function GuestsReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [guestsById, setGuestsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getAllReviews();
        const accepted = Array.isArray(data) ? data.filter(isAccepted) : [];
        setReviews(accepted);

        const guestIds = [...new Set(
          accepted
            .map((r) => (typeof r.guestId === 'string' ? r.guestId : r.guestId?._id))
            .filter(Boolean)
        )];

        const guestEntries = await Promise.all(
          guestIds.map(async (id) => {
            try {
              const guest = await dashboardApi.getGuest(id);
              return [id, guest];
            } catch {
              return [id, null];
            }
          })
        );

        setGuestsById(Object.fromEntries(guestEntries));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '52px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Testimonials</div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Guest Reviews</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 auto', maxWidth: 480 }}>See what our guests are saying about their stay.</p>
        {averageRating && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22, background: 'rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: 999 }}>
            <Stars rating={Math.round(averageRating)} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{averageRating} / 5</span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0 }}>Loading reviews...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', color: '#991b1b', fontSize: 14 }}>
            Could not load reviews: {error}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <p style={{ margin: 0 }}>No reviews to show yet.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {reviews.map((review) => {
              const guestId = typeof review.guestId === 'string' ? review.guestId : review.guestId?._id;
              return (
                <ReviewCard key={review._id || review.id} review={review} guest={guestsById[guestId]} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}