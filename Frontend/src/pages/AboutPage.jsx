import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward, faHotel, faShieldHalved, faUsers } from '@fortawesome/free-solid-svg-icons';
import '../styles/clientPages.css';

function AboutPage() {
  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faHotel} /> About hotel</span>
          <h1 className="client-title">A modern hotel experience for every guest.</h1>
          <p className="client-subtitle">Discover rooms, services, reviews, and support through a clean guest-facing website separated from the admin dashboard.</p>
        </div>
      </section>

      <Container className="py-5">
        <div className="cards-grid">
          <article className="client-card">
            <div className="service-icon"><FontAwesomeIcon icon={faAward} /></div>
            <h3 className="card-title">Premium stays</h3>
            <p className="card-text">Rooms and services are presented clearly so guests can compare and choose before login.</p>
          </article>
          <article className="client-card">
            <div className="service-icon"><FontAwesomeIcon icon={faShieldHalved} /></div>
            <h3 className="card-title">Protected actions</h3>
            <p className="card-text">Booking, reviews, profile, and service orders are protected behind client authentication.</p>
          </article>
          <article className="client-card">
            <div className="service-icon"><FontAwesomeIcon icon={faUsers} /></div>
            <h3 className="card-title">Guest first</h3>
            <p className="card-text">The guest website is isolated from admin tools so clients see only their own account and bookings.</p>
          </article>
        </div>
      </Container>
    </div>
  );
}

export default AboutPage;
