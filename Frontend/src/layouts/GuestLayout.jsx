import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import useAdminShortcut from '../utils/AdminShortcut.jsx';

function GuestLayout() {
  useAdminShortcut();

  return (
    <div className="min-vh-100 bg-light">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default GuestLayout;
