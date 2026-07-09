import { useState } from 'react';
import { Button, Dropdown, Form, InputGroup, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBars,
  faBell,
  faMagnifyingGlass,
  faRightFromBracket,
  faUserShield,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { clearAuthSession, getCurrentUser } from '../services/auth.js';
import { useTheme } from '../context/ThemeContext.jsx';

function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = getCurrentUser('dashboard');
  const { isDark, toggleTheme } = useTheme();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    clearAuthSession('dashboard');
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <Navbar className="admin-topbar border-bottom px-3 px-md-4 py-3 sticky-top">
      <div className="d-flex align-items-center justify-content-between w-100 gap-3">
        {isSearchExpanded ? (
          <div className="d-flex align-items-center w-100 gap-2">
            <Button
              variant="light"
              className="topbar-btn border border-secondary-subtle"
              onClick={() => setIsSearchExpanded(false)}
              title="Back"
              id="mobile-search-back"
              style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ color: isDark ? '#ffffff' : '#c85a49', fontSize: '1.1rem' }} />
            </Button>
            <InputGroup className="flex-grow-1">
              <InputGroup.Text className="topbar-search-addon border-end-0">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </InputGroup.Text>
              <Form.Control
                className="topbar-search-input border-start-0"
                placeholder="Search admin panel..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
              />
            </InputGroup>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center gap-1 gap-sm-2 gap-md-3">
              <Button
                variant="light"
                className="topbar-btn border border-secondary-subtle d-lg-none"
                onClick={onToggleSidebar}
                title="Toggle Sidebar"
                id="mobile-sidebar-toggle"
                style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={faBars} style={{ color: isDark ? '#ffffff' : '#c85a49', fontSize: '1.1rem' }} />
              </Button>

              <div>
                <h2 className="h5 mb-0 fw-bold admin-topbar-title text-nowrap">Admin Panel</h2>
                <small className="text-muted d-none d-sm-block">Hotel operations management</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1 gap-sm-2 gap-md-3">
              <InputGroup className="topbar-search d-none d-md-flex">
                <InputGroup.Text className="topbar-search-addon border-end-0">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </InputGroup.Text>
                <Form.Control
                  className="topbar-search-input border-start-0"
                  placeholder="Search admin panel..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </InputGroup>

              {/* Mobile Search Button */}
              <Button
                variant="light"
                className="topbar-btn border border-secondary-subtle d-md-none"
                onClick={() => setIsSearchExpanded(true)}
                title="Search"
                id="mobile-search-toggle"
                style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: isDark ? '#ffffff' : '#c85a49', fontSize: '1.1rem' }} />
              </Button>

              <Button variant="light" className="topbar-btn border border-secondary-subtle" onClick={toggleTheme} title="Toggle Theme" style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} style={{ color: isDark ? '#fbbf24' : '#c85a49', fontSize: '1.1rem' }} />
              </Button>

              <Button variant="light" className="topbar-btn border border-secondary-subtle" style={{ width: '40px', height: '40px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBell} style={{ color: isDark ? '#ffffff' : '#c85a49' }} />
              </Button>

              <Dropdown align="end">
                <Dropdown.Toggle className="admin-profile-toggle">
                  <FontAwesomeIcon icon={faUserShield} />
                  <span className="d-none d-lg-inline">{user?.fullName || 'Admin'}</span>
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
          </>
        )}
      </div>
    </Navbar>
  );
}

export default Topbar;
