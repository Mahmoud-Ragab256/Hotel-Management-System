import { Badge, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faXmark } from '@fortawesome/free-solid-svg-icons';
import { sidebarItems } from '../data/sidebarItems.js';

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`app-sidebar text-white d-flex flex-column ${isOpen ? 'show' : ''}`}>
      <div className="px-4 py-4 border-bottom border-secondary-subtle d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <span className="brand-icon d-inline-flex align-items-center justify-content-center rounded-3">
            <FontAwesomeIcon icon={faHotel} />
          </span>
          <div>
            <h1 className="h5 mb-0 fw-bold">Hotel Admin</h1>
            <small className="text-white-50">Management Panel</small>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn d-lg-none border-0 p-1 rounded-circle d-flex align-items-center justify-content-center"
            style={{
              color: 'inherit',
              opacity: 0.8,
              width: '32px',
              height: '32px',
              transition: 'all 0.2s ease'
            }}
            aria-label="Close sidebar"
            id="mobile-sidebar-close"
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '1.2rem' }} />
          </button>
        )}
      </div>

      <Nav className="flex-column gap-1 p-3 sidebar-nav">
        {sidebarItems.map((item) => {
          const content = (
            <>
              <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
              <span className="flex-grow-1">{item.label}</span>
              {!item.implemented && <Badge bg="secondary" className="fw-normal">Later</Badge>}
            </>
          );

          if (item.implemented) {
            return (
              <Nav.Link
                key={item.id}
                as={NavLink}
                to={item.path}
                end
                className="sidebar-link d-flex align-items-center gap-3 rounded-3 px-3 py-2"
              >
                {content}
              </Nav.Link>
            );
          }

          return (
            <Nav.Link
              key={item.id}
              href="#"
              aria-disabled="true"
              onClick={(event) => event.preventDefault()}
              className="sidebar-link sidebar-link-disabled d-flex align-items-center gap-3 rounded-3 px-3 py-2"
            >
              {content}
            </Nav.Link>
          );
        })}
      </Nav>
    </aside>
  );
}

export default Sidebar;
