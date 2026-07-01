import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Modal,
  Row,
  Spinner,
  Table,
  Form
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBellConcierge,
  faEye,
  faPlus,
  faRefresh,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDateTime } from '../utils/date.js';

const serviceCategories = ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];

const serviceId = (service) => service?._id || service?.id || '';

const categoryVariant = (category = '') => {
  if (category === 'RoomService') return 'primary';
  if (category === 'Spa') return 'info';
  if (category === 'Laundry') return 'secondary';
  if (category === 'Restaurant') return 'warning';
  if (category === 'Transport') return 'dark';
  return 'success';
};

function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getServices();
      setServices(data);
    } catch (error) {
      showFeedback('danger', `Could not read services: ${getApiErrorMessage(error)}`);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const target = `${service.name || ''} ${service.category || ''}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, categoryFilter]);

  const counts = useMemo(() => ({
    total: services.length,
    available: services.filter((s) => s.isAvailable).length,
    unavailable: services.filter((s) => !s.isAvailable).length
  }), [services]);

  const openView = async (service) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getService(serviceId(service));
      setSelectedService(data || service);
      setViewModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read service details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteService(serviceId(selectedService));
      setDeleteModal(false);
      showFeedback('success', 'Service deleted successfully.');
      await loadServices();
    } catch (error) {
      showFeedback('danger', `Could not delete service: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faBellConcierge} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Services</h1>
                  <p className="text-muted mb-0">Manage hotel services, base prices, capacities, and availability.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              <Button variant="outline-secondary" className="me-2" onClick={loadServices} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className="me-2" />Refresh
              </Button>
              <Button onClick={() => navigate('/dashboard/services/add')}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add New Service
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Row className="g-3">
        <Col md={4}><StatCard title="Total Services" value={counts.total} description="All hotel services" icon={faBellConcierge} variant="primary" /></Col>
        <Col md={4}><StatCard title="Available Services" value={counts.available} description="Active services" icon={faBellConcierge} variant="success" /></Col>
        <Col md={4}><StatCard title="Unavailable Services" value={counts.unavailable} description="Temporarily paused" icon={faBellConcierge} variant="danger" /></Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Service Records</h2>
              <p className="text-muted mb-0">List of all available amenities and hotel products.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service name..." />
                </Col>
                <Col md={5}>
                  <Form.Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option value="All">All Categories</option>
                    {serviceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-center admin-table-centered">
              <thead className="table-light">
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" className="py-4"><Spinner size="sm" className="me-2" />Loading services...</td></tr>}
                {!loading && filteredServices.length === 0 && <tr><td colSpan="6" className="text-muted py-4">No services found.</td></tr>}
                {!loading && filteredServices.map((service) => (
                  <tr key={serviceId(service)}>
                    <td className="fw-semibold">{service.name || '-'}</td>
                    <td><Badge bg={categoryVariant(service.category)}>{service.category || '-'}</Badge></td>
                    <td>${service.price ?? 0}</td>
                    <td>{service.maxCapacity ?? 1} Person</td>
                    <td>
                      <Badge bg={service.isAvailable ? 'success' : 'danger'}>
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => openView(service)} disabled={saving}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedService(service); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Service Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedService && (
            <div className="d-flex flex-column gap-2">
              <div><strong>ID:</strong> {serviceId(selectedService)}</div>
              <div><strong>Service Name:</strong> {selectedService.name}</div>
              <div><strong>Category:</strong> <Badge bg={categoryVariant(selectedService.category)}>{selectedService.category}</Badge></div>
              <div><strong>Price:</strong> ${selectedService.price}</div>
              <div><strong>Max Capacity:</strong> {selectedService.maxCapacity} Person</div>
              <div><strong>Status:</strong> <Badge bg={selectedService.isAvailable ? 'success' : 'danger'}>{selectedService.isAvailable ? 'Available' : 'Unavailable'}</Badge></div>
              <div><strong>Created At:</strong> {selectedService.createdAt ? formatDateTime(selectedService.createdAt) : 'N/A'}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Service</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this service?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ServicesPage;