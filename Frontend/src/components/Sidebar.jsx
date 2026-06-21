import { Badge, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel } from '@fortawesome/free-solid-svg-icons';
import { sidebarItems } from '../data/sidebarItems.js';

function Sidebar() {
  return (
    <aside className="app-sidebar text-white d-flex flex-column">
      <div className="px-4 py-4 border-bottom border-secondary-subtle">
        <div className="d-flex align-items-center gap-3">
          <span className="brand-icon d-inline-flex align-items-center justify-content-center rounded-3">
            <FontAwesomeIcon icon={faHotel} />
          </span>
          <div>
            <h1 className="h5 mb-0 fw-bold">Hotel Admin</h1>
            <small className="text-white-50">Management Panel</small>
          </div>
        </div>
      </div>

      <Nav className="flex-column gap-1 p-3 overflow-auto sidebar-nav">
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
