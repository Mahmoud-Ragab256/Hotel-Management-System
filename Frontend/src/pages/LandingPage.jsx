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
import { clientApi } from '../services/api.js';
import '../styles/clientPages.css';

const fallbackCategories = [
  {
    _id: 'deluxe',
    name: 'Deluxe Room',
    description: 'Modern comfort with elegant furniture, fast Wi‑Fi, and daily housekeeping.',
    basePrice: 120,
    capacity: { adults: 2, children: 1 },
    amenities: ['Wi‑Fi', 'Smart TV', 'Breakfast']
  },
  {
    _id: 'suite',
    name: 'Executive Suite',
    description: 'Premium suite for guests who need more space, privacy, and a luxury stay.',
    basePrice: 220,
    capacity: { adults: 3, children: 2 },
    amenities: ['Living Area', 'Mini Bar', 'City View']
  },
  {
    _id: 'family',
    name: 'Family Room',
    description: 'Spacious layout for families with flexible bedding and practical amenities.',
    basePrice: 170,
    capacity: { adults: 4, children: 2 },
    amenities: ['Extra Beds', 'Laundry', 'Room Service']
  }
];

const fallbackServices = [
  { _id: 'restaurant', name: 'Fine Dining', category: 'Restaurant', price: 35 },
  { _id: 'spa', name: 'Spa & Wellness', category: 'Spa', price: 60 },
  { _id: 'laundry', name: 'Premium Laundry', category: 'Laundry', price: 18 },
  { _id: 'transport', name: 'Airport Transfer', category: 'Transport', price: 45 }
];

const fallbackReviews = [
  { _id: 'rev1', rating: 5, comment: 'Professional staff, clean rooms, and the booking experience was very smooth.', guestId: { fullName: 'Sarah M.' } },
  { _id: 'rev2', rating: 5, comment: 'The services were fast and the room category matched exactly what I needed.', guestId: { fullName: 'Omar A.' } },
  { _id: 'rev3', rating: 4, comment: 'Excellent location and reliable service. I would book again.', guestId: { fullName: 'Mona K.' } }
];

const serviceIcon = (category = '') => {
  const normalized = category.toLowerCase();
  if (normalized.includes('spa')) return faSpa;
  if (normalized.includes('restaurant')) return faUtensils;
  if (normalized.includes('transport')) return faLocationDot;
  if (normalized.includes('room')) return faConciergeBell;
  return faBellConcierge;
};

const safeArray = (value, fallback) => (Array.isArray(value) && value.length ? value : fallback);

function RatingStars({ rating = 5 }) {
  return (
    <div className="review-stars" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesomeIcon key={index} icon={faStar} style={{ opacity: index < Number(rating || 0) ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

function LandingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const landingData = await clientApi.getLandingPageData();
        if (mounted) setData(landingData);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => safeArray(data?.roomCategories, fallbackCategories).slice(0, 3), [data]);
  const services = useMemo(() => safeArray(data?.services, fallbackServices).slice(0, 4), [data]);
  const reviews = useMemo(() => safeArray(data?.reviews, fallbackReviews).slice(0, 3), [data]);

  const availableRooms = data?.availableRooms ?? 24;
  const stats = [
    { value: `${availableRooms}+`, label: 'Available Rooms' },
    { value: `${categories.length}+`, label: 'Room Categories' },
    { value: `${services.length}+`, label: 'Premium Services' },
    { value: '24/7', label: 'Guest Support' }
  ];

  return (
    <div className="client-shell">
      <section className="landing-hero">
        <div className="client-container hero-grid">
          <div>
            <h1 className="hero-title">Stay smarter, book faster, feel better.</h1>
            <p className="hero-text">
              A polished hotel experience for guests: explore room categories, view services, and reserve the right stay with a clean digital journey.
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
            <span className="hero-floating-badge"><FontAwesomeIcon icon={faCheckCircle} /> Instant room browsing</span>
            <div className="hero-booking-card">
              <div className="hero-booking-row">
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Check-in</span>
                  <span className="hero-booking-value">Today</span>
                </div>
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Guests</span>
                  <span className="hero-booking-value">2 Adults</span>
                </div>
                <div className="hero-booking-item">
                  <span className="hero-booking-label">Status</span>
                  <span className="hero-booking-value">Available</span>
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

      <section className="client-section">
        <div className="client-container">
          <div className="section-head">
            <div>
              <span className="client-eyebrow"><FontAwesomeIcon icon={faBed} /> Featured rooms</span>
              <h2 className="client-title">Choose the room style that fits your stay.</h2>
              <p className="client-subtitle">Your landing page is now separate from the rooms page. Home shows marketing sections, while Rooms opens the room list only.</p>
            </div>
            <Link to="/rooms" className="client-btn client-btn-outline">All Rooms</Link>
          </div>

          <div className="cards-grid">
            {categories.map((category) => (
              <article className="client-card category-card" key={category._id || category.name}>
                <div className="category-icon"><FontAwesomeIcon icon={faHotel} /></div>
                <h3 className="card-title">{category.name}</h3>
                <p className="card-text">{category.description || 'Comfortable room category with essential amenities and flexible pricing.'}</p>
                <div className="amenities-list">
                  {(category.amenities || []).slice(0, 3).map((amenity) => (
                    <span className="amenity-pill" key={amenity}>{amenity}</span>
                  ))}
                </div>
                <div className="price-row">
                  <div>
                    <span className="price-tag">${category.basePrice ?? 0}</span>
                    <span className="small-muted"> / night</span>
                  </div>
                  <span className="small-muted">{category.capacity?.adults || 2} adults</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container experience-band">
          <div className="experience-image" />
          <div className="experience-content">
            <span className="hero-kicker"><FontAwesomeIcon icon={faShieldHalved} /> Clean booking flow</span>
            <h2 className="client-title">Professional layout with real sections, not duplicated routes.</h2>
            <p className="client-subtitle">
              The home page now acts as a complete landing page: hero, stats, featured rooms, services, reviews, and call to action.
            </p>
            <div className="feature-list">
              <div className="feature-item"><strong><FontAwesomeIcon icon={faWifi} /> Smart Stay</strong><span>Modern guest-facing interface with a clean visual hierarchy.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faClock} /> Fast Access</strong><span>Navigation links now open the correct dedicated pages.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faCalendarCheck} /> Easy Booking</strong><span>Room details still connect to the booking flow after login.</span></div>
              <div className="feature-item"><strong><FontAwesomeIcon icon={faChampagneGlasses} /> Premium Services</strong><span>Services page displays service cards instead of redirecting to rooms.</span></div>
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
              <p className="client-subtitle">Services are shown as a professional guest page and can read real data from the backend when available.</p>
            </div>
            <Link to="/services" className="client-btn client-btn-outline">View Services</Link>
          </div>

          <div className="cards-grid cards-grid-4">
            {services.map((service) => (
              <article className="client-card service-card" key={service._id || service.name}>
                <div className="service-icon"><FontAwesomeIcon icon={serviceIcon(service.category)} /></div>
                <span className="service-category">{service.category || 'Service'}</span>
                <h3 className="card-title">{service.name}</h3>
                <p className="card-text">{service.description || 'Premium hotel service designed to make the guest stay more comfortable.'}</p>
                <div className="price-row">
                  <span className="price-tag">${service.price ?? 0}</span>
                  <span className="small-muted">Available</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container">
          <div className="section-head">
            <div>
              <span className="client-eyebrow"><FontAwesomeIcon icon={faStar} /> Guest reviews</span>
              <h2 className="client-title">Trusted by guests.</h2>
              <p className="client-subtitle">A dedicated reviews page is now connected to the navigation instead of falling back to rooms.</p>
            </div>
            <Link to="/reviews" className="client-btn client-btn-outline">All Reviews</Link>
          </div>

          <div className="cards-grid">
            {reviews.map((review) => {
              const name = review.guestId?.fullName || review.guestName || 'Hotel Guest';
              return (
                <article className="client-card review-card" key={review._id || name}>
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
    </div>
  );
}

export default LandingPage;
