import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
  Table
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faEye,
  faLayerGroup,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const initialForm = {
  name: '',
  basePrice: '',
  adults: '2',
  children: '1',
  amenities: '',
  description: ''
};

const itemId = (item) => item?._id || item?.id || '';
const listToText = (value) => Array.isArray(value) ? value.join(', ') : '';
const textToList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

function RoomCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(initialForm);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getRoomCategories();
      setCategories(data);
    } catch (error) {
      showFeedback('danger', `Could not read room categories: ${getApiErrorMessage(error)}`);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const target = `${category.name || ''} ${category.description || ''} ${listToText(category.amenities)}`.toLowerCase();
      return target.includes(search.toLowerCase());
    });
  }, [categories, search]);

  const counts = useMemo(() => ({
    total: categories.length,
    avgPrice: categories.length
      ? Math.round(categories.reduce((sum, item) => sum + Number(item.basePrice || 0), 0) / categories.length)
      : 0,
    amenities: categories.reduce((sum, item) => sum + (item.amenities?.length || 0), 0)
  }), [categories]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setForm(initialForm);
    setFormModal(true);
  };

  const fillForm = (category) => {
    setForm({
      name: category.name || '',
      basePrice: category.basePrice ?? '',
      adults: category.capacity?.adults ?? '2',
      children: category.capacity?.children ?? '1',
      amenities: listToText(category.amenities),
      description: category.description || ''
    });
  };

  const openEdit = async (category) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getRoomCategory(itemId(category));
      const source = data || category;
      setSelectedCategory(source);
      fillForm(source);
      setModalMode('edit');
      setFormModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read category details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openView = async (category) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getRoomCategory(itemId(category));
      setSelectedCategory(data || category);
      setViewModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read category details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const buildPayload = () => ({
    name: form.name,
    basePrice: Number(form.basePrice),
    capacity: {
      adults: Number(form.adults),
      children: Number(form.children)
    },
    amenities: textToList(form.amenities),
    description: form.description
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();
      if (modalMode === 'create') {
        await dashboardApi.createRoomCategory(payload);
        showFeedback('success', 'Room category created successfully.');
      } else {
        await dashboardApi.updateRoomCategory(itemId(selectedCategory), payload);
        showFeedback('success', 'Room category updated successfully.');
      }
      setFormModal(false);
      await loadCategories();
    } catch (error) {
      showFeedback('danger', `Could not save room category: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteRoomCategory(itemId(selectedCategory));
      setDeleteModal(false);
      showFeedback('success', 'Room category deleted successfully.');
      await loadCategories();
    } catch (error) {
      showFeedback('danger', `Could not delete room category: ${getApiErrorMessage(error)}`);
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
                  <FontAwesomeIcon icon={faLayerGroup} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Room Categories</h1>
                  <p className="text-muted mb-0">Create, read, update, and delete room categories using the existing backend endpoints.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              <Button variant="outline-secondary" className="me-2" onClick={loadCategories} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className="me-2" />Refresh
              </Button>
              <Button onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add Category
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Row className="g-3">
        <Col md={4}><StatCard title="Total Categories" value={counts.total} description="Records from backend" icon={faLayerGroup} variant="primary" /></Col>
        <Col md={4}><StatCard title="Average Base Price" value={`$${counts.avgPrice}`} description="Calculated from loaded data" icon={faBed} variant="success" /></Col>
        <Col md={4}><StatCard title="Amenities" value={counts.amenities} description="Total listed amenities" icon={faLayerGroup} variant="info" /></Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Category Records</h2>
              <p className="text-muted mb-0">All table cells are centered horizontally and vertically.</p>
            </Col>
            <Col lg={6}>
              <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, description, or amenities" />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-center admin-table-centered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Base Price</th>
                  <th>Capacity</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="5" className="py-4"><Spinner size="sm" className="me-2" />Loading categories...</td></tr>}
                {!loading && filteredCategories.length === 0 && <tr><td colSpan="5" className="text-muted py-4">No room categories found.</td></tr>}
                {!loading && filteredCategories.map((category) => (
                  <tr key={itemId(category)}>
                    <td className="fw-semibold">{category.name || '-'}</td>
                    <td>{category.basePrice !== undefined ? `$${category.basePrice}` : '-'}</td>
                    <td>{category.capacity ? `${category.capacity.adults || 0} adults / ${category.capacity.children || 0} children` : '-'}</td>
                    <td>{category.amenities?.length ? <Badge bg="secondary">{category.amenities.length}</Badge> : '-'}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => openView(category)}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-primary" onClick={() => openEdit(category)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedCategory(category); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={formModal} onHide={() => setFormModal(false)} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton><Modal.Title>{modalMode === 'create' ? 'Add Room Category' : 'Edit Room Category'}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Name</Form.Label>
                <Form.Control required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Base Price</Form.Label>
                <Form.Control required type="number" min="0" value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Adults Capacity</Form.Label>
                <Form.Control required type="number" min="0" value={form.adults} onChange={(event) => setForm({ ...form, adults: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Children Capacity</Form.Label>
                <Form.Control required type="number" min="0" value={form.children} onChange={(event) => setForm({ ...form, children: event.target.value })} />
              </Col>
              <Col md={12}>
                <Form.Label>Amenities</Form.Label>
                <Form.Control value={form.amenities} onChange={(event) => setForm({ ...form, amenities: event.target.value })} placeholder="WiFi, TV, Sea View" />
                <small className="text-muted">Comma-separated list. Sent as amenities array.</small>
              </Col>
              <Col md={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setFormModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Category'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Room Category Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <div className="d-flex flex-column gap-3">
              <div><strong>ID:</strong> {itemId(selectedCategory)}</div>
              <div><strong>Name:</strong> {selectedCategory.name}</div>
              <div><strong>Base Price:</strong> ${selectedCategory.basePrice}</div>
              <div><strong>Capacity:</strong> {selectedCategory.capacity ? `${selectedCategory.capacity.adults || 0} adults / ${selectedCategory.capacity.children || 0} children` : '-'}</div>
              <div><strong>Description:</strong> {selectedCategory.description || '-'}</div>
              <div>
                <strong>Amenities:</strong>
                {selectedCategory.amenities?.length ? (
                  <ListGroup className="mt-2">{selectedCategory.amenities.map((item, index) => <ListGroup.Item key={`${item}-${index}`}>{item}</ListGroup.Item>)}</ListGroup>
                ) : <span> -</span>}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Room Category</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this room category?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RoomCategoriesPage;
