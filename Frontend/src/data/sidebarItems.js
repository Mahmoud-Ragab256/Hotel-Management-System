import {
  faChartPie,
  faCalendarCheck,
  faBed,
  faLayerGroup,
  faUsers,
  faUserTie,
  faFileInvoiceDollar,
  faBellConcierge,
  faClipboardList,
  faStar,
  faBell
} from '@fortawesome/free-solid-svg-icons';

export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: faChartPie, path: 'dashboard/dashboard', implemented: true }, 
  { id: 'bookings', label: 'Bookings', icon: faCalendarCheck, path: 'dashboard/bookings', implemented: true },
  { id: 'rooms', label: 'Rooms', icon: faBed, path: 'dashboard/rooms', implemented: true },
  { id: 'room-categories', label: 'Room Categories', icon: faLayerGroup, path: 'dashboard/room-categories', implemented: true },
  { id: 'guests', label: 'Guests', icon: faUsers, path: 'dashboard/guests', implemented: true },
  { id: 'employees', label: 'Employees', icon: faUserTie, path: 'dashboard/employees', implemented: true },
  { id: 'invoices', label: 'Invoices', icon: faFileInvoiceDollar, path: 'dashboard/invoices', implemented: true },
  { id: 'services', label: 'Services', icon: faBellConcierge, path: 'dashboard/services', implemented: true },
  { id: 'service-orders', label: 'Service Orders', icon: faClipboardList, path: 'dashboard/service-orders', implemented: false },
  { id: 'reviews', label: 'Reviews', icon: faStar, path: 'dashboard/reviews', implemented: true },
  { id: 'notifications', label: 'Notifications', icon: faBell, path: 'dashboard/notifications', implemented: false }
];