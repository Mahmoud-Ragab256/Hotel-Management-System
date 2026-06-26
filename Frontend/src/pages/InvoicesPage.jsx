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
  faFileInvoiceDollar,
  faEye,
  faPenToSquare,
  faRefresh,
  faTrash,
  faDollarSign,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const invoiceStatuses = ['Pending', 'Paid', 'Cancelled'];
const paymentMethods = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'Mobile'];

const initialEditForm = {
  status: 'Pending',
  method: 'Cash',
  paidAmount: ''
};

const statusVariant = (status = '') => {
  if (status === 'Paid') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Cancelled') return 'danger';
  return 'secondary';
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const invoiceId = (invoice) => invoice?._id || invoice?.id || '';
const bookingRef = (invoice) => invoice?.bookingId?._id || invoice?.bookingId || 'N/A';
const employeeName = (invoice) => invoice?.employeeId?.fullName || invoice?.employeeId || '—';

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

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [editForm, setEditForm] = useState(initialEditForm);
  const [payForm, setPayForm] = useState({ paidAmount: '', method: 'Cash' });

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      showFeedback('danger', `Could not load invoices: ${getApiErrorMessage(error)}`);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const ref = typeof bookingRef(invoice) === 'string' ? bookingRef(invoice) : '';
      const target = `${ref} ${invoiceId(invoice)} ${employeeName(invoice)}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const loadInvoiceDetails = async (invoice, mode) => {
    const id = invoiceId(invoice);
    setSelectedInvoice(invoice);
    setDetailsLoading(true);

    try {
      const data = await dashboardApi.getInvoice(id);
      setSelectedInvoice(data || invoice);

      if (mode === 'view') {
        setViewModal(true);
      }

      if (mode === 'edit') {
        const source = data || invoice;
        setEditForm({
          status: source.status || 'Pending',
          method: source.method || 'Cash',
          paidAmount: source.paidAmount ?? ''
        });
        setEditModal(true);
      }
    } catch (error) {
      showFeedback('danger', `Could not load invoice details: ${getApiErrorMessage(error)}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateInvoice = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        paidAmount: Number(editForm.paidAmount)
      };
      await dashboardApi.updateInvoice(invoiceId(selectedInvoice), payload);
      setEditModal(false);
      showFeedback('success', 'Invoice updated successfully.');
      await loadInvoices();
    } catch (error) {
      showFeedback('danger', `Could not update invoice: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePayInvoice = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await dashboardApi.updateInvoice(invoiceId(selectedInvoice), {
        status: 'Paid',
        paidAmount: Number(payForm.paidAmount),
        method: payForm.method
      });
      setPayModal(false);
      showFeedback('success', 'Invoice marked as paid.');
      await loadInvoices();
    } catch (error) {
      showFeedback('danger', `Could not process payment: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteInvoice(invoiceId(selectedInvoice));
      setDeleteModal(false);
      showFeedback('success', 'Invoice deleted successfully.');
      await loadInvoices();
    } catch (error) {
      showFeedback('danger', `Could not delete invoice: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === 'Paid').length,
    pending: invoices.filter((inv) => inv.status === 'Pending').length,
    cancelled: invoices.filter((inv) => inv.status === 'Cancelled').length
  }), [invoices]);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Page Header */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col lg={7}>
              <div className="d-flex align-items-center gap-3">
                <span className="stat-icon bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Invoices</h1>
                  <p className="text-muted mb-0">View, update, cancel, and delete invoices linked to bookings.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-flex justify-content-lg-end">
              <Button variant="outline-secondary" onClick={loadInvoices} disabled={loading}>
                {loading
                  ? <Spinner size="sm" className="me-2" />
                  : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
                Refresh
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
            <Card.Body><p className="text-muted mb-1">Paid</p><h3 className="fw-bold mb-0">{stats.paid}</h3></Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">Pending</p><h3 className="fw-bold mb-0">{stats.pending}</h3></Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body><p className="text-muted mb-1">Cancelled</p><h3 className="fw-bold mb-0">{stats.cancelled}</h3></Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Invoice Records</h2>
              <p className="text-muted mb-0">Read, update, cancel, and delete invoices.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by booking ID or invoice ID"
                  />
                </Col>
                <Col md={5}>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All statuses</option>
                    {invoiceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <th>Invoice ID</th>
                  <th>Booking ID</th>
                  <th>Employee</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Issued At</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <Spinner size="sm" className="me-2" />Loading invoices...
                    </td>
                  </tr>
                )}

                {!loading && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">No invoices found.</td>
                  </tr>
                )}

                {!loading && filteredInvoices.map((invoice) => (
                  <tr key={invoiceId(invoice)}>
                    <td className="fw-semibold">{invoiceId(invoice).slice(-8)}</td>
                    <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {typeof bookingRef(invoice) === 'string' ? bookingRef(invoice).slice(-8) : 'N/A'}
                    </td>
                    <td>{employeeName(invoice)}</td>
                    <td className="fw-semibold">${Number(invoice.totalAmount || 0).toLocaleString()}</td>
                    <td>${Number(invoice.paidAmount || 0).toLocaleString()}</td>
                    <td>
                      <Badge bg="secondary" className="text-capitalize">{invoice.method || '—'}</Badge>
                    </td>
                    <td>
                      <Badge bg={statusVariant(invoice.status)}>{invoice.status || 'Pending'}</Badge>
                    </td>
                    <td>{formatDate(invoice.issuedAt)}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-secondary"
                          onClick={() => loadInvoiceDetails(invoice, 'view')}
                          disabled={detailsLoading}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          variant="outline-primary"
                          onClick={() => loadInvoiceDetails(invoice, 'edit')}
                          disabled={invoice.status === 'Cancelled'}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                        <Button
                          variant="outline-success"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPayForm({ paidAmount: invoice.totalAmount ?? '', method: invoice.method || 'Cash' });
                            setPayModal(true);
                          }}
                          disabled={invoice.status === 'Paid' || invoice.status === 'Cancelled'}
                        >
                          <FontAwesomeIcon icon={faDollarSign} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => { setSelectedInvoice(invoice); setDeleteModal(true); }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)} centered size="lg">
        <Form onSubmit={handleUpdateInvoice}>
          <Modal.Header closeButton><Modal.Title>Edit Invoice</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  {invoiceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={editForm.method}
                  onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                >
                  {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.paidAmount}
                  onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal show={viewModal} onHide={() => setViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Invoice Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div className="d-flex flex-column gap-2">
              <div><strong>Invoice ID:</strong> {invoiceId(selectedInvoice)}</div>
              <div>
                <strong>Booking ID:</strong>{' '}
                <span style={{ fontFamily: 'monospace' }}>
                  {typeof bookingRef(selectedInvoice) === 'string' ? bookingRef(selectedInvoice) : 'N/A'}
                </span>
              </div>
              <div><strong>Employee:</strong> {employeeName(selectedInvoice)}</div>
              <div><strong>Total Amount:</strong> ${Number(selectedInvoice.totalAmount || 0).toLocaleString()}</div>
              <div><strong>Paid Amount:</strong> ${Number(selectedInvoice.paidAmount || 0).toLocaleString()}</div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge bg={statusVariant(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
              </div>
              <div><strong>Payment Method:</strong> {selectedInvoice.method || 'N/A'}</div>
              <div><strong>Issued At:</strong> {formatDate(selectedInvoice.issuedAt)}</div>
              <div><strong>Created At:</strong> {formatDate(selectedInvoice.createdAt)}</div>
              <div><strong>Updated At:</strong> {formatDate(selectedInvoice.updatedAt)}</div>
              {selectedInvoice.attachments?.length > 0 && (
                <div>
                  <strong>Attachments:</strong>{' '}
                  {selectedInvoice.attachments.map((att, i) => (
                    <a key={i} href={att} target="_blank" rel="noreferrer" className="me-2">
                      File {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Pay Modal */}
      <Modal show={payModal} onHide={() => setPayModal(false)} centered>
        <Form onSubmit={handlePayInvoice}>
          <Modal.Header closeButton><Modal.Title>Process Payment</Modal.Title></Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                >
                  {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={payForm.paidAmount}
                  onChange={(e) => setPayForm({ ...payForm, paidAmount: e.target.value })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setPayModal(false)}>Close</Button>
            <Button type="submit" variant="success" disabled={saving}>
              {saving ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Invoice</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this invoice? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDeleteInvoice} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InvoicesPage;