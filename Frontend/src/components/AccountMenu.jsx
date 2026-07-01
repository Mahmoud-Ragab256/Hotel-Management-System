import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faRightFromBracket,
  faStar,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { clearClientSession, getClientUser } from '../services/auth.js';
import '../styles/accountMenu.css';

const clientMenuItems = [
  { label: 'Profile', icon: faUser, path: '/profile' },
  { label: 'My Bookings', icon: faCalendarCheck, path: '/my-bookings' },
  { label: 'Add Review', icon: faStar, path: '/reviews/new' }
];

const AccountMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getClientUser());

  useEffect(() => {
    const handleUserUpdate = () => setUser(getClientUser());

    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('hotel_client_user_updated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('hotel_client_user_updated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    clearClientSession();
    navigate('/', { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : null;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
        id="client-account-menu-toggle"
        className="d-flex align-items-center px-3 py-2 account-menu-toggle"
        style={{ minWidth: 220 }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName || 'Guest'}
            className="rounded-circle"
            style={{ width: 36, height: 36, objectFit: 'cover', marginRight: 8 }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-dark text-white fw-bold"
            style={{ width: 36, height: 36, marginRight: 8, fontSize: 12 }}
          >
            {initials || <FontAwesomeIcon icon={faUser} />}
          </div>
        )}

        <div className="d-flex flex-column text-start lh-sm">
          <span className="fw-semibold">{user?.fullName || 'Guest Account'}</span>
          {user?.email && <span className="text-muted small">{user.email}</span>}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm account-menu-dropdown" style={{ minWidth: 220 }}>
        {clientMenuItems.map((item) => (
          <Dropdown.Item
            key={item.path}
            onClick={() => navigate(item.path)}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={item.icon} className="text-muted" />
            {item.label}
          </Dropdown.Item>
        ))}

        <Dropdown.Divider />

        <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2 text-danger">
          <FontAwesomeIcon icon={faRightFromBracket} />
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountMenu;
