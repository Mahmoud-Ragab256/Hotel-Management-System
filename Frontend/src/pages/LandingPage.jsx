import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBed,
  faBellConcierge,
  faCalendarCheck,
  faChampagneGlasses,
  faCheckCircle,
  faClock,
  faConciergeBell,
  faHotel,
  faLocationDot,
  faShieldHalved,
  faSpa,
  faStar,
  faUtensils,
  faWifi
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api.js';
import Footer from '../components/Footer.jsx';
import '../styles/clientPages.css';

const serviceIcon = (category = '') => {
  const normalized = String(category).toLowerCase();
  if (normalized.includes('spa')) return faSpa;
  if (normalized.includes('restaurant')) return faUtensils;
  if (normalized.includes('transport')) return faLocationDot;
  if (normalized.includes('room')) return faConciergeBell;
  return faBellConcierge;
};

const readArray = (value) => (Array.isArray(value) ? value : []);
const readCount = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== '');
  return Number.isFinite(Number(value)) ? Number(value) : 0;
};

const getFirstImage = (item) => {
  const images = readArray(item?.images);
  return images.find(Boolean) || item?.image || item?.imageUrl || '';
};

const getLandingPageData = async () => {
  try {
    const response = await api.get('/client/landing');
    return response?.data?.data || null;
  } catch {
    const response = await api.get('/client/landing/landing');
    return response?.data?.data || null;
  }
};

function RatingStars({ rating = 5 }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="review-stars" aria-label={`${safeRating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesomeIcon key={index} icon={faStar} style={{ opacity: index < safeRating ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

function EmptyHomeBlock({ message }) {
  return <div className="empty-state home-empty-state">{message}</div>;
}

function LandingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const landingData = await getLandingPageData();
        if (mounted) {
          setData(landingData);
          setError('');
        }
      } catch (requestError) {
        if (mounted) {
          setData(null);
          setError(requestError?.response?.data?.message || requestError?.message || 'Unable to load home page data from backend.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => readArray(data?.roomCategories).slice(0, 3), [data]);
  const services = useMemo(() => readArray(data?.services).slice(0, 4), [data]);
  const reviews = useMemo(() => readArray(data?.reviews).slice(0, 3), [data]);

  const backendStats = data?.stats || {};
  const availableRooms = readCount(backendStats.availableRooms, data?.availableRooms);
  const roomCategoriesCount = readCount(backendStats.totalRoomCategories, data?.totalRoomCategories, data?.roomCategories?.length);
  const servicesCount = readCount(backendStats.totalServices, data?.totalServices, data?.services?.length);

  const stats = [
    { value: `${availableRooms}+`, label: 'Available Rooms' },
    { value: `${roomCategoriesCount}+`, label: 'Room Categories' },
    { value: `${servicesCount}+`, label: 'Premium Services' },
    { value: '24/7', label: 'Guest Support' }
  ];

  return (
    <div className="client-shell">
      <section className="landing-hero">
        <div className="client-container hero-grid">
          <div>
            <h1 className="hero-title">Stay smarter, book faster, feel better.</h1>
            <p className="hero-text">
              Explore live room categories, hotel services, and verified guest reviews loaded directly from the backend.
            </p>
            <div className="hero-actions">
              <Link to="/rooms" className="client-btn client-btn-primary">
                Explore Rooms <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/services" className="client-btn client-btn-light">
                View Services
              </Link>
            </div>
          </div>

          <div className="hero-panel" aria-label="Luxury hotel room preview">
            <span className="hero-floating-badge"><FontAwesomeIcon icon={faCheckCircle} /> Live backend data</span>
            <div className="hero-booking-card">
              <div className="hero-booking-row">
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Available</span>
                  <span className="hero-booking-value">{loading ? '...' : availableRooms} Rooms</span>
                </div>
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Categories</span>
                  <span className="hero-booking-value">{loading ? '...' : roomCategoriesCount}</span>
                </div>
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Status</span>
                  <span className="hero-booking-value">{error ? 'Offline' : 'Connected'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-strip">
        <div className="client-container stat-grid">
          {stats.map((item) => (
            <div className="stat-box" key={item.label}>
              <div className="stat-value">{loading ? '...' : item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <section className="client-section-tight">
          <div className="client-container">
            <div className="error-state">{error}</div>
          </div>
        </section>
      )}

      <section className="client-section">
        <div className="client-container">
          <div className="section-head">
            <div>
              <span className="client-eyebrow"><FontAwesomeIcon icon={faBed} /> Featured rooms</span>
              <h2 className="client-title">Choose the room style that fits your stay.</h2>
              <p className="client-subtitle">Room categories, prices, capacity, amenities, and images are loaded from the backend.</p>
            </div>
            <Link to="/rooms" className="client-btn client-btn-outline">All Rooms</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading room categories from backend...</div>
          ) : categories.length ? (
            <div className="cards-grid">
              {categories.map((category) => {
                const image = getFirstImage(category);
                const amenities = readArray(category.amenities).slice(0, 3);

                return (
                  <article className="client-card category-card" key={category._id || category.name}>
                    {image ? <div className="home-card-image" style={{ backgroundImage: `url(${image})` }} /> : null}
                    <div className="category-icon"><FontAwesomeIcon icon={faHotel} /></div>
                    <h3 className="card-title">{category.name || 'Room Category'}</h3>
                    <p className="card-text">{category.description || 'Comfortable room category with essential amenities and flexible pricing.'}</p>
                    {amenities.length ? (
                      <div className="amenities-list">
                        {amenities.map((amenity) => (
                          <span className="amenity-pill" key={amenity}>{amenity}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="price-row">
                      <div>
                        <span className="price-tag">${category.basePrice ?? 0}</span>
                        <span className="small-muted"> / night</span>
                      </div>
                      <span className="small-muted">{category.capacity?.adults || 0} adults</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyHomeBlock message="No room categories found in backend yet." />
          )}
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container experience-band">
          <div className="experience-image" />
          <div className="experience-content">
            <span className="hero-kicker"><FontAwesomeIcon icon={faShieldHalved} /> Clean booking flow</span>
            <h2 className="client-title">Professional home page connected to real hotel data.</h2>
            <p className="client-subtitle">
              The home page now reads statistics, room categories, available services, and approved reviews from backend APIs.
            </p>
            <div className="feature-list">
              <div className="feature-item"><strong><FontAwesomeIcon icon={faWifi} /> Smart Stay</strong><span>Guest-facing information updates when backend data changes.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faClock} /> Fast Access</strong><span>Navigation links still open the dedicated rooms and services pages.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faCalendarCheck} /> Easy Booking</strong><span>Room details remain connected to the booking flow after login.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faChampagneGlasses} /> Premium Services</strong><span>Services are displayed from available backend records.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="client-section">
        <div className="client-container">
          <div className="section-head">
            <div>
              <span className="client-eyebrow"><FontAwesomeIcon icon={faBellConcierge} /> Hotel services</span>
              <h2 className="client-title">Everything guests need in one place.</h2>
              <p className="client-subtitle">Available services are read from the backend and update automatically.</p>
            </div>
            <Link to="/services" className="client-btn client-btn-outline">View Services</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading services from backend...</div>
          ) : services.length ? (
            <div className="cards-grid cards-grid-4">
              {services.map((service) => {
                const image = getFirstImage(service);

                return (
                  <article className="client-card service-card" key={service._id || service.name}>
                    {image ? <div className="home-card-image home-card-image-small" style={{ backgroundImage: `url(${image})` }} /> : null}
                    <div className="service-icon"><FontAwesomeIcon icon={serviceIcon(service.category)} /></div>
                    <span className="service-category">{service.category || 'Service'}</span>
                    <h3 className="card-title">{service.name || 'Hotel Service'}</h3>
                    <p className="card-text">{service.description || service.details || 'Premium hotel service designed to make the guest stay more comfortable.'}</p>
                    <div className="price-row">
                      <span className="price-tag">${service.price ?? 0}</span>
                      <span className="small-muted">{service.maxCapacity ? `${service.maxCapacity} capacity` : 'Available'}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyHomeBlock message="No available services found in backend yet." />
          )}
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container">
          <div className="section-head">
            <div>
              <span className="client-eyebrow"><FontAwesomeIcon icon={faStar} /> Guest reviews</span>
              <h2 className="client-title">Trusted by guests.</h2>
              <p className="client-subtitle">Approved guest reviews are loaded from backend reviews.</p>
            </div>
            <Link to="/reviews" className="client-btn client-btn-outline">All Reviews</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading reviews from backend...</div>
          ) : reviews.length ? (
            <div className="cards-grid">
              {reviews.map((review) => {
                const name = review.guestId?.fullName || review.guestName || 'Hotel Guest';
                return (
                  <article className="client-card review-card" key={review._id || `${name}-${review.rating}`}>
                    <RatingStars rating={review.rating || 5} />
                    <p className="card-text">“{review.comment || 'Great stay, clean room, and excellent service.'}”</p>
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
          ) : (
            <EmptyHomeBlock message="No approved reviews found in backend yet." />
          )}
        </div>
      </section>

      <section className="client-section">
        <div className="client-container cta-panel">
          <div>
            <h2>Ready to find your perfect stay?</h2>
            <p>Open the rooms page for live availability, or explore services before completing the booking journey.</p>
          </div>
          <Link to="/rooms" className="client-btn client-btn-light">
            Browse Rooms <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
