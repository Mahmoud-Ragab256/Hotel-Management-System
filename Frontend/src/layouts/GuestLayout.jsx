import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import AccountMenu from '../components/AccountMenu.jsx';
import useAdminShortcut from '../utils/AdminShortcut.jsx';

function GuestLayout() {

  useAdminShortcut();

  return (
    <div className="d-flex min-vh-100 bg-light">
      <main className="flex-grow-1 dashboard-content">
        <Header />
        <Container fluid className="py-4 px-4">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default GuestLayout;
