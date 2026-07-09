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
  Form,
  Image
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBellConcierge,
  faCircleCheck,
  faEye,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash,
  faTriangleExclamation,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDisplayDateTime } from '../utils/date.js';

const serviceCategories = ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];

const serviceId = (service) => service?._id || service?.id || '';

const getServiceImage = (service) => {
  if (!service) return '';

  if (Array.isArray(service.images) && service.images.length > 0) {
    const firstImage = service.images[0];
    if (typeof firstImage === 'string') return firstImage;
    return firstImage?.url || firstImage?.secure_url || firstImage?.src || '';
  }

  return service.image || service.imageUrl || service.photo || '';
};

const categoryVariant = (category = '') => {
  if (category === 'RoomService') return 'primary';
  if (category === 'Spa') return 'info';
  if (category === 'Laundry') return 'secondary';
  if (category === 'Restaurant') return 'warning';
  if (category === 'Transport') return 'dark';
  return 'success';
};

const ServiceFeedbackCard = ({ feedback, onClose, className = '' }) => {
  if (!feedback) return null;

  const isSuccess = feedback.type === 'success';
  const icon = isSuccess ? faCircleCheck : faTriangleExclamation;
  const title = isSuccess ? 'Success' : 'Error';
  const borderColor = isSuccess ? '#198754' : '#dc3545';
  const bgColor = isSuccess ? '#d1e7dd' : '#f8d7da';
  const iconColor = isSuccess ? '#198754' : '#dc3545';

  return (
    <Card className={`border-0 shadow-sm rounded-4 ${className}`} style={{ borderLeft: `5px solid ${borderColor}` }}>
      <Card.Body className="d-flex align-items-start gap-3 p-3">
        <span
          className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 44, height: 44, backgroundColor: bgColor, color: iconColor }}
        >
          <FontAwesomeIcon icon={icon} />
        </span>
        <div className="flex-grow-1">
          <div className="fw-bold mb-1">{title}</div>
          <div className="text-muted small">{feedback.message}</div>
        </div>
        {onClose && (
          <Button variant="light" size="sm" className="rounded-circle flex-shrink-0" onClick={onClose} aria-label="Close service message">
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalFeedback, setModalFeedback] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    details: '',
  });
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'RoomService',
    price: '',
    maxCapacity: 1,
    isAvailable: true
  });

  const showFeedback = (type, message) => setFeedback({ type, message });
  const showModalFeedback = (type, message) => setModalFeedback({ type, message });

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

  const openEdit = async (service) => {
    setSaving(true);
    setFeedback(null);
    setModalFeedback(null);

    try {
      const data = await dashboardApi.getService(serviceId(service));
      const serviceData = data || service;

      setSelectedService(serviceData);
      setEditForm({
        name: serviceData.name || '',
        description: serviceData.description || '',
        details: serviceData.details || '',
        category: serviceData.category || 'RoomService',
        price: serviceData.price ?? '',
        maxCapacity: serviceData.maxCapacity ?? 1,
        isAvailable: serviceData.isAvailable ?? true
      });
      setEditImageFiles([]);
      setEditPreviewUrl(getServiceImage(serviceData));
      setEditModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read service for editing: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setEditImageFiles(files);

    if (editPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(editPreviewUrl);
    }

    setEditPreviewUrl(files[0] ? URL.createObjectURL(files[0]) : getServiceImage(selectedService));
  };

  const closeEditModal = () => {
    if (editPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(editPreviewUrl);
    }

    setEditModal(false);
    setEditImageFiles([]);
    setEditPreviewUrl('');
    setModalFeedback(null);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    setModalFeedback(null);

    try {
      const id = serviceId(selectedService);
      const normalizedPrice = Number(editForm.price);
      const normalizedCapacity = Number(editForm.maxCapacity);

      if (!id) {
        showModalFeedback('danger', 'Could not update service: missing service ID.');
        setSaving(false);
        return;
      }

      if (!editForm.name.trim()) {
        showModalFeedback('danger', 'Service name is required.');
        setSaving(false);
        return;
      }

      if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
        showModalFeedback('danger', 'Base price must be a valid number greater than or equal to 0.');
        setSaving(false);
        return;
      }

      if (!Number.isFinite(normalizedCapacity) || normalizedCapacity < 1) {
        showModalFeedback('danger', 'Max capacity must be at least 1.');
        setSaving(false);
        return;
      }

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        details: editForm.details.trim(),
        category: editForm.category,
        price: normalizedPrice,
        maxCapacity: Math.max(1, normalizedCapacity),
        isAvailable: Boolean(editForm.isAvailable)
      };

      await dashboardApi.updateService(id, payload, editImageFiles);
      closeEditModal();
      showFeedback('success', 'Service updated successfully.');
      await loadServices();
    } catch (error) {
      showModalFeedback('danger', `Could not update service: ${getApiErrorMessage(error)}`);
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

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        name: createForm.name,
        category: createForm.category,
        price: Number(createForm.price),
        maxCapacity: Number(createForm.maxCapacity),
        isAvailable: createForm.isAvailable,
        images: []
      };

      await dashboardApi.createService(payload);
      setCreateModal(false);
      showFeedback('success', 'Service created successfully.');
      await loadServices();
    } catch (error) {
      showFeedback('danger', `Could not create service: ${getApiErrorMessage(error)}`);
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
              <Button onClick={() => {
                setCreateForm({
                  name: '',
                  category: 'RoomService',
                  price: '',
                  maxCapacity: 1,
                  isAvailable: true
                });
                setCreateModal(true);
              }}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add New Service
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <ServiceFeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />

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
                        <Button variant="outline-secondary" onClick={() => openView(service)} disabled={saving} title="View" aria-label="View service"><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-primary" onClick={() => openEdit(service)} disabled={saving} title="Edit" aria-label="Edit service"><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedService(service); setDeleteModal(true); }} title="Delete" aria-label="Delete service"><FontAwesomeIcon icon={faTrash} /></Button>
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
              <div><strong>Description:</strong> {selectedService.description || '-'}</div>
              <div><strong>Details:</strong> {selectedService.details || '-'}</div>
              <div><strong>Created At:</strong> {formatDisplayDateTime(selectedService.createdAt)}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={editModal} onHide={closeEditModal} centered size="lg">
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton><Modal.Title>Edit Service</Modal.Title></Modal.Header>
          <Modal.Body>
            <ServiceFeedbackCard feedback={modalFeedback} onClose={() => setModalFeedback(null)} className="mb-3" />
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Service Name</Form.Label>
                  <Form.Control
                    required
                    value={editForm.name}
                    onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={editForm.category}
                    onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                  >
                    {serviceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Base Price (USD)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(event) => setEditForm({ ...editForm, price: event.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Short Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    maxLength={1000}
                    value={editForm.description}
                    onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Full Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    maxLength={2000}
                    value={editForm.details}
                    onChange={(event) => setEditForm({ ...editForm, details: event.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Replace Image</Form.Label>
                  <Form.Control type="file" accept="image/*" multiple onChange={handleEditImageChange} />
                  <Form.Text className="text-muted">Leave empty to keep the current Cloudinary image.</Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <div className="border rounded-3 bg-light-subtle p-3 text-center h-100 d-flex align-items-center justify-content-center">
                  {editPreviewUrl ? (
                    <Image src={editPreviewUrl} alt="Service preview" fluid rounded style={{ maxHeight: 170, objectFit: 'cover' }} />
                  ) : (
                    <span className="text-muted">No service image</span>
                  )}
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Max Capacity per Order</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min="1"
                    value={editForm.maxCapacity}
                    onChange={(event) => setEditForm({ ...editForm, maxCapacity: event.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <div className="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold mb-0">Service Status</div>
                    <small className="text-muted">Toggle guest availability</small>
                  </div>
                  <Form.Check
                    type="switch"
                    id="edit-service-status-switch"
                    label={editForm.isAvailable ? 'Available' : 'Unavailable'}
                    checked={editForm.isAvailable}
                    onChange={(event) => setEditForm({ ...editForm, isAvailable: event.target.checked })}
                  />
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeEditModal} disabled={saving}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Service</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this service?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>

      {/* Create Service Modal */}
      <Modal show={createModal} onHide={() => setCreateModal(false)} centered size="lg">
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Service</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Service Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Premium Spa Wellness Package"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  >
                    {serviceCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Base Price (USD) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Max Capacity per Order</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min="1"
                    placeholder="e.g., 5"
                    value={createForm.maxCapacity}
                    onChange={(e) => setCreateForm({ ...createForm, maxCapacity: e.target.value })}
                  />
                  <Form.Text className="text-muted">
                    Limits the number of guests/items per request.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <div className="p-3 border rounded bg-light-subtle d-flex justify-content-between align-items-center h-100">
                  <div>
                    <div className="fw-bold mb-0">Service Status</div>
                    <small className="text-muted">Toggle availability on guest portal</small>
                  </div>
                  <Form.Check
                    type="switch"
                    id="modal-service-status-switch"
                    label={createForm.isAvailable ? "Available" : "Unavailable"}
                    className="fw-semibold"
                    checked={createForm.isAvailable}
                    onChange={(e) => setCreateForm({ ...createForm, isAvailable: e.target.checked })}
                  />
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setCreateModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : 'Save Service'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ServicesPage;