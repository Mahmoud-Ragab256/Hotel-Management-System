import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Image,
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
  faImage,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faWrench,
  faDoorOpen
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDisplayDateTime } from '../utils/date.js';
import StatCard from '../components/StatCard';

const roomStatuses = ['Available', 'Occupied', 'Maintenance'];

const initialRoomForm = {
  roomNumber: '',
  categoryId: '',
  floor: '',
  status: 'Available'
};

const statusVariant = (status = '') => {
  if (status === 'Available') return 'success';
  if (status === 'Occupied') return 'primary';
  if (status === 'Maintenance') return 'warning';
  return 'secondary';
};

const roomId = (room) => room?._id || room?.id || '';
const categoryName = (room) => room?.categoryId?.name || room?.categoryName || 'N/A';

const getRoomImage = (room) => {
  if (!room) return '';

  if (Array.isArray(room.images) && room.images.length > 0) {
    const firstImage = room.images[0];
    if (typeof firstImage === 'string') return firstImage;
    return firstImage?.url || firstImage?.secure_url || firstImage?.src || '';
  }

  return room.image || room.imageUrl || room.photo || '';
};

const feedbackMeta = (type = 'info') => {
  if (type === 'success') return { title: 'Success', icon: faCircleCheck, tone: 'success' };
  if (type === 'danger') return { title: 'Error', icon: faCircleExclamation, tone: 'danger' };
  if (type === 'warning') return { title: 'Attention', icon: faTriangleExclamation, tone: 'warning' };
  return { title: 'Info', icon: faCircleInfo, tone: 'info' };
};

function FeedbackCard({ feedback, onClose }) {
  const meta = feedbackMeta(feedback?.type);

  return (
    <Card className={`border-0 shadow-sm feedback-card feedback-card-${meta.tone}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-start gap-3">
          <span className={`feedback-icon bg-${meta.tone}-subtle text-${meta.tone} rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0`}>
            <FontAwesomeIcon icon={meta.icon} />
          </span>
          <div className="flex-grow-1">
            <div className="fw-semibold">{meta.title}</div>
            <div className="small text-muted">{feedback?.message}</div>
          </div>
          {onClose && (
            <Button variant="light" size="sm" className="rounded-circle lh-1" onClick={onClose} aria-label="Close message">
              ×
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function InfoCard({ message }) {
  return <FeedbackCard feedback={{ type: 'info', message }} />;
}

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [availableMode, setAvailableMode] = useState(false);

  const [roomModal, setRoomModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [imagesModal, setImagesModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [roomImages, setRoomImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [roomImageFiles, setRoomImageFiles] = useState([]);
  const [roomPreviewUrl, setRoomPreviewUrl] = useState('');

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadCategories = async () => {
    try {
      const data = await dashboardApi.getRoomCategories();
      setCategories(data);
    } catch (error) {
      showFeedback('warning', `Could not load room categories: ${getApiErrorMessage(error)}`);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    setAvailableMode(false);

    try {
      const data = await dashboardApi.getRooms();
      setRooms(data);
    } catch (error) {
      showFeedback('danger', `Could not read rooms: ${getApiErrorMessage(error)}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRooms = async () => {
    setLoading(true);
    setAvailableMode(true);

    try {
      const data = await dashboardApi.getAvailableRooms();
      setRooms(data);
      showFeedback('success', 'Available rooms loaded successfully.');
    } catch (error) {
      showFeedback('danger', `Could not read available rooms: ${getApiErrorMessage(error)}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    loadCategories();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const target = `${room.roomNumber || ''} ${room.floor || ''} ${categoryName(room)} ${room.status || ''}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  const counts = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter((room) => room.status === 'Available').length,
    occupied: rooms.filter((room) => room.status === 'Occupied').length,
    maintenance: rooms.filter((room) => room.status === 'Maintenance').length
  }), [rooms]);

  const resetRoomImageSelection = () => {
    if (roomPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(roomPreviewUrl);
    }

    setRoomImageFiles([]);
    setRoomPreviewUrl('');
  };

  const closeRoomModal = () => {
    resetRoomImageSelection();
    setRoomModal(false);
  };

  const handleRoomImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setRoomImageFiles(files);

    if (roomPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(roomPreviewUrl);
    }

    setRoomPreviewUrl(files[0] ? URL.createObjectURL(files[0]) : getRoomImage(selectedRoom));
  };

  const openCreate = async () => {
    setModalMode('create');
    setSelectedRoom(null);
    setRoomForm(initialRoomForm);
    resetRoomImageSelection();
    await loadCategories();
    setRoomModal(true);
  };

  const openEdit = async (room) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getRoom(roomId(room));
      const source = data || room;
      setSelectedRoom(source);
      setRoomForm({
        roomNumber: source.roomNumber || '',
        categoryId: source.categoryId?._id || source.categoryId || '',
        floor: source.floor ?? '',
        status: source.status || 'Available'
      });
      setRoomImageFiles([]);
      setRoomPreviewUrl(getRoomImage(source));
      setModalMode('edit');
      await loadCategories();
      setRoomModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read room details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openView = async (room) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getRoom(roomId(room));
      setSelectedRoom(data || room);
      setViewModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read room details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoom = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      roomNumber: roomForm.roomNumber,
      categoryId: roomForm.categoryId,
      floor: Number(roomForm.floor),
      status: roomForm.status
    };

    try {
      let savedRoom = null;

      if (modalMode === 'create') {
        savedRoom = await dashboardApi.createRoom(payload);
      } else {
        const id = roomId(selectedRoom);

        if (!id) {
          showFeedback('danger', 'Could not save room: missing room ID.');
          setSaving(false);
          return;
        }

        savedRoom = await dashboardApi.updateRoom(id, payload);
      }

      const savedRoomId = roomId(savedRoom) || roomId(selectedRoom);

      if (roomImageFiles.length > 0 && savedRoomId) {
        await dashboardApi.uploadRoomImages(savedRoomId, roomImageFiles);
      }

      closeRoomModal();
      showFeedback('success', modalMode === 'create' ? 'Room created successfully.' : 'Room updated successfully.');

      if (availableMode) {
        await loadAvailableRooms();
      } else {
        await loadRooms();
      }
    } catch (error) {
      showFeedback('danger', `Could not save room: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteRoom(roomId(selectedRoom));
      setDeleteModal(false);
      showFeedback('success', 'Room deleted successfully.');
      if (availableMode) {
        await loadAvailableRooms();
      } else {
        await loadRooms();
      }
    } catch (error) {
      showFeedback('danger', `Could not delete room: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openImages = async (room) => {
    setSelectedRoom(room);
    setImageFiles([]);
    setRoomImages([]);
    setSaving(true);

    try {
      const images = await dashboardApi.getRoomImages(roomId(room));
      setRoomImages(images);
      setImagesModal(true);
    } catch (error) {
      setImagesModal(true);
      setRoomImages([]);
      showFeedback('warning', `Could not read room images: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (event) => {
    event.preventDefault();

    if (!imageFiles.length) {
      showFeedback('warning', 'Please select at least one image before uploading.');
      return;
    }

    setSaving(true);
    try {
      await dashboardApi.uploadRoomImages(roomId(selectedRoom), imageFiles);
      const images = await dashboardApi.getRoomImages(roomId(selectedRoom));
      setRoomImages(images);
      setImageFiles([]);
      showFeedback('success', 'Room images updated successfully.');
      if (availableMode) {
        await loadAvailableRooms();
      } else {
        await loadRooms();
      }
    } catch (error) {
      showFeedback('danger', `Could not upload room images: ${getApiErrorMessage(error)}`);
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
                  <FontAwesomeIcon icon={faBed} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Rooms</h1>
                  <p className="text-muted mb-0">CRUD, available rooms, details, and images using existing backend endpoints.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-flex flex-wrap justify-content-lg-end gap-2">
              <Button variant="outline-secondary" onClick={loadRooms} disabled={loading}>
                {loading ? <Spinner size="sm" className="me-2" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
                All Rooms
              </Button>
              <Button variant="outline-success" onClick={loadAvailableRooms} disabled={loading}>Available Only</Button>
              <Button variant="primary" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Room
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && (
        <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
      )}

      {availableMode && (
        <InfoCard message="Available-only mode is active. Click All Rooms to return to the full list." />
      )}

      <Row className="g-3">
        <Col md={3}>
          <StatCard
            title="Displayed Rooms"
            value={counts.total}
            icon={faBed}
            description="Loaded from backend"
            variant="primary"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Available"
            value={counts.available}
            icon={faCircleCheck}
            description="Ready for booking"
            variant="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Occupied"
            value={counts.occupied}
            icon={faDoorOpen}
            description="Guest checked in"
            variant="danger"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Maintenance"
            value={counts.maintenance}
            icon={faWrench}
            description="Out of service"
            variant="warning"
          />
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Room Records</h2>
              <p className="text-muted mb-0">Read, create, update, delete, and manage room images.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search number, floor, category, or status" />
                </Col>
                <Col md={5}>
                  <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="All">All statuses</option>
                    {roomStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
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
                  <th>Room No.</th>
                  <th>Category</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Base Price</th>
                  <th>Images</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="7" className="text-center py-4"><Spinner size="sm" className="me-2" />Loading rooms...</td></tr>}
                {!loading && filteredRooms.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No rooms found.</td></tr>}
                {!loading && filteredRooms.map((room) => (
                  <tr key={roomId(room)}>
                    <td className="fw-semibold">{room.roomNumber || '-'}</td>
                    <td>{categoryName(room)}</td>
                    <td>{room.floor ?? '-'}</td>
                    <td><Badge bg={statusVariant(room.status)}>{room.status || 'Unknown'}</Badge></td>
                    <td>{room.categoryId?.basePrice ? `$${room.categoryId.basePrice}` : '-'}</td>
                    <td>{room.images?.length || 0}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => openView(room)}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-info" onClick={() => openImages(room)}><FontAwesomeIcon icon={faImage} /></Button>
                        <Button variant="outline-primary" onClick={() => openEdit(room)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedRoom(room); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={roomModal} onHide={closeRoomModal} centered size="lg">
        <Form onSubmit={handleSaveRoom}>
          <Modal.Header closeButton><Modal.Title>{modalMode === 'create' ? 'Add Room' : 'Edit Room'}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Room Number</Form.Label>
                <Form.Control required value={roomForm.roomNumber} onChange={(event) => setRoomForm({ ...roomForm, roomNumber: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Floor</Form.Label>
                <Form.Control required type="number" min="1" value={roomForm.floor} onChange={(event) => setRoomForm({ ...roomForm, floor: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Category</Form.Label>
                <Form.Select required value={roomForm.categoryId} onChange={(event) => setRoomForm({ ...roomForm, categoryId: event.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name} - ${category.basePrice}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Status</Form.Label>
                <Form.Select value={roomForm.status} onChange={(event) => setRoomForm({ ...roomForm, status: event.target.value })}>
                  {roomStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>{modalMode === 'create' ? 'Room Image' : 'Replace Room Image'}</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleRoomImageChange} />
                <Form.Text className="text-muted">
                  {modalMode === 'create' ? 'Optional image uploaded to Cloudinary after creating the room.' : 'Leave empty to keep the current Cloudinary image.'}
                </Form.Text>
              </Col>

              <Col md={6}>
                <div className="border rounded-3 bg-light-subtle p-3 text-center h-100 d-flex align-items-center justify-content-center">
                  {roomPreviewUrl ? (
                    <Image src={roomPreviewUrl} alt="Room preview" fluid rounded style={{ maxHeight: 170, objectFit: 'cover' }} />
                  ) : (
                    <span className="text-muted">No room image selected</span>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeRoomModal}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Room'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Room Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="d-flex flex-column gap-2">
              <div><strong>ID:</strong> {roomId(selectedRoom)}</div>
              <div><strong>Room Number:</strong> {selectedRoom.roomNumber}</div>
              <div><strong>Category:</strong> {categoryName(selectedRoom)}</div>
              <div><strong>Floor:</strong> {selectedRoom.floor}</div>
              <div><strong>Status:</strong> <Badge bg={statusVariant(selectedRoom.status)}>{selectedRoom.status}</Badge></div>
              <div><strong>Images Count:</strong> {selectedRoom.images?.length || 0}</div>
              <div><strong>Created At:</strong> {formatDisplayDateTime(selectedRoom.createdAt)}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={imagesModal} onHide={() => setImagesModal(false)} centered size="lg">
        <Form onSubmit={handleUploadImages}>
          <Modal.Header closeButton><Modal.Title>Room Images</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Label>Upload Images</Form.Label>
            <Form.Control type="file" accept="image/*" multiple onChange={(event) => setImageFiles(Array.from(event.target.files || []))} />
            <small className="text-muted d-block mt-1">This uses PUT /dashboard/rooms/:id/images.</small>

            <hr />

            <h6 className="fw-bold">Current Images</h6>
            {roomImages.length === 0 ? (
              <p className="text-muted mb-0">No images found for this room.</p>
            ) : (
              <ListGroup>
                {roomImages.map((image, index) => (
                  <ListGroup.Item key={`${image}-${index}`} className="d-flex align-items-center justify-content-between gap-3">
                    <div className="text-truncate">{image}</div>
                    <a href={image.startsWith('http') ? image : `${import.meta.env.VITE_API_BASE_URL || 'https://hotel-management-system-sigma-ruby.vercel.app'}/${image}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">Open</a>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            {roomImages.length > 0 && roomImages[0]?.startsWith('http') && (
              <Row className="g-2 mt-2">
                {roomImages.slice(0, 4).map((image, index) => (
                  <Col md={3} key={image}><Image src={image} thumbnail alt={`Room image ${index + 1}`} /></Col>
                ))}
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setImagesModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Uploading...' : 'Upload Images'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Room</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this room? This action uses the existing DELETE room endpoint.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDeleteRoom} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RoomsPage;
