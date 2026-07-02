import { Navigate, Route, Routes } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout.jsx';
import ClientRoomsPage from './pages/ClientRoomsPage.jsx';
import RoomDetailsPage from './pages/RoomDetailsPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GuestLoginPage from './pages/GuestLoginPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ServiceOrdersPage from './pages/ServiceOrdersPage.jsx';

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
import ReviewsPage from './pages/ReviewsPage.jsx';
import ReviewDetailsPage from './pages/ReviewDetailsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/dashboard/login" element={<LoginPage />} />
      <Route path="/dashboard/forgot-password" element={<ResetPasswordPage accountType="employee" />} />
      <Route path="/login" element={<GuestLoginPage />} />
      <Route path="/guest-login" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<ResetPasswordPage accountType="guest" />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Public guest website: localhost:6501/ stays on / and does not redirect to /login */}
      <Route path="/" element={<GuestLayout />}>
        <Route index element={<ClientRoomsPage />} />
        <Route path="rooms" element={<ClientRoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailsPage />} />
      </Route>

      {/* Guest-only protected pages */}
      <Route element={<ProtectedRoute redirectTo="/login" />}>
        <Route path="/profile" element={<GuestLayout />}>
          <Route index element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Dashboard protected pages */}
      <Route element={<ProtectedRoute redirectTo="/dashboard/login" />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="room-categories" element={<RoomCategoriesPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/add" element={<AddServicePage />} />
          <Route path="service-orders" element={<ServiceOrdersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="reviews/:id" element={<ReviewDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
