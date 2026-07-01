import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBellConcierge,
  faCalendarCheck,
  faCircleQuestion,
  faCreditCard,
  faHeadset,
  faHotel
} from '@fortawesome/free-solid-svg-icons';
import '../styles/clientPages.css';

const faqs = [
  {
    question: 'How do I browse rooms?',
    answer: 'Open the Rooms page from the top navigation. You can filter by category and view available rooms.'
  },
  {
    question: 'Why was Services opening Rooms before?',
    answer: 'The Services route was missing from the guest routes, so the wildcard route redirected you back to Home/Rooms. It is fixed now.'
  },
  {
    question: 'Do I need to login before booking?',
    answer: 'Guests can browse rooms and services first. Login is required when completing account or booking actions.'
  },
  {
    question: 'Where can I see hotel services?',
    answer: 'Use the Services link. It opens a dedicated professional services page with filtering and service cards.'
  }
];

function HelpCenterPage() {
  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faCircleQuestion} /> Help center</span>
          <h1 className="client-title">Need help? Start here.</h1>
          <p className="client-subtitle">A simple support page for guests with quick access to rooms, services, booking help, and common questions.</p>
        </div>
      </section>

      <section className="client-section">
        <div className="client-container help-grid">
          <aside className="client-card help-card">
            <span className="client-eyebrow"><FontAwesomeIcon icon={faHeadset} /> Support</span>
            <h2 className="client-title" style={{ fontSize: 34 }}>Quick actions</h2>
            <p className="client-subtitle" style={{ fontSize: 15 }}>Use these links to navigate to the right section without being redirected to the wrong page.</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              <Link to="/rooms" className="client-btn client-btn-outline" style={{ justifyContent: 'space-between' }}><span><FontAwesomeIcon icon={faHotel} /> Rooms</span><FontAwesomeIcon icon={faArrowRight} /></Link>
              <Link to="/services" className="client-btn client-btn-outline" style={{ justifyContent: 'space-between' }}><span><FontAwesomeIcon icon={faBellConcierge} /> Services</span><FontAwesomeIcon icon={faArrowRight} /></Link>
              <Link to="/login" className="client-btn client-btn-dark" style={{ justifyContent: 'space-between' }}><span><FontAwesomeIcon icon={faCalendarCheck} /> Guest Login</span><FontAwesomeIcon icon={faArrowRight} /></Link>
            </div>
          </aside>

          <div>
            <div className="cards-grid" style={{ marginBottom: 24 }}>
              <article className="client-card help-card">
                <div className="feature-icon"><FontAwesomeIcon icon={faCalendarCheck} /></div>
                <h3 className="card-title">Booking</h3>
                <p className="card-text">Browse rooms, open details, login, then complete booking dates and requests.</p>
              </article>
              <article className="client-card help-card">
                <div className="feature-icon"><FontAwesomeIcon icon={faCreditCard} /></div>
                <h3 className="card-title">Invoices</h3>
                <p className="card-text">Invoices are generated and managed from the dashboard side of the system.</p>
              </article>
            </div>

            <div className="faq-list">
              {faqs.map((faq) => (
                <div className="faq-item" key={faq.question}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HelpCenterPage;
