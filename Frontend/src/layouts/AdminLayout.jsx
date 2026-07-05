import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function AdminLayout() {
  const { isDark } = useTheme();

  return (
    <div className={`d-flex min-vh-100 admin-layout ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <Sidebar />
      <main className="flex-grow-1 dashboard-content d-flex flex-column" style={{ minWidth: 0 }}>
        <Topbar />
        <div className="flex-grow-1 overflow-auto">
          <Container fluid className="py-4 px-4">
            <Outlet />
          </Container>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
