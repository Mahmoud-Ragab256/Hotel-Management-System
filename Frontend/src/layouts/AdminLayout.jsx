import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function AdminLayout() {
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Automatically close sidebar when navigation/route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Scope portal modals inside admin pages
  useEffect(() => {
    document.body.classList.add('in-admin-layout');
    return () => {
      document.body.classList.remove('in-admin-layout');
    };
  }, []);

  return (
    <div className={`d-flex min-vh-100 admin-layout ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Backdrop overlay for mobile & tablet */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop d-lg-none" 
          onClick={() => setIsSidebarOpen(false)}
          id="mobile-sidebar-backdrop"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} isCollapsed={isCollapsed} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-grow-1 dashboard-content d-flex flex-column" style={{ minWidth: 0 }}>
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        <div className="flex-grow-1 overflow-auto">
          <Container fluid className="py-4 px-3 px-md-4">
            <Outlet />
          </Container>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
