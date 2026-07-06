import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBed,
  faBellConcierge,
  faCircleQuestion,
  faClock,
  faEnvelope,
  faHotel,
  faLocationDot,
  faPhone,
  faShieldHalved,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import '../styles/clientPages.css';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', path: '/' },
      { label: 'Rooms', path: '/rooms' },
      { label: 'Services', path: '/services' },
      { label: 'Reviews', path: '/reviews' }
    ]
  },
  {
    title: 'Guest Support',
    links: [
      { label: 'Help Center', path: '/help-center' },
      { label: 'Room Booking', path: '/rooms' },
      { label: 'Premium Services', path: '/services' },
      { label: 'Guest Feedback', path: '/reviews' }
    ]
  }
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="client-container footer-grid">
        <div className="footer-brand-block">
          <Link to="/" className="footer-brand" aria-label="Hotel home">
            <span className="footer-brand-icon"><FontAwesomeIcon icon={faHotel} /></span>
            <span>Hotel Name</span>
          </Link>
          <p>
            A modern hotel experience built for easy room discovery, smooth booking flow, premium guest services, and reliable support.
          </p>
          <div className="footer-trust-row">
            <span><FontAwesomeIcon icon={faShieldHalved} /> Secure booking</span>
            <span><FontAwesomeIcon icon={faStar} /> Premium stay</span>
          </div>
        </div>

        {footerLinks.map((group) => (
          <nav className="footer-links" key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <Link key={`${group.title}-${link.label}`} to={link.path}>
                <FontAwesomeIcon icon={faArrowRight} /> {link.label}
              </Link>
            ))}
          </nav>
        ))}

        <div className="footer-contact-card">
          <h3>Contact</h3>
          <ul>
            <li><FontAwesomeIcon icon={faLocationDot} /> Cairo, Egypt</li>
            <li><FontAwesomeIcon icon={faPhone} /> +20 100 000 0000</li>
            <li><FontAwesomeIcon icon={faEnvelope} /> support@hotel.com</li>
            <li><FontAwesomeIcon icon={faClock} /> 24/7 Guest support</li>
          </ul>
          <Link to="/help-center" className="footer-help-btn">
            <FontAwesomeIcon icon={faCircleQuestion} /> Need help?
          </Link>
        </div>
      </div>

      <div className="client-container footer-bottom">
        <div>© {new Date().getFullYear()} Hotel Name. All rights reserved.</div>
        <div className="footer-bottom-links">
          <span><FontAwesomeIcon icon={faBed} /> Rooms</span>
          <span><FontAwesomeIcon icon={faBellConcierge} /> Services</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
