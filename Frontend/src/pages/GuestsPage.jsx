import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faEye,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDateTime } from '../utils/date.js';

const vipLevels = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const initialCreateForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  nationalId: '',
  vipLevel: 'Bronze'
};

const initialEditForm = {
  fullName: '',
  phone: '',
  nationalId: '',
  vipLevel: 'Bronze'
};

const guestId = (guest) => guest?._id || guest?.id || '';

const vipVariant = (vipLevel = '') => {
  if (vipLevel === 'Platinum') return 'dark';
  if (vipLevel === 'Gold') return 'warning';
  if (vipLevel === 'Silver') return 'secondary';
  return 'success';
};

function GuestsPage() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [vipFilter, setVipFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadGuests = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getGuests();
      setGuests(data);
    } catch (error) {
      showFeedback('danger', `Could not read guests: ${getApiErrorMessage(error)}`);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const target = `${guest.fullName || ''} ${guest.email || ''} ${guest.phone || ''} ${guest.nationalId || ''} ${guest.vipLevel || ''}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesVip = vipFilter === 'All' || guest.vipLevel === vipFilter;
      return matchesSearch && matchesVip;
    });
  }, [guests, search, vipFilter]);

  const counts = useMemo(() => ({
    total: guests.length,
    platinum: guests.filter((guest) => guest.vipLevel === 'Platinum').length,
    gold: guests.filter((guest) => guest.vipLevel === 'Gold').length
  }), [guests]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedGuest(null);
    setCreateForm(initialCreateForm);
    setFormModal(true);
  };

  const openEdit = async (guest) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getGuest(guestId(guest));
      const source = data || guest;
      setSelectedGuest(source);
      setEditForm({
        fullName: source.fullName || '',
        phone: source.phone || '',
        nationalId: source.nationalId || '',
        vipLevel: source.vipLevel || 'Bronze'
      });
      setModalMode('edit');
      setFormModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read guest details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openView = async (guest) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getGuest(guestId(guest));
      setSelectedGuest(data || guest);
      setViewModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read guest details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (modalMode === 'create') {
        const payload = {
          fullName: createForm.fullName,
          email: createForm.email,
          password: createForm.password,
          phone: createForm.phone,
          nationalId: createForm.nationalId,
          vipLevel: createForm.vipLevel
        };
        await dashboardApi.createGuest(payload);
        showFeedback('success', 'Guest created successfully.');
      } else {
        const payload = {
          fullName: editForm.fullName,
          phone: editForm.phone,
          nationalId: editForm.nationalId,
          vipLevel: editForm.vipLevel
        };
        await dashboardApi.updateGuest(guestId(selectedGuest), payload);
        showFeedback('success', 'Guest updated successfully.');
      }

      setFormModal(false);
      await loadGuests();
    } catch (error) {
      showFeedback('danger', `Could not save guest: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteGuest(guestId(selectedGuest));
      setDeleteModal(false);
      showFeedback('success', 'Guest deleted successfully.');
      await loadGuests();
    } catch (error) {
      showFeedback('danger', `Could not delete guest: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const activeForm = modalMode === 'create' ? createForm : editForm;
  const setActiveForm = modalMode === 'create' ? setCreateForm : setEditForm;

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faUsers} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Guests</h1>
                  <p className="text-muted mb-0">Guest CRUD uses GET, GET by ID, POST /register, PUT by ID, and DELETE by ID.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              <Button variant="outline-secondary" className="me-2" onClick={loadGuests} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className="me-2" />Refresh
              </Button>
              <Button onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add Guest
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Row className="g-3">
        <Col md={4}><StatCard title="Total Guests" value={counts.total} description="Loaded from backend" icon={faUsers} variant="primary" /></Col>
        <Col md={4}><StatCard title="Platinum Guests" value={counts.platinum} description="VIP level summary" icon={faCrown} variant="dark" /></Col>
        <Col md={4}><StatCard title="Gold Guests" value={counts.gold} description="VIP level summary" icon={faCrown} variant="warning" /></Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Guest Records</h2>
              <p className="text-muted mb-0">Emails are read-only after creation because the backend update endpoint does not update email.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, national ID" />
                </Col>
                <Col md={5}>
                  <Form.Select value={vipFilter} onChange={(event) => setVipFilter(event.target.value)}>
                    <option value="All">All VIP levels</option>
                    {vipLevels.map((level) => <option key={level} value={level}>{level}</option>)}
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
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>National ID</th>
                  <th>VIP Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" className="py-4"><Spinner size="sm" className="me-2" />Loading guests...</td></tr>}
                {!loading && filteredGuests.length === 0 && <tr><td colSpan="6" className="text-muted py-4">No guests found.</td></tr>}
                {!loading && filteredGuests.map((guest) => (
                  <tr key={guestId(guest)}>
                    <td className="fw-semibold">{guest.fullName || '-'}</td>
                    <td>{guest.email || '-'}</td>
                    <td>{guest.phone || '-'}</td>
                    <td>{guest.nationalId || '-'}</td>
                    <td><Badge bg={vipVariant(guest.vipLevel)}>{guest.vipLevel || 'Bronze'}</Badge></td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => openView(guest)}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-primary" onClick={() => openEdit(guest)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedGuest(guest); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
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
          <Modal.Header closeButton><Modal.Title>{modalMode === 'create' ? 'Add Guest' : 'Edit Guest'}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Full Name</Form.Label>
                <Form.Control required value={activeForm.fullName} onChange={(event) => setActiveForm({ ...activeForm, fullName: event.target.value })} />
              </Col>
              {modalMode === 'create' && (
                <>
                  <Col md={6}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control required type="password" minLength={6} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} />
                  </Col>
                </>
              )}
              <Col md={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control required value={activeForm.phone} onChange={(event) => setActiveForm({ ...activeForm, phone: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>National ID</Form.Label>
                <Form.Control required value={activeForm.nationalId} onChange={(event) => setActiveForm({ ...activeForm, nationalId: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>VIP Level</Form.Label>
                <Form.Select value={activeForm.vipLevel} onChange={(event) => setActiveForm({ ...activeForm, vipLevel: event.target.value })}>
                  {vipLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setFormModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Guest'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Guest Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedGuest && (
            <div className="d-flex flex-column gap-2">
              <div><strong>ID:</strong> {guestId(selectedGuest)}</div>
              <div><strong>Full Name:</strong> {selectedGuest.fullName}</div>
              <div><strong>Email:</strong> {selectedGuest.email}</div>
              <div><strong>Phone:</strong> {selectedGuest.phone}</div>
              <div><strong>National ID:</strong> {selectedGuest.nationalId}</div>
              <div><strong>VIP Level:</strong> <Badge bg={vipVariant(selectedGuest.vipLevel)}>{selectedGuest.vipLevel}</Badge></div>
              <div><strong>Created At:</strong> {selectedGuest.createdAt ? formatDateTime(selectedGuest.createdAt) : 'N/A'}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Guest</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this guest?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GuestsPage;
