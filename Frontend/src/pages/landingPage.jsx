import React, { useState, useEffect } from "react";
import { dashboardApi } from "../services/api";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Amenities from "../components/Amenities";
import FeaturedSuites from "../components/FeaturedSuites";
import GuestExperiences from "../components/GuestExperiences";
import Footer from "../components/Footer";
import SuiteDetailsModal from "../components/SuiteDetailsModal";
export default function App() {
  // Modal toggle states
  const [isSuiteDetailsOpen, setIsSuiteDetailsOpen] = useState(false);

  // Selected details
  const [selectedSuite, setSelectedSuite] = useState(null);

  const [landingData, setLandingData] = useState(null);
  // Enable HTML-level smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const fetchLandingData = async () => {
      try {
        const data = await dashboardApi.getLandingData();
        setLandingData(data);
      } catch (error) {
        console.error("Error fetching landing data:", error);
      }
    };
    fetchLandingData();

  const handleOpenSuiteDetails = (suite) => {
    setSelectedSuite(suite);
    setIsSuiteDetailsOpen(true);
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
        onBookNowClick={() => {}}
        onLoginClick={() => {}}
        loggedInUser={null}
        onLogout={() => {}}
        scrollToSection={scrollToSection}
      />

      {/* Main Sections */}
      <main className="flex-grow-1">
        
        {/* Hero Section (inc. Search availability bar) */}
        <Hero 
          onBookNowClick={() => {}} 
          scrollToSection={scrollToSection} 
        />

        {/* Floating Bar Spacer on small screens */}
        <div className="py-2 d-md-none" />

        {/* Services/Amenities Horizontal Grid */}
        <Amenities />

        {/* Featured Rooms / Suites */}
        <FeaturedSuites
          onViewDetails={handleOpenSuiteDetails}
          onBookNow={() => {}}
        />

        {/* Testimonials and customer reviews */}
        <GuestExperiences />

      </main>

      {/* Footer */}
      <Footer />

      {/* INTERACTIVE MODALS */}
      
      {/* 2. Detailed Suite Specs Modal */}
      <SuiteDetailsModal
        isOpen={isSuiteDetailsOpen}
        suite={selectedSuite}
        onClose={() => setIsSuiteDetailsOpen(false)}
        onBookNow={() => {}}
      />

    </div>
  );
}
