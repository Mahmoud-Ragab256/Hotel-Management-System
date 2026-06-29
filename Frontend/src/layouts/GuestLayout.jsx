import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';

function GuestLayout() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <main className="flex-grow-1 dashboard-content">
        <Topbar />
        <Container fluid className="py-4 px-4">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default GuestLayout;
