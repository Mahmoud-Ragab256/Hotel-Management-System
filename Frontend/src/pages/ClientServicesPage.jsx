import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBellConcierge,
  faCar,
  faMugHot,
  faShirt,
  faSpa,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { clientApi, getApiErrorMessage } from '../services/api.js';
import { isClientAuthenticated } from '../services/auth.js';
import '../styles/clientPages.css';

const fallbackServices = [
  { _id: 'room-service', name: 'Room Service', category: 'RoomService', price: 25, maxCapacity: 2, isAvailable: true },
  { _id: 'spa', name: 'Spa & Wellness', category: 'Spa', price: 60, maxCapacity: 1, isAvailable: true },
  { _id: 'laundry', name: 'Express Laundry', category: 'Laundry', price: 18, maxCapacity: 1, isAvailable: true },
  { _id: 'restaurant', name: 'Restaurant Reservation', category: 'Restaurant', price: 35, maxCapacity: 4, isAvailable: true },
  { _id: 'transport', name: 'Airport Transfer', category: 'Transport', price: 45, maxCapacity: 3, isAvailable: true },
  { _id: 'coffee', name: 'Breakfast Package', category: 'Other', price: 20, maxCapacity: 2, isAvailable: true }
];

const categories = ['All', 'RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];

const iconFor = (category = '') => {
  if (category === 'Spa') return faSpa;
  if (category === 'Laundry') return faShirt;
  if (category === 'Restaurant') return faUtensils;
  if (category === 'Transport') return faCar;
  if (category === 'RoomService') return faMugHot;
  return faBellConcierge;
};

function ClientServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientApi.getServices();
        if (mounted) setServices(Array.isArray(data) && data.length ? data : fallbackServices);
      } catch (err) {
        if (mounted) {
          setServices(fallbackServices);
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


  const handleOrderService = () => {
    if (!isClientAuthenticated()) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/service-order');
  };

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const target = `${service.name || ''} ${service.category || ''}`.toLowerCase();
      const matchesSearch = target.includes(search.trim().toLowerCase());
      const matchesCategory = category === 'All' || service.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, category]);

  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faBellConcierge} /> Hotel services</span>
          <h1 className="client-title">Services made for a premium guest journey.</h1>
          <p className="client-subtitle">This page is now a dedicated services page. It no longer redirects to Rooms and no longer uses the Rooms component.</p>
        </div>
      </section>

      <div className="client-container filter-panel">
        <input
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search service name..."
        />
        <select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item} value={item}>{item === 'All' ? 'All Categories' : item}</option>)}
        </select>
      </div>

      <section className="client-section">
        <div className="client-container">
          {loading && <div className="loading-state">Loading services...</div>}
          {!loading && error && services.length === 0 && <div className="error-state">Could not load services: {error}</div>}

          {!loading && filtered.length === 0 && <div className="empty-state">No services found for the selected filters.</div>}

          {!loading && filtered.length > 0 && (
            <div className="cards-grid cards-grid-4">
              {filtered.map((service) => (
                <article className="client-card service-card" key={service._id || service.id || service.name}>
                  <div className="service-icon"><FontAwesomeIcon icon={iconFor(service.category)} /></div>
                  <span className="service-category">{service.category || 'Service'}</span>
                  <h3 className="card-title">{service.name}</h3>
                  <p className="card-text">
                    {service.description || 'Professional hotel service available for guests through the hotel management system.'}
                  </p>
                  <div className="price-row">
                    <div>
                      <span className="price-tag">${service.price ?? 0}</span>
                      <span className="small-muted"> / service</span>
                    </div>
                    <span className="small-muted">{service.isAvailable === false ? 'Unavailable' : 'Available'}</span>
                  </div>
                  <button type="button" className="client-btn client-btn-dark client-btn-full mt-3" onClick={handleOrderService}>
                    Order Service
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="client-section-tight">
        <div className="client-container cta-panel">
          <div>
            <h2>Need a room with these services?</h2>
            <p>Open the Rooms page and choose the right room category before completing your booking flow.</p>
          </div>
          <button type="button" className="client-btn client-btn-light" onClick={handleOrderService}>
            Order a Service <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default ClientServicesPage;
