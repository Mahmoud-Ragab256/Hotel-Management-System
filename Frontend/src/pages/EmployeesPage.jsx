import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Image,
  Modal,
  Row,
  Spinner,
  Table
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faEye,
  faImage,
  faMoon,
  faPenToSquare,
  faPlus,
  faRefresh,
  faTrash,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import FeedbackCard from '../components/FeedbackCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { dashboardApi, getApiErrorMessage } from '../services/api.js';

const roles = ['Admin', 'Manager', 'Receptionist', 'Service'];
const shifts = ['Morning', 'Evening', 'Night'];

const initialCreateForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'Receptionist',
  shift: 'Morning',
  salary: ''
};

const initialEditForm = {
  fullName: '',
  role: 'Receptionist',
  shift: 'Morning',
  salary: '',
  isActive: true
};

const employeeId = (employee) => employee?._id || employee?.id || '';

const roleVariant = (role = '') => {
  if (role === 'Admin') return 'danger';
  if (role === 'Manager') return 'primary';
  if (role === 'Receptionist') return 'info';
  return 'secondary';
};

const shiftVariant = (shift = '') => {
  if (shift === 'Morning') return 'warning';
  if (shift === 'Evening') return 'success';
  if (shift === 'Night') return 'dark';
  return 'secondary';
};

const fullAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${base}/${path.replace(/^\//, '')}`;
};

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  const showFeedback = (type, message) => setFeedback({ type, message });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getEmployees();
      setEmployees(data);
    } catch (error) {
      showFeedback('danger', `Could not read employees: ${getApiErrorMessage(error)}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const target = `${employee.fullName || ''} ${employee.email || ''} ${employee.role || ''} ${employee.shift || ''}`.toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || employee.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, search, roleFilter]);

  const counts = useMemo(() => ({
    total: employees.length,
    active: employees.filter((employee) => employee.isActive !== false).length,
    managers: employees.filter((employee) => employee.role === 'Manager').length
  }), [employees]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setCreateForm(initialCreateForm);
    setAvatarFile(null);
    setFormModal(true);
  };

  const openEdit = async (employee) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getEmployee(employeeId(employee));
      const source = data || employee;
      setSelectedEmployee(source);
      setEditForm({
        fullName: source.fullName || '',
        role: source.role || 'Receptionist',
        shift: source.shift || 'Morning',
        salary: source.salary ?? '',
        isActive: source.isActive !== false
      });
      setAvatarFile(null);
      setModalMode('edit');
      setFormModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read employee details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openView = async (employee) => {
    setSaving(true);
    try {
      const data = await dashboardApi.getEmployee(employeeId(employee));
      setSelectedEmployee(data || employee);
      setViewModal(true);
    } catch (error) {
      showFeedback('danger', `Could not read employee details: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const openAvatar = async (employee) => {
    setSelectedEmployee(employee);
    setAvatarUrl('');
    setSaving(true);
    try {
      const avatar = await dashboardApi.getEmployeeAvatar(employeeId(employee));
      setAvatarUrl(fullAssetUrl(avatar));
      setAvatarModal(true);
    } catch (error) {
      setAvatarModal(true);
      showFeedback('warning', `Could not read employee avatar: ${getApiErrorMessage(error)}`);
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
          role: createForm.role,
          shift: createForm.shift,
          salary: Number(createForm.salary)
        };
        await dashboardApi.createEmployee(payload);
        showFeedback('success', 'Employee created successfully.');
      } else {
        const payload = {
          fullName: editForm.fullName,
          role: editForm.role,
          shift: editForm.shift,
          salary: Number(editForm.salary),
          isActive: editForm.isActive
        };
        await dashboardApi.updateEmployee(employeeId(selectedEmployee), payload, avatarFile);
        showFeedback('success', 'Employee updated successfully.');
      }

      setFormModal(false);
      await loadEmployees();
    } catch (error) {
      showFeedback('danger', `Could not save employee: ${getApiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await dashboardApi.deleteEmployee(employeeId(selectedEmployee));
      setDeleteModal(false);
      showFeedback('success', 'Employee deleted successfully.');
      await loadEmployees();
    } catch (error) {
      showFeedback('danger', `Could not delete employee: ${getApiErrorMessage(error)}`);
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
                  <FontAwesomeIcon icon={faUserTie} />
                </span>
                <div>
                  <h1 className="h3 fw-bold mb-1">Employees</h1>
                  <p className="text-muted mb-0">Employee CRUD uses the existing backend endpoints, including avatar read and update.</p>
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              <Button variant="outline-secondary" className="me-2" onClick={loadEmployees} disabled={loading}>
                <FontAwesomeIcon icon={faRefresh} className="me-2" />Refresh
              </Button>
              <Button onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add Employee
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {feedback && <FeedbackCard feedback={feedback} onClose={() => setFeedback(null)} />}

      <Row className="g-3">
        <Col md={4}><StatCard title="Total Employees" value={counts.total} description="Loaded from backend" icon={faUserTie} variant="primary" /></Col>
        <Col md={4}><StatCard title="Active Employees" value={counts.active} description="isActive is not false" icon={faBriefcase} variant="success" /></Col>
        <Col md={4}><StatCard title="Managers" value={counts.managers} description="Role summary" icon={faMoon} variant="info" /></Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-4 pb-0">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <h2 className="h5 fw-bold mb-1">Employee Records</h2>
              <p className="text-muted mb-0">Email and password are only sent on create, matching the backend contract.</p>
            </Col>
            <Col lg={6}>
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, role, or shift" />
                </Col>
                <Col md={5}>
                  <Form.Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                    <option value="All">All roles</option>
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
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
                  <th>Role</th>
                  <th>Shift</th>
                  <th>Salary</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="7" className="py-4"><Spinner size="sm" className="me-2" />Loading employees...</td></tr>}
                {!loading && filteredEmployees.length === 0 && <tr><td colSpan="7" className="text-muted py-4">No employees found.</td></tr>}
                {!loading && filteredEmployees.map((employee) => (
                  <tr key={employeeId(employee)}>
                    <td className="fw-semibold">{employee.fullName || '-'}</td>
                    <td>{employee.email || '-'}</td>
                    <td><Badge bg={roleVariant(employee.role)}>{employee.role || '-'}</Badge></td>
                    <td><Badge bg={shiftVariant(employee.shift)}>{employee.shift || '-'}</Badge></td>
                    <td>{employee.salary !== undefined ? `$${employee.salary}` : '-'}</td>
                    <td><Badge bg={employee.isActive !== false ? 'success' : 'secondary'}>{employee.isActive !== false ? 'Active' : 'Inactive'}</Badge></td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={() => openView(employee)}><FontAwesomeIcon icon={faEye} /></Button>
                        <Button variant="outline-info" onClick={() => openAvatar(employee)}><FontAwesomeIcon icon={faImage} /></Button>
                        <Button variant="outline-primary" onClick={() => openEdit(employee)}><FontAwesomeIcon icon={faPenToSquare} /></Button>
                        <Button variant="outline-danger" onClick={() => { setSelectedEmployee(employee); setDeleteModal(true); }}><FontAwesomeIcon icon={faTrash} /></Button>
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
          <Modal.Header closeButton><Modal.Title>{modalMode === 'create' ? 'Add Employee' : 'Edit Employee'}</Modal.Title></Modal.Header>
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
                <Form.Label>Role</Form.Label>
                <Form.Select value={activeForm.role} onChange={(event) => setActiveForm({ ...activeForm, role: event.target.value })}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Shift</Form.Label>
                <Form.Select value={activeForm.shift} onChange={(event) => setActiveForm({ ...activeForm, shift: event.target.value })}>
                  {shifts.map((shift) => <option key={shift} value={shift}>{shift}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Salary</Form.Label>
                <Form.Control required type="number" min="0" value={activeForm.salary} onChange={(event) => setActiveForm({ ...activeForm, salary: event.target.value })} />
              </Col>
              {modalMode === 'edit' && (
                <>
                  <Col md={6}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={editForm.isActive ? 'true' : 'false'} onChange={(event) => setEditForm({ ...editForm, isActive: event.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Form.Select>
                  </Col>
                  <Col md={12}>
                    <Form.Label>Avatar File</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
                    <small className="text-muted">Sent through PUT /dashboard/employees/:id as avatar multipart field.</small>
                  </Col>
                </>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setFormModal(false)}>Close</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Employee'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={viewModal} onHide={() => setViewModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Employee Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <div className="d-flex flex-column gap-2">
              <div><strong>ID:</strong> {employeeId(selectedEmployee)}</div>
              <div><strong>Full Name:</strong> {selectedEmployee.fullName}</div>
              <div><strong>Email:</strong> {selectedEmployee.email}</div>
              <div><strong>Role:</strong> <Badge bg={roleVariant(selectedEmployee.role)}>{selectedEmployee.role}</Badge></div>
              <div><strong>Shift:</strong> <Badge bg={shiftVariant(selectedEmployee.shift)}>{selectedEmployee.shift}</Badge></div>
              <div><strong>Salary:</strong> ${selectedEmployee.salary}</div>
              <div><strong>Status:</strong> {selectedEmployee.isActive !== false ? 'Active' : 'Inactive'}</div>
              <div><strong>Avatar:</strong> {selectedEmployee.avatar || '-'}</div>
              <div><strong>Created At:</strong> {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleString() : 'N/A'}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setViewModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={avatarModal} onHide={() => setAvatarModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Employee Avatar</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          {avatarUrl ? (
            <Image src={avatarUrl} thumbnail className="mw-100" alt="Employee avatar" />
          ) : (
            <p className="text-muted mb-0">No avatar found for this employee.</p>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setAvatarModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Employee</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this employee?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EmployeesPage;
