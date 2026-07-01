import { Navigate, Route, Routes } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ClientRoomsPage from './pages/ClientRoomsPage.jsx';
import ClientServicesPage from './pages/ClientServicesPage.jsx';
import ClientReviewsPage from './pages/ClientReviewsPage.jsx';
import ClientAddReviewPage from './pages/ClientAddReviewPage.jsx';
import ClientBookingsPage from './pages/ClientBookingsPage.jsx';
import ClientServiceOrderPage from './pages/ClientServiceOrderPage.jsx';
import HelpCenterPage from './pages/HelpCenterPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import RoomDetailsPage from './pages/RoomDetailsPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GuestLoginPage from './pages/GuestLoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ServiceOrdersPage from './pages/ServiceOrdersPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';

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

function App() {
  return (
    <Routes>
      <Route path="/dashboard/login" element={<LoginPage />} />
      <Route path="/dashboard/forgot-password" element={<PasswordResetPage accountType="employee" step="email" />} />
      <Route path="/dashboard/reset-code" element={<PasswordResetPage accountType="employee" step="code" />} />
      <Route path="/dashboard/reset-password" element={<PasswordResetPage accountType="employee" step="password" />} />

      <Route path="/login" element={<GuestLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<PasswordResetPage accountType="guest" step="email" />} />
      <Route path="/reset-code" element={<PasswordResetPage accountType="guest" step="code" />} />
      <Route path="/reset-password" element={<PasswordResetPage accountType="guest" step="password" />} />

      <Route path="/" element={<GuestLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="rooms" element={<ClientRoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailsPage />} />
        <Route path="services" element={<ClientServicesPage />} />
        <Route path="reviews" element={<ClientReviewsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="help-center" element={<HelpCenterPage />} />

        <Route element={<ProtectedRoute role="client" redirectTo="/login" />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-bookings" element={<ClientBookingsPage />} />
          <Route path="reviews/new" element={<ClientAddReviewPage />} />
          <Route path="service-order" element={<ClientServiceOrderPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" redirectTo="/dashboard/login" />}>
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
