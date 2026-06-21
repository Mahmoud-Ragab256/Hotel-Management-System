import { Button, Dropdown, Form, InputGroup, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faMagnifyingGlass,
  faRightFromBracket,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { clearAuthSession, getCurrentUser } from '../services/auth.js';

function Topbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <Navbar bg="white" className="border-bottom px-4 py-3 sticky-top">
      <div className="d-flex align-items-center justify-content-between w-100 gap-3">
        <div>
          <h2 className="h5 mb-0 fw-bold text-dark">Admin Panel</h2>
          <small className="text-muted">Hotel operations management</small>
        </div>

        <div className="d-none d-lg-flex align-items-center gap-3">
          <InputGroup className="topbar-search">
            <InputGroup.Text className="bg-light border-end-0">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control className="bg-light border-start-0" placeholder="Search admin panel..." />
          </InputGroup>

          <Button variant="light" className="border">
            <FontAwesomeIcon icon={faBell} />
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant="dark" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} />
              {user?.fullName || 'Admin'}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0">
              <Dropdown.Header>
                <div className="fw-semibold text-dark">{user?.fullName || 'Admin User'}</div>
                <small>{user?.email || 'Signed in'}</small>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2 text-danger">
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
}

export default Topbar;
