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
  faConciergeBell,
  faEye,
  faBan,
  faRefresh,
  faTrash,
  faCheck,
  faFlagCheckered,
  faPlus,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faSpa,
  faShirt,
  faUtensils,
  faCar,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const getEmployeeFromToken = () => {
  try {
    const stored = localStorage.getItem('hotel_admin_user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    return {
      id: user._id || user.id || null,
      name: user.fullName || null
    };
  } catch {
    return null;
  }
};

const serviceCategories = ['RoomService', 'Spa', 'Laundry', 'Restaurant', 'Transport', 'Other'];
const orderStatuses = ['Pending', 'InProgress', 'Completed', 'Cancelled'];

const categoryIcon = (category = '') => {
  if (category === 'Spa') return faSpa;
  if (category === 'Laundry') return faShirt;
  if (category === 'Restaurant') return faUtensils;
  if (category === 'Transport') return faCar;
  if (category === 'RoomService') return faConciergeBell;
  return faBoxOpen;
};

const statusVariant = (status = '') => {
  if (status === 'Completed') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'InProgress') return 'info';
  if (status === 'Cancelled') return 'danger';
  return 'secondary';
};

const orderId = (order) => order?._id || order?.id || '';
const serviceRef = (order) => order?.serviceId?._id || order?.serviceId || '';
const bookingRef = (order) => order?.bookingId?._id || order?.bookingId || '';

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

function ServiceOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [createForm, setCreateForm] = useState({ serviceId: '', bookingId: '', notes: '', quantity: 1 });
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const currentEmployee = useMemo(() => getEmployeeFromToken(), []);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const serviceById = useMemo(() => {
    const map = {};
    services.forEach((s) => { map[s._id] = s; });
    return map;
  }, [services]);

  const bookingById = useMemo(() => {
    const map = {};
    bookings.forEach((b) => { map[b._id] = b; });
    return map;
  }, [bookings]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [orderData, serviceData, bookingData] = await Promise.all([
        dashboardApi.getServiceOrders(),
        dashboardApi.getServices(),
        dashboardApi.getBookings()
      ]);
      setOrders(orderData);
      setServices(serviceData);
      setBookings(bookingData);
    } catch (error) {
      showFeedback('danger', `Could not load service orders: ${getApiErrorMessage(error)}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const enrich = (order) => {
    const service = serviceById[serviceRef(order)] || order.serviceId || {};
    const booking = bookingById[bookingRef(order)] || order.bookingId || {};
    const guest = booking?.guestId || booking?.guest || {};
    const guestName = guest?.fullName || guest?.name
      || (guest?.firstName ? `${guest.firstName} ${guest.lastName || ''}`.trim() : null)
      || '—';
    const roomNumber = booking?.roomId?.number || booking?.room?.number || booking?.roomNumber || '—';
    return { service, booking, guestName, roomNumber };
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const { service, guestName } = enrich(order);
      const target = `${service?.name || ''} ${guestName}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || service?.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, search, categoryFilter, statusFilter, serviceById, bookingById]);

  const adjustInvoiceForBooking = async (bookingId, delta) => {
    try {
      const invoices = await dashboardApi.getInvoices();
      const invoice = invoices.find((inv) => (inv.bookingId?._id || inv.bookingId) === bookingId);
      if (!invoice) return;
      const newTotal = Math.max(0, Number(invoice.totalAmount || 0) + delta);
      await dashboardApi.updateInvoice(invoice._id, { totalAmount: newTotal });
    } catch {
      // best effort, invoice sync failure shouldn't block the order action
    }
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (!createForm.serviceId || !createForm.bookingId) {
      showFeedback('warning', 'Please select a service and a booking.');
      return;
    }
    setSaving(true);
    try {
      const service = serviceById[createForm.serviceId];
      const basePrice = service?.price || 0;
      const quantity = Number(createForm.quantity) || 1;
      const totalPrice = basePrice * quantity;
      await dashboardApi.createServiceOrder({
        serviceId: createForm.serviceId,
        bookingId: createForm.bookingId,
        notes: createForm.notes,
        quantity,
        totalPrice
      });
      await adjustInvoiceForBooking(createForm.bookingId, totalPrice);
      setCreateModal(false);
      setCreateForm({ serviceId: '', bookingId: '', notes: '', quantity: 1 });
      showFeedback('success', 'Service order created and added to the invoice.');
      await loadAll();
    } catch (error) {
      showFeedback('danger', `Could not create service order: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptOrder = async (order) => {
    setActionLoading((prev) => ({ ...prev, [orderId(order)]: 'accept' }));
    try {
      await dashboardApi.updateServiceOrder(orderId(order), {
        status: 'InProgress',
        assignedEmployeeId: currentEmployee?.id
      });
      showFeedback('success', 'Order accepted and now in progress.');
      await loadAll();
    } catch (error) {
      showFeedback('danger', `Could not accept order: ${getApiErrorMessage(error)}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId(order)]: null }));
    }
  };

  const handleCompleteOrder = async (order) => {
    const assignedId = order.assignedEmployeeId?._id || order.assignedEmployeeId;
    if (assignedId && currentEmployee?.id && String(assignedId) !== String(currentEmployee.id)) {
      showFeedback('warning', 'Only the employee who accepted this order can mark it complete.');
      return;
    }
    setActionLoading((prev) => ({ ...prev, [orderId(order)]: 'complete' }));
    try {
      await dashboardApi.updateServiceOrder(orderId(order), { status: 'Completed' });
      showFeedback('success', 'Order marked as completed.');
      await loadAll();
    } catch (error) {
      showFeedback('danger', `Could not complete order: ${getApiErrorMessage(error)}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId(order)]: null }));
    }
  };

  const handleCancelOrder = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { service, booking } = enrich(selectedOrder);
      const price = selectedOrder.totalPrice ?? service?.price ?? 0;
      await dashboardApi.updateServiceOrder(orderId(selectedOrder), {
        status: 'Cancelled',
        cancelReason
      });
      const bookingIdValue = booking?._id || bookingRef(selectedOrder);
      if (price && bookingIdValue) await adjustInvoiceForBooking(bookingIdValue, -price);
      setCancelModal(false);
      setCancelReason('');
      showFeedback('success', 'Order cancelled and invoice adjusted.');
      await loadAll();
    } catch (error) {
      showFeedback('danger', `Could not cancel order: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteServiceOrder(orderId(selectedOrder));
      setDeleteModal(false);
      showFeedback('success', 'Order deleted successfully.');
      await loadAll();
    } catch (error) {
      showFeedback('danger', `Could not delete order: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    inProgress: orders.filter((o) => o.status === 'InProgress').length,
    completed: orders.filter((o) => o.status === 'Completed').length
  }), [orders]);

  const selectedService = createForm.serviceId ? serviceById[createForm.serviceId] : null;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Page Header */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faConciergeBell} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Service Orders</h1>
                  <p className="text-muted mb-0">Create, track, and manage guest service requests.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-flex justify-content-lg-end gap-2">
              <Button variant="outline-secondary" onClick={loadAll} disabled={loading}>
                {loading
                  ? <Spinner size="sm" className="me-2" />
                  : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
                Refresh
              </Button>
              <Button variant="primary" onClick={() => setCreateModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                New Order
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Feedback */}
      {feedback && (
        <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />
      )}

      {/* Stats */}
      <Row className="g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">Total</p><h3 className="fw-bold mb-0">{stats.total}</h3></Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">Pending</p><h3 className="fw-bold mb-0">{stats.pending}</h3></Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">In Progress</p><h3 className="fw-bold mb-0">{stats.inProgress}</h3></Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">Completed</p><h3 className="fw-bold mb-0">{stats.completed}</h3></Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={5}>
              <h2 className="h5 fw-bold mb-1">Order Records</h2>
              <p className="text-muted mb-0">View, accept, complete, cancel, and delete orders.</p>
            </Col>
            <Col lg={7}>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Control
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by service or guest"
                  />
                </Col>
                <Col md={4}>
                  <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="All">All categories</option>
                    {serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All statuses</option>
                    {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <th>Service</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <Spinner size="sm" className="me-2" />Loading service orders...
                    </td>
                  </tr>
                )}

                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No service orders found.</td>
                  </tr>
                )}

                {!loading && filteredOrders.map((order) => {
                  const { service, guestName, roomNumber } = enrich(order);
                  const price = order.totalPrice ?? service?.price ?? 0;
                  const status = order.status || 'Pending';
                  const busy = actionLoading[orderId(order)];
                  const assignedId = order.assignedEmployeeId?._id || order.assignedEmployeeId;
                  const isMine = assignedId && currentEmployee?.id && String(assignedId) === String(currentEmployee.id);

                  return (
                    <tr key={orderId(order)}>
                      <td className="text-start">
                        <div className="d-flex align-items-center gap-2">
                          <span className="bg-primary-subtle text-primary rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <FontAwesomeIcon icon={categoryIcon(service?.category)} />
                          </span>
                          <div>
                            <div className="fw-semibold">{service?.name || '—'}</div>
                            <div className="small text-muted">{service?.category || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{guestName}</td>
                      <td>
                        <Badge bg="secondary">{roomNumber}</Badge>
                      </td>
                      <td className="fw-semibold">${Number(price).toLocaleString()}</td>
                      <td>
                        <Badge bg={statusVariant(status)}>{status}</Badge>
                      </td>
                      <td className="text-center">
                        <ButtonGroup size="sm">
                          <Button
                            variant="outline-secondary"
                            onClick={() => { setSelectedOrder(order); setViewModal(true); }}
                            disabled={!!busy}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>

                          {status === 'Pending' && (
                            <Button
                              variant="outline-success"
                              onClick={() => handleAcceptOrder(order)}
                              disabled={!!busy}
                            >
                              {busy === 'accept' ? <Spinner size="sm" /> : <FontAwesomeIcon icon={faCheck} />}
                            </Button>
                          )}

                          {status === 'InProgress' && (
                            <Button
                              variant="outline-primary"
                              onClick={() => handleCompleteOrder(order)}
                              disabled={!!busy || (assignedId && !isMine)}
                              title={assignedId && !isMine ? 'Only the assigned employee can complete this order' : 'Mark as completed'}
                            >
                              {busy === 'complete' ? <Spinner size="sm" /> : <FontAwesomeIcon icon={faFlagCheckered} />}
                            </Button>
                          )}

                          <Button
                            variant="outline-warning"
                            onClick={() => { setSelectedOrder(order); setCancelReason(''); setCancelModal(true); }}
                            disabled={status === 'Completed' || status === 'Cancelled' || !!busy}
                          >
                            <FontAwesomeIcon icon={faBan} />
                          </Button>

                          <Button
                            variant="outline-danger"
                            onClick={() => { setSelectedOrder(order); setDeleteModal(true); }}
                            disabled={!!busy}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <Modal show={createModal} onHide={() => setCreateModal(false)} centered>
        <Form onSubmit={handleCreateOrder}>
          <Modal.Header closeButton><Modal.Title>New Service Order</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Service</Form.Label>
                <Form.Select
                  required
                  value={createForm.serviceId}
                  onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category}) — ${s.price ?? 0}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                />
              </Col>
              <Col md={8} className="d-flex align-items-end">
                {selectedService && (
                  <Form.Text className="text-primary mb-0">
                    Base price: ${Number(selectedService.price || 0).toLocaleString()} × {Number(createForm.quantity) || 1} ={' '}
                    <strong>${(Number(selectedService.price || 0) * (Number(createForm.quantity) || 1)).toLocaleString()}</strong>{' '}
                    — will be added to the booking invoice.
                  </Form.Text>
                )}
              </Col>
              <Col md={12}>
                <Form.Label>Booking</Form.Label>
                <Form.Select
                  required
                  value={createForm.bookingId}
                  onChange={(e) => setCreateForm({ ...createForm, bookingId: e.target.value })}
                >
                  <option value="">Select a booking</option>
                  {bookings.map((b) => {
                    const guest = b.guestId || b.guest || {};
                    const guestLabel = guest?.fullName || guest?.name
                      || (guest?.firstName ? `${guest.firstName} ${guest.lastName || ''}`.trim() : b._id);
                    const room = b.roomId?.number || b.room?.number || b.roomNumber || '?';
                    return <option key={b._id} value={b._id}>Room {room} — {guestLabel}</option>;
                  })}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Any special instructions"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setCreateModal(false)}>Close</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal show={cancelModal} onHide={() => setCancelModal(false)} centered>
        <Form onSubmit={handleCancelOrder}>
          <Modal.Header closeButton><Modal.Title>Cancel Service Order</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Label>Cancel Reason</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Write the cancel reason"
            />
            <Form.Text className="text-muted">
              The service price will be removed from the linked booking invoice.
            </Form.Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setCancelModal(false)}>Close</Button>
            <Button variant="warning" type="submit" disabled={saving}>
              {saving ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal show={viewModal} onHide={() => setViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Service Order Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedOrder && (() => {
            const { service, guestName, roomNumber } = enrich(selectedOrder);
            const price = selectedOrder.totalPrice ?? service?.price ?? 0;
            return (
              <div className="d-flex flex-column gap-2">
                <div><strong>Service:</strong> {service?.name || '—'}</div>
                <div><strong>Category:</strong> {service?.category || '—'}</div>
                <div><strong>Guest:</strong> {guestName}</div>
                <div><strong>Room:</strong> {roomNumber}</div>
                <div><strong>Quantity:</strong> {selectedOrder.quantity ?? 1}</div>
                <div><strong>Total Price:</strong> ${Number(price).toLocaleString()}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <Badge bg={statusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                {selectedOrder.assignedEmployeeId && (
                  <div>
                    <strong>Assigned To:</strong>{' '}
                    {selectedOrder.assignedEmployeeId?.fullName || selectedOrder.assignedEmployeeId?.name || String(selectedOrder.assignedEmployeeId)}
                  </div>
                )}
                {selectedOrder.notes && (
                  <div><strong>Notes:</strong> {selectedOrder.notes}</div>
                )}
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Service Order</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this service order? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDeleteOrder} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ServiceOrdersPage;