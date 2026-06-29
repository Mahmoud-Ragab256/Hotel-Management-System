import { Navigate, Route, Routes } from 'react-router-dom';
import ClientRoomsPage from './pages/ClientRoomsPage.jsx';
import RoomDetailsPage from './pages/RoomDetailsPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GuestLoginPage from './pages/GuestLoginPage.jsx';

import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import RoomsPage from './pages/RoomsPage.jsx';
import RoomCategoriesPage from './pages/RoomCategoriesPage.jsx';
import GuestsPage from './pages/GuestsPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import InvoicesPage from './pages/InvoicesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AddServicePage from './pages/AddServicePage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guest-login" element={<GuestLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/rooms" element={<ClientRoomsPage />} />
      <Route path="/rooms/:id" element={<RoomDetailsPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="room-categories" element={<RoomCategoriesPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/add" element={<AddServicePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
} 


export default App;



