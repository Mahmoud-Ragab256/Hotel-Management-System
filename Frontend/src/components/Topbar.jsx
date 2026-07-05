import { Button, Dropdown, Form, InputGroup, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faMagnifyingGlass,
  faRightFromBracket,
  faUserShield,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { clearAuthSession, getCurrentUser } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

function Topbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <Navbar className="admin-topbar border-bottom px-4 py-3 sticky-top">
      <div className="d-flex align-items-center justify-content-between w-100 gap-3">
        <div>
          <h2 className="h5 mb-0 fw-bold admin-topbar-title">Admin Panel</h2>
          <small className="text-muted">Hotel operations management</small>
        </div>

        <div className="d-none d-lg-flex align-items-center gap-3">
          <InputGroup className="topbar-search">
            <InputGroup.Text className="topbar-search-addon border-end-0">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control className="topbar-search-input border-start-0" placeholder="Search admin panel..." />
          </InputGroup>

          <Button variant="light" className="border border-secondary-subtle" onClick={toggleTheme} title="Toggle Theme" style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} style={{ color: isDark ? '#fbbf24' : '#6b7280', fontSize: '1.1rem' }} />
          </Button>

          <Button variant="light" className="border border-secondary-subtle" style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faBell} />
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant={isDark ? 'dark' : 'dark'} className="d-flex align-items-center gap-2 px-3 py-2 border-0" style={{ background: isDark ? '#4f46e5' : '#1e293b' }}>
              <FontAwesomeIcon icon={faUserShield} />
              {user?.fullName || 'Admin'}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0">
              <Dropdown.Header>
                <div className="fw-semibold text-dark admin-dropdown-username">{user?.fullName || 'Admin User'}</div>
                <small className="admin-dropdown-email">{user?.email || 'Signed in'}</small>
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
