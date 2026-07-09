import { Navigate, Route, Routes } from 'react-router-dom';
import GuestLayout from './layouts/GuestLayout.jsx';
import ClientExplorePage from './pages/ClientExplorePage.jsx';
import ClientRoomsPage from './pages/ClientRoomsPage.jsx';
import RoomDetailsPage from './pages/RoomDetailsPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ClientServicesPage from './pages/ClientServicesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GuestLoginPage from './pages/GuestLoginPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ServiceOrdersPage from './pages/ServiceOrdersPage.jsx';
import HelpCenterPage from './pages/HelpCenterPage.jsx';
import GuestsReviewsPage from './pages/GuestsReviewsPage.jsx';
import BookStayPage from './pages/BookStayPage.jsx';

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
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import MyInvoicesPage from './pages/MyInvoicesPage.jsx';
import MyRoomsPage from './pages/MyRoomsPage.jsx';
import OrderServicePage from "./pages/OrderServicePage";







const DASHBOARD_ROLES = ['Admin', 'Manager', 'Receptionist', 'Service'];
const ADMIN_MANAGER_ROLES = ['Admin', 'Manager'];
const OPERATIONS_ROLES = ['Admin', 'Manager', 'Receptionist'];
const ROOM_ROLES = ['Admin', 'Manager', 'Receptionist'];
const SERVICE_ROLES = ['Admin', 'Manager', 'Service'];

const dashboardOnly = (element, allowedRoles = DASHBOARD_ROLES) => (
  <ProtectedRoute
    redirectTo="/dashboard/login"
    unauthorizedRedirectTo="/dashboard"
    allowedAccountTypes={["dashboard"]}
    allowedRoles={allowedRoles}
  >
    {element}
  </ProtectedRoute>
);


function App() {
  return (
    <Routes>

      <Route path="/dashboard/login" element={<LoginPage />} />
      <Route path="/dashboard/forgot-password" element={<ResetPasswordPage accountType="employee" />} />
      <Route path="/login" element={<GuestLoginPage />} />
      <Route path="/guest-login" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<ResetPasswordPage accountType="guest" />} />
      <Route path="/signup" element={<SignupPage />} />


      <Route path="/" element={<GuestLayout />}>
        <Route index element={<ClientExplorePage />} />
        <Route path="services" element={<ClientServicesPage />} />
        <Route path="help-center" element={<HelpCenterPage />} />
        <Route path="reviews" element={<GuestsReviewsPage />} />
        <Route path="rooms" element={<ClientRoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailsPage />} />
        <Route path="book-stay" element={<BookStayPage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute
            redirectTo="/login"
            unauthorizedRedirectTo="/dashboard"
            allowedAccountTypes={["guest"]}
          />
        )}
      >
        <Route path="/profile" element={<GuestLayout />}>
          <Route index element={<ProfilePage />} />

          <Route path="service-orders" element={<ServiceOrdersPage />} />

        </Route>

        <Route path="/my-bookings" element={<GuestLayout />}>
          <Route index element={<MyBookingsPage />} />

        </Route>

        <Route path="/my-rooms" element={<GuestLayout />}>
          <Route index element={<MyRoomsPage />} />
        </Route>

        <Route path="/my-invoices" element={<GuestLayout />}>
          <Route index element={<MyInvoicesPage />} />
        </Route>

        <Route path="/order-service" element={<GuestLayout />}>
          <Route index element={<OrderServicePage />} />
        </Route>

      </Route>

      <Route
        element={(
          <ProtectedRoute
            redirectTo="/dashboard/login"
            unauthorizedRedirectTo="/"
            allowedAccountTypes={["dashboard"]}
          />
        )}
      >

        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={dashboardOnly(<DashboardPage />)} />
          <Route path="bookings" element={dashboardOnly(<BookingsPage />, OPERATIONS_ROLES)} />
          <Route path="rooms" element={dashboardOnly(<RoomsPage />, ROOM_ROLES)} />
          <Route path="room-categories" element={dashboardOnly(<RoomCategoriesPage />, ADMIN_MANAGER_ROLES)} />
          <Route path="guests" element={dashboardOnly(<GuestsPage />, OPERATIONS_ROLES)} />
          <Route path="employees" element={dashboardOnly(<EmployeesPage />, ADMIN_MANAGER_ROLES)} />
          <Route path="invoices" element={dashboardOnly(<InvoicesPage />, OPERATIONS_ROLES)} />
          <Route path="services" element={dashboardOnly(<ServicesPage />, SERVICE_ROLES)} />
          <Route path="services/add" element={dashboardOnly(<AddServicePage />, SERVICE_ROLES)} />
          <Route path="service-orders" element={dashboardOnly(<ServiceOrdersPage />, SERVICE_ROLES)} />
          <Route path="reviews" element={dashboardOnly(<ReviewsPage />, OPERATIONS_ROLES)} />
          <Route path="reviews/:id" element={dashboardOnly(<ReviewDetailsPage />, OPERATIONS_ROLES)} />
          <Route path="notifications" element={dashboardOnly(<NotificationsPage />)} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
