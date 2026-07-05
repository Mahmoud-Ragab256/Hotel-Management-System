import { useEffect, useState } from 'react';
import { dashboardApi, getApiErrorMessage, API_BASE_URL } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${API_BASE_URL}/${img.replace(/^\//, '')}`;
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
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: '15px', color: n <= value ? '#f59e0b' : '#374151', transition: 'color 0.2s' }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, guest }) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const resolvedGuest = guest || (review.guestId && typeof review.guestId === 'object' ? review.guestId : null);
  const guestName = resolvedGuest?.fullName || resolvedGuest?.name || 'Guest';
  const avatarUrl = resolveImageUrl(resolvedGuest?.avatar);

  const roomLabel = review.roomId ? (review.roomId.roomNumber ? `Room #${review.roomId.roomNumber}` : review.roomId.name) : null;
  const serviceLabel = review.serviceId ? review.serviceId.name : null;
  const targetLabel = roomLabel || serviceLabel || review.roomName || review.serviceName || null;

  const comment = review.comment || review.message || review.text || '';
  const date = formatDate(review.createdAt || review.date);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.bgCard,
        borderRadius: '20px',
        border: isHovered 
          ? `1px solid ${isDark ? 'rgba(200, 90, 73, 0.35)' : 'rgba(200, 90, 73, 0.25)'}` 
          : `1px solid ${colors.borderCard}`,
        boxShadow: isHovered 
          ? (isDark ? '0 12px 32px rgba(200, 90, 73, 0.08)' : '0 12px 28px rgba(200, 90, 73, 0.04)') 
          : colors.shadow,
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={guestName}
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: `1px solid ${colors.borderCard}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              background: colors.inputBg,
              border: `1px solid ${colors.borderCard}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: colors.accent,
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              </svg>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{guestName}</div>
            {date && <div style={{ fontSize: '12px', color: colors.textSecondary, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{date}</div>}
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      {targetLabel && (
        <span style={{
          alignSelf: 'flex-start',
          fontSize: '11px', 
          fontWeight: '700', 
          color: colors.accent,
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          background: 'rgba(200, 90, 73, 0.1)', 
          padding: '5px 12px', 
          borderRadius: '20px',
          border: '1px solid rgba(200, 90, 73, 0.15)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          maxWidth: '100%'
        }}>
          {targetLabel}
        </span>
      )}

      {comment && (
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: colors.textPrimary, 
          lineHeight: '1.75', 
          fontWeight: '300',
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          "{comment}"
        </p>
      )}
    </div>
  );
}

export default function GuestsReviewsPage() {
  const { colors, isDark } = useTheme();
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
    <div style={{ minHeight: '100vh', background: 'transparent', color: colors.textPrimary, fontFamily: '"Inter", sans-serif' }}>
      {/* Header Banner - Luxury Room shape/photo Background */}
      <div style={{
        position: 'relative',
        background: colors.accent,
        borderBottom: `1px solid ${colors.borderCard}`,
        padding: '60px 24px 50px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(200, 90, 73, 0.15)',
        borderRadius: '24px',
        margin: '20px 24px 0',
      }}>
        <div style={{ 
          fontSize: '11px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          marginBottom: '12px', 
          fontFamily: '"Inter", sans-serif',
          textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : 'none' 
        }}>
          Testimonials & Experiences
        </div>
        <h1 style={{ 
          fontSize: 'clamp(28px, 5vw, 48px)', 
          fontWeight: '700', 
          color: '#ffffff', 
          margin: '0 0 16px', 
          letterSpacing: '-0.02em', 
          fontFamily: '"Playfair Display", serif', 
          textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' 
        }}>
          Guest Testimonials
        </h1>
        <p style={{ 
          fontSize: '15px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          margin: '0 auto 24px', 
          maxWidth: '480px', 
          fontWeight: '300', 
          lineHeight: '1.6', 
          textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : 'none' 
        }}>
          Read genuine reviews and shared stories from our global community of luxury travellers.
        </p>
        {averageRating && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            background: colors.bgCard,
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            padding: '10px 24px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow,
            marginTop: '12px'
          }}>
            <Stars rating={Math.round(averageRating)} />
            <span style={{ color: colors.textPrimary, fontWeight: '700', fontSize: '14px' }}>{averageRating} / 5</span>
            <span style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: '500' }}>({reviews.length} verified reviews)</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: colors.textSecondary }}>
            <div style={{ width: '36px', height: '36px', border: `3px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Loading guest testimonials...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px 20px', color: '#fca5a5', fontSize: '14px' }}>
            <strong>Could not load reviews:</strong> {error}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: colors.textSecondary, border: `1px dashed ${colors.borderCard}`, borderRadius: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No reviews have been published yet.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '32px',
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