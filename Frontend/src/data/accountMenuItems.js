import {
  faUser,
  faCalendarCheck,
  faDoorOpen,
  faConciergeBell,
  faFileInvoiceDollar,
  // faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";


  const menuItems = [
    { label: "Profile", icon: faUser, path: "/profile" },
    { label: "My Rooms", icon: faDoorOpen, path: "/my-rooms" },
    { label: "Order a service", icon: faConciergeBell, path: "/order-service" },
    { label: "My Bookings", icon: faCalendarCheck, path: "/my-bookings" },
    { label: "My Invoices", icon: faFileInvoiceDollar, path: "/my-invoices" },
  ];

  export default menuItems;