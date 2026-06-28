import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Amenities from "./components/Amenities";
import FeaturedSuites from "./components/FeaturedSuites";
import GuestExperiences from "./components/GuestExperiences";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import SuiteDetailsModal from "./components/SuiteDetailsModal";
import LoginModal from "./components/LoginModal";
export default function App() {
  // Modal toggle states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSuiteDetailsOpen, setIsSuiteDetailsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Selected details
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Intent parameters for pre-filling Booking Modal
  const [bookingParams, setBookingParams] = useState({
    suiteId: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  // Enable HTML-level smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Set default dates when opening booking modal if empty
  const handleOpenBooking = (
    suiteId = "",
    checkIn = "",
    checkOut = "",
    guests = 2
  ) => {
    // Disabled for now as requested: "i dont nothing to appear yet when i click on book your stay"
  };

  const handleOpenSuiteDetails = (suite) => {
    setSelectedSuite(suite);
    setIsSuiteDetailsOpen(true);
  };

  const handleLoginSuccess = (name) => {
    setLoggedInUser(name);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="position-relative min-vh-100 bg-light d-flex flex-column justify-content-between overflow-x-hidden">
      
      {/* Navigation Bar */}
      <Navbar
        onBookNowClick={() => handleOpenBooking()}
        onLoginClick={() => setIsLoginOpen(true)}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        scrollToSection={scrollToSection}
      />

      {/* Main Sections */}
      <main className="flex-grow-1">
        
        {/* Hero Section (inc. Search availability bar) */}
        <Hero 
          onBookNowClick={handleOpenBooking} 
          scrollToSection={scrollToSection} 
        />

        {/* Floating Bar Spacer on small screens */}
        <div className="py-2 d-md-none" />

        {/* Services/Amenities Horizontal Grid */}
        <Amenities />

        {/* Featured Rooms / Suites */}
        <FeaturedSuites
          onViewDetails={handleOpenSuiteDetails}
          onBookNow={(suiteId) => handleOpenBooking(suiteId)}
        />

        {/* Testimonials and customer reviews */}
        <GuestExperiences />

      </main>

      {/* Footer */}
      <Footer />

      {/* INTERACTIVE MODALS */}
      
      {/* 1. Global Suite Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedSuiteId={bookingParams.suiteId}
        initialCheckIn={bookingParams.checkIn}
        initialCheckOut={bookingParams.checkOut}
        initialGuests={bookingParams.guests}
      />

      {/* 2. Detailed Suite Specs Modal */}
      <SuiteDetailsModal
        isOpen={isSuiteDetailsOpen}
        suite={selectedSuite}
        onClose={() => setIsSuiteDetailsOpen(false)}
        onBookNow={(suiteId) => handleOpenBooking(suiteId)}
      />

      {/* 3. Luxury Club Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
import React, { useState, useEffect } from "react";
// Add this import at the top
import { dashboardApi } from "../services/api";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Amenities from "./components/Amenities";
import FeaturedSuites from "./components/FeaturedSuites";
import GuestExperiences from "./components/GuestExperiences";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import SuiteDetailsModal from "./components/SuiteDetailsModal";
import LoginModal from "./components/LoginModal";

export default function App() {
  // Modal toggle states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSuiteDetailsOpen, setIsSuiteDetailsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Selected details
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Intent parameters for pre-filling Booking Modal
  const [bookingParams, setBookingParams] = useState({
    suiteId: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  // Inside the App component, add this state:
  const [landingData, setLandingData] = useState(null);

  // Inside the App component, add this useEffect hook for api data fetching:
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const data = await dashboardApi.getLandingData();
        setLandingData(data);
      } catch (error) {
        console.error("Error fetching landing data:", error);
      }
    };
    fetchLandingData();
  }, []);

  // Enable HTML-level smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Set default dates when opening booking modal if empty
  const handleOpenBooking = (
    suiteId = "",
    checkIn = "",
    checkOut = "",
    guests = 2
  ) => {
    // Disabled for now as requested: "i dont nothing to appear yet when i click on book your stay"
  };

  const handleOpenSuiteDetails = (suite) => {
    setSelectedSuite(suite);
    setIsSuiteDetailsOpen(true);
  };

  const handleLoginSuccess = (name) => {
    setLoggedInUser(name);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="position-relative min-vh-100 bg-light d-flex flex-column justify-content-between overflow-x-hidden">
      
      {/* Navigation Bar */}
      <Navbar
        onBookNowClick={() => handleOpenBooking()}
        onLoginClick={() => setIsLoginOpen(true)}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        scrollToSection={scrollToSection}
      />

      {/* Main Sections */}
      <main className="flex-grow-1">
        
        {/* Hero Section (inc. Search availability bar) */}
        <Hero 
          onBookNowClick={handleOpenBooking} 
          scrollToSection={scrollToSection} 
        />

        {/* Floating Bar Spacer on small screens */}
        <div className="py-2 d-md-none" />

        {/* Services/Amenities Horizontal Grid */}
        <Amenities />

        {/* Featured Rooms / Suites */}
        <FeaturedSuites
          onViewDetails={handleOpenSuiteDetails}
          onBookNow={(suiteId) => handleOpenBooking(suiteId)}
        />

        {/* Testimonials and customer reviews */}
        <GuestExperiences />

      </main>

      {/* Footer */}
      <Footer />

      {/* INTERACTIVE MODALS */}
      
      {/* 1. Global Suite Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedSuiteId={bookingParams.suiteId}
        initialCheckIn={bookingParams.checkIn}
        initialCheckOut={bookingParams.checkOut}
        initialGuests={bookingParams.guests}
      />

      {/* 2. Detailed Suite Specs Modal */}
      <SuiteDetailsModal
        isOpen={isSuiteDetailsOpen}
        suite={selectedSuite}
        onClose={() => setIsSuiteDetailsOpen(false)}
        onBookNow={(suiteId) => handleOpenBooking(suiteId)}
      />

      {/* 3. Luxury Club Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}