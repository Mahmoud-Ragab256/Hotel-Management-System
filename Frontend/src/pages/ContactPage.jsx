import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHeadset, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import '../styles/clientPages.css';

function ContactPage() {
  return (
    <div className="client-shell">
      <section className="page-hero">
        <div className="client-container">
          <span className="hero-kicker"><FontAwesomeIcon icon={faHeadset} /> Contact us</span>
          <h1 className="client-title">Need help with your stay?</h1>
          <p className="client-subtitle">Use the contact page for general questions. Booking-specific actions still require guest login.</p>
        </div>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={5}>
            <Card className="client-dashboard-card h-100">
              <Card.Body className="p-4">
                <h3 className="h5 fw-bold mb-4">Hotel contact</h3>
                <div className="client-profile-info">
                  <div><FontAwesomeIcon icon={faPhone} /><span>+20 100 000 0000</span></div>
                  <div><FontAwesomeIcon icon={faEnvelope} /><span>support@hotel.com</span></div>
                  <div><FontAwesomeIcon icon={faLocationDot} /><span>Main branch, City Center</span></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={7}>
            <Card className="client-dashboard-card">
              <Card.Body className="p-4">
                <h3 className="h5 fw-bold mb-3">Send a message</h3>
                <Form onSubmit={(event) => event.preventDefault()}>
                  <Row className="g-3">
                    <Col md={6}><Form.Control placeholder="Full name" /></Col>
                    <Col md={6}><Form.Control type="email" placeholder="Email address" /></Col>
                    <Col md={12}><Form.Control placeholder="Subject" /></Col>
                    <Col md={12}><Form.Control as="textarea" rows={4} placeholder="Message" /></Col>
                  </Row>
                  <Button variant="dark" className="mt-4">Send message</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ContactPage;
