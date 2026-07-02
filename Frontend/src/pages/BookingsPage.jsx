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
  faBan,
  faCalendarCheck,
  faEye,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';
import { formatDisplayDate, todayDateInputValue, toDateInputValue } from '../utils/date.ts';

const bookingStatuses = ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];

const initialCreateForm = {
  guestId: '',
  roomId: '',
  checkInDate: '',
  checkOutDate: '',
  totalPrice: '',
  specialRequests: ''
};

const initialEditForm = {
  checkInDate: '',
  checkOutDate: '',
  totalPrice: '',
  status: 'Pending',
  specialRequests: ''
};

const statusVariant = (status = '') => {
  if (status === 'Confirmed' || status === 'CheckedIn') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'CheckedOut') return 'info';
  if (status === 'Cancelled') return 'danger';
  return 'secondary';
};

const toDateInput = toDateInputValue;
const displayDate = formatDisplayDate;
const todayInput = todayDateInputValue();

const bookingId = (booking) => booking?._id || booking?.id || '';
const guestName = (booking) => booking?.guestId?.fullName || booking?.guestName || 'Unknown Guest';
const roomNumber = (booking) => booking?.roomId?.roomNumber || booking?.roomNumber || 'N/A';

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

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [cancelReason, setCancelReason] = useState('');

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadDependencies = async () => {
    try {
      const [guestsData, roomsData] = await Promise.all([
        dashboardApi.getGuests(),
        dashboardApi.getAvailableRooms()
      ]);
      setGuests(guestsData);
      setAvailableRooms(roomsData);
    } catch (error) {
      showFeedback('warning', `Could not load guest or available room lists: ${getApiErrorMessage(error)}`);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getBookings();
      setBookings(data);
    } catch (error) {
      showFeedback('danger', `Could not read bookings: ${getApiErrorMessage(error)}`);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadDependencies();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const target = `${guestName(booking)} ${booking?.guestId?.email || ''} ${roomNumber(booking)} ${bookingId(booking)}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const loadBookingDetails = async (booking, mode) => {
    const id = bookingId(booking);
    setSelectedBooking(booking);
    setDetailsLoading(true);

    try {
      const data = await dashboardApi.getBooking(id);
      setSelectedBooking(data || booking);

      if (mode === 'view') {
        setViewModal(true);
      }

      if (mode === 'edit') {
        const source = data || booking;
        setEditForm({
          checkInDate: toDateInput(source.checkInDate),
          checkOutDate: toDateInput(source.checkOutDate),
          totalPrice: source.totalPrice ?? '',
          status: source.status || 'Pending',
          specialRequests: source.specialRequests || ''
        });
        setEditModal(true);
      }
    } catch (error) {
      showFeedback('danger', `Could not read booking details: ${getApiErrorMessage(error)}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openCreate = async () => {
    setCreateForm(initialCreateForm);
    await loadDependencies();
    setCreateModal(true);
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...createForm,
        totalPrice: Number(createForm.totalPrice)
      };
      await dashboardApi.createBooking(payload);
      setCreateModal(false);
      showFeedback('success', 'Booking created successfully.');
      await loadBookings();
      await loadDependencies();
    } catch (error) {
      showFeedback('danger', `Could not create booking: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBooking = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...editForm,
        totalPrice: Number(editForm.totalPrice)
      };
      await dashboardApi.updateBooking(bookingId(selectedBooking), payload);
      setEditModal(false);
      showFeedback('success', 'Booking updated successfully.');
      await loadBookings();
    } catch (error) {
      showFeedback('danger', `Could not update booking: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await dashboardApi.cancelBooking(bookingId(selectedBooking), cancelReason);
      setCancelModal(false);
      setCancelReason('');
      showFeedback('success', 'Booking cancelled successfully.');
      await loadBookings();
      await loadDependencies();
    } catch (error) {
      showFeedback('danger', `Could not cancel booking: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBooking = async () => {
    setSaving(true);

    try {
      await dashboardApi.deleteBooking(bookingId(selectedBooking));
      setDeleteModal(false);
      showFeedback('success', 'Booking deleted successfully.');
      await loadBookings();
    } catch (error) {
      showFeedback('danger', `Could not delete booking: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'Pending').length,
    confirmed: bookings.filter((booking) => ['Confirmed', 'CheckedIn'].includes(booking.status)).length,
    cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length
  }), [bookings]);

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Bookings</h1>
                  <p className="text-muted mb-0">CRUD operations connected to the existing bookings backend endpoints.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-flex justify-content-lg-end gap-2">
              <Button variant="outline-secondary" onClick={loadBookings} disabled={loading}>
                {loading ? <Spinner size="sm" className="me-2" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
                Refresh
              </Button>
              <Button variant="primary" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Booking
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && (
        <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
      )}

      <Row className="g-3">
        <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1">Total</p><h3 className="fw-bold mb-0">{stats.total}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1">Confirmed / Checked In</p><h3 className="fw-bold mb-0">{stats.confirmed}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1">Pending</p><h3 className="fw-bold mb-0">{stats.pending}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm h-100"><Card.Body><p className="text-muted mb-1">Cancelled</p><h3 className="fw-bold mb-0">{stats.cancelled}</h3></Card.Body></Card></Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Booking Records</h2>
              <p className="text-muted mb-0">Read, create, update, cancel, and delete bookings.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, guest, email, or room" />
                </Col>
                <Col md={5}>
                  <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="All">All statuses</option>
                    {bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
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
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="8" className="text-center py-4"><Spinner size="sm" className="me-2" />Loading bookings...</td></tr>
                )}

                {!loading && filteredBookings.length === 0 && (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No bookings found.</td></tr>
                )}

                {!loading && filteredBookings.map((booking) => (
                  <tr key={bookingId(booking)}>
                    <td className="fw-semibold">{bookingId(booking).slice(-8)}</td>
                    <td>
                      <div className="fw-semibold">{guestName(booking)}</div>
                      <small className="text-muted">{booking?.guestId?.email || 'No email'}</small>
                    </td>
                    <td>{roomNumber(booking)}</td>
                    <td>{displayDate(booking.checkInDate)}</td>
                    <td>{displayDate(booking.checkOutDate)}</td>
                    <td><Badge bg={statusVariant(booking.status)}>{booking.status || 'Pending'}</Badge></td>
                    <td className="text-center fw-semibold">${Number(booking.totalPrice || 0).toLocaleString()}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => loadBookingDetails(booking, 'view')} disabled={detailsLoading}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-primary" onClick={() => loadBookingDetails(booking, 'edit')} disabled={booking.status === 'Cancelled'}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button
                          variant="outline-warning"
                          onClick={() => { setSelectedBooking(booking); setCancelReason(''); setCancelModal(true); }}
                          disabled={booking.status === 'Cancelled'}
                        >
                          <FontAwesomeIcon icon={faBan} />
                        </Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedBooking(booking); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={createModal} onHide={() => setCreateModal(false)} centered size="lg">
        <Form onSubmit={handleCreateBooking}>
          <Modal.Header closeButton><Modal.Title>Add Booking</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Guest</Form.Label>
                <Form.Select required value={createForm.guestId} onChange={(event) => setCreateForm({ ...createForm, guestId: event.target.value })}>
                  <option value="">Select guest</option>
                  {guests.map((guest) => <option key={guest._id} value={guest._id}>{guest.fullName} - {guest.email}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Available Room</Form.Label>
                <Form.Select required value={createForm.roomId} onChange={(event) => setCreateForm({ ...createForm, roomId: event.target.value })}>
                  <option value="">Select available room</option>
                  {availableRooms.map((room) => <option key={room._id} value={room._id}>Room {room.roomNumber} - {room.categoryId?.name || 'Category'}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Check-in Date</Form.Label>
                <Form.Control required type="date" min={todayInput} value={createForm.checkInDate} onChange={(event) => setCreateForm({ ...createForm, checkInDate: event.target.value, checkOutDate: createForm.checkOutDate && createForm.checkOutDate <= event.target.value ? '' : createForm.checkOutDate })} />
              </Col>
              <Col md={6}>
                <Form.Label>Check-out Date</Form.Label>
                <Form.Control required type="date" min={createForm.checkInDate || todayInput} value={createForm.checkOutDate} onChange={(event) => setCreateForm({ ...createForm, checkOutDate: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Total Price</Form.Label>
                <Form.Control required type="number" min="0" step="0.01" value={createForm.totalPrice} onChange={(event) => setCreateForm({ ...createForm, totalPrice: event.target.value })} />
              </Col>
              <Col md={12}>
                <Form.Label>Special Requests</Form.Label>
                <Form.Control as="textarea" rows={3} maxLength={500} value={createForm.specialRequests} onChange={(event) => setCreateForm({ ...createForm, specialRequests: event.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setCreateModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Create Booking'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={editModal} onHide={() => setEditModal(false)} centered size="lg">
        <Form onSubmit={handleUpdateBooking}>
          <Modal.Header closeButton><Modal.Title>Edit Booking</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Check-in Date</Form.Label>
                <Form.Control type="date" value={editForm.checkInDate} onChange={(event) => setEditForm({ ...editForm, checkInDate: event.target.value, checkOutDate: editForm.checkOutDate && editForm.checkOutDate <= event.target.value ? '' : editForm.checkOutDate })} />
              </Col>
              <Col md={6}>
                <Form.Label>Check-out Date</Form.Label>
                <Form.Control type="date" min={editForm.checkInDate || undefined} value={editForm.checkOutDate} onChange={(event) => setEditForm({ ...editForm, checkOutDate: event.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Status</Form.Label>
                <Form.Select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                  {bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Total Price</Form.Label>
                <Form.Control type="number" min="0" step="0.01" value={editForm.totalPrice} onChange={(event) => setEditForm({ ...editForm, totalPrice: event.target.value })} />
              </Col>
              <Col md={12}>
                <Form.Label>Special Requests</Form.Label>
                <Form.Control as="textarea" rows={3} maxLength={500} value={editForm.specialRequests} onChange={(event) => setEditForm({ ...editForm, specialRequests: event.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Booking Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="d-flex flex-column gap-2">
              <div><strong>ID:</strong> {bookingId(selectedBooking)}</div>
              <div><strong>Guest:</strong> {selectedBooking?.guestId?.fullName || 'N/A'}</div>
              <div><strong>Room:</strong> {selectedBooking?.roomId?.roomNumber || 'N/A'}</div>
              <div><strong>Check-in:</strong> {displayDate(selectedBooking.checkInDate)}</div>
              <div><strong>Check-out:</strong> {displayDate(selectedBooking.checkOutDate)}</div>
              <div><strong>Status:</strong> <Badge bg={statusVariant(selectedBooking.status)}>{selectedBooking.status}</Badge></div>
              <div><strong>Total:</strong> ${Number(selectedBooking.totalPrice || 0).toLocaleString()}</div>
              <div><strong>Payment:</strong> {selectedBooking.paymentStatus || 'N/A'}</div>
              <div><strong>Special Requests:</strong> {selectedBooking.specialRequests || 'N/A'}</div>
              {selectedBooking.cancelReason && <div><strong>Cancel Reason:</strong> {selectedBooking.cancelReason}</div>}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={cancelModal} onHide={() => setCancelModal(false)} centered>
        <Form onSubmit={handleCancelBooking}>
          <Modal.Header closeButton><Modal.Title>Cancel Booking</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Label>Cancel Reason</Form.Label>
            <Form.Control required as="textarea" rows={3} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Write the cancel reason" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setCancelModal(false)}>Close</Button>
            <Button variant="warning" type="submit" disabled={saving}>{saving ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Booking</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this booking? This action uses the existing DELETE booking endpoint.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDeleteBooking} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BookingsPage;
