import {
  faUser,
  faCalendarCheck,
  faDoorOpen,
  faConciergeBell,
  faFileInvoiceDollar,
  // faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";


  const menuItems = [
    { label: "Profile", icon: faUser, path: "/profile?tab=profile" },
    { label: "My Rooms", icon: faDoorOpen, path: "/profile?tab=rooms" },
    { label: "Order a service", icon: faConciergeBell, path: "/order-service" },
    { label: "My Bookings", icon: faCalendarCheck, path: "/profile?tab=bookings" },
    { label: "My Invoices", icon: faFileInvoiceDollar, path: "/profile?tab=invoices" },
  ];

  export default menuItems;