import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faImage } from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const serviceCategories = ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];

function AddServicePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    details: '',
    category: 'RoomService',
    price: '',
    maxCapacity: 1,
    isAvailable: true
  });

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setImageFiles(files);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(files[0] ? URL.createObjectURL(files[0]) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        details: form.details.trim(),
        category: form.category,
        price: Number(form.price),
        maxCapacity: Number(form.maxCapacity),
        isAvailable: form.isAvailable
      };

      await dashboardApi.createService(payload, imageFiles);
      showFeedback('success', 'Service created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard/services');
      }, 1500);
    } catch (error) {
      showFeedback('danger', `Could not create service: ${getApiErrorMessage(error)}`);
      setSaving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Button variant="link" className="text-decoration-none p-0 mb-2 text-muted sm fw-semibold" onClick={() => navigate('/dashboard/services')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Services
          </Button>
          <h1 className="h2 fw-bold mb-1">Add New Service</h1>
          <p className="text-muted mb-0">Create a service with details and Cloudinary images.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="bg-white" onClick={() => navigate('/dashboard/services')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save Service'}
          </Button>
        </div>
      </div>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 p-4 pb-0">
              <h2 className="h5 fw-bold mb-0">Basic Details</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Service Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g., Premium Spa Wellness Package"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Category</Form.Label>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {serviceCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Base Price (USD)</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$ 0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Short Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      maxLength={1000}
                      placeholder="Write the public description shown to guests."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Full Details</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      maxLength={2000}
                      placeholder="Write extra details, conditions, timing, or service notes."
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 p-4 pb-0">
              <h2 className="h5 fw-bold mb-0">Service Images</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4 align-items-center">
                <Col md={7}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Upload Images</Form.Label>
                    <Form.Control type="file" accept="image/*" multiple onChange={handleImageChange} />
                    <Form.Text className="text-muted">
                      Images are uploaded to Cloudinary and their URLs are saved in the database.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <div className="border rounded-3 bg-light-subtle p-3 text-center">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Service preview" fluid rounded style={{ maxHeight: 160, objectFit: 'cover' }} />
                    ) : (
                      <div className="text-muted py-4">
                        <FontAwesomeIcon icon={faImage} className="fs-3 mb-2" />
                        <div>No image selected</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 p-4 pb-0">
              <h2 className="h5 fw-bold mb-0">Operational Info</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4 align-items-center">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Max Capacity per Order</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      value={form.maxCapacity}
                      onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      Limits the number of people/items in a single request.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold mb-0">Service Status</div>
                      <small className="text-muted">Toggle availability on the guest portal</small>
                    </div>
                    <Form.Check
                      type="switch"
                      id="service-status-switch"
                      label={form.isAvailable ? 'Available' : 'Unavailable'}
                      className="fw-semibold fs-5"
                      checked={form.isAvailable}
                      onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="outline-secondary" className="bg-white" onClick={() => navigate('/dashboard/services')} disabled={saving}>
              Discard Draft
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save Service'
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default AddServicePage;
