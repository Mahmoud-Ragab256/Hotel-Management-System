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
  { id: 'dashboard', label: 'Dashboard', icon: faChartPie, path: '/dashboard', implemented: true }, 
  { id: 'bookings', label: 'Bookings', icon: faCalendarCheck, path: '/bookings', implemented: true },
  { id: 'rooms', label: 'Rooms', icon: faBed, path: '/rooms', implemented: true },
  { id: 'room-categories', label: 'Room Categories', icon: faLayerGroup, path: '/room-categories', implemented: true },
  { id: 'guests', label: 'Guests', icon: faUsers, path: '/guests', implemented: true },
  { id: 'employees', label: 'Employees', icon: faUserTie, path: '/employees', implemented: true },
  { id: 'invoices', label: 'Invoices', icon: faFileInvoiceDollar, path: '/invoices', implemented: true },
  { id: 'services', label: 'Services', icon: faBellConcierge, path: '#', implemented: false },
  { id: 'service-orders', label: 'Service Orders', icon: faClipboardList, path: '#', implemented: false },
  { id: 'reviews', label: 'Reviews', icon: faStar, path: '#', implemented: false },
  { id: 'notifications', label: 'Notifications', icon: faBell, path: '#', implemented: false }
];