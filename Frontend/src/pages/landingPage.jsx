import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Amenities from "../components/Amenities";
import FeaturedSuites from "../components/FeaturedSuites";
import GuestExperiences from "../components/GuestExperiences";
import Footer from "../components/Footer";
import SuiteDetailsModal from "../components/SuiteDetailsModal";

// الربط الفعلي والصحيح مع الباكيند بتاعكم 🔌
import { dashboardApi } from "../services/api.js";
const fetchLandingData = () => dashboardApi.getLandingData();
const fetchStatistics = () => dashboardApi.getLandingStatistics();
const fetchAvailableSuites = (params) => dashboardApi.getFeaturedCategories(params);

export default function App() {
  const navigate = useNavigate(); 

  // Modal toggle states
  const [isSuiteDetailsOpen, setIsSuiteDetailsOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState(null);

  // --- Dynamic API Binding States ---
  const [landingData, setLandingData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  
  // 🆕 تعديل واقعي: البداية مصفوفة فاضية عشان تظهر رسالة Check Room Availability
  const [availableSuites, setAvailableSuites] = useState([]); 
  const [isLoadingSuites, setIsLoadingSuites] = useState(false);
  const [suitesError, setSuitesError] = useState(null);
  
  const [isLoadingLanding, setIsLoadingLanding] = useState(true);
  const [landingError, setLandingError] = useState(null);

  // حالة التحكم في ظهور أزرار الحجز والرسائل البيضاء
  const [hasSearched, setHasSearched] = useState(false);

  // تفعيل السكرول الناعم
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // جلب البيانات الأساسية (الاحصائيات) عند تحميل الصفحة
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingLanding(true);
      setLandingError(null);
      try {
        const [landingResult, statsResult] = await Promise.all([
          fetchLandingData(),
          fetchStatistics()
        ]);
        if (landingResult?.data) setLandingData(landingResult.data);
        if (statsResult?.data) setStatistics(statsResult.data);
      } catch (err) {
        console.warn("API Service: Backend statistics binding error.");
        setLandingError(err.message || "Failed to establish database synchronization.");
      } finally {
        setIsLoadingLanding(false);
      }
    };

    fetchInitialData();
  }, []);

  // دالة الـ Check Availability الحقيقية المربوطة بالباكيند بنسبة 100% 🎯
  const handleCheckAvailability = async (suiteId, checkIn, checkOut, guests) => {
    if (!checkIn || !checkOut) {
      scrollToSection("home");
      const checkInInput = document.getElementById("hero-checkin-date");
      if (checkInInput) checkInInput.focus();
      return;
    }

    setIsLoadingSuites(true);
    setSuitesError(null);
    scrollToSection("rooms");

    try {
      // مناداة الـ API الحقيقي للباكيند وتمرير الـ parameters المكتوبة في الـ Hero
      const suitesResult = await fetchAvailableSuites({ checkIn, checkOut, guests });
      
      // تحديث الأوض بالداتا الفعلية المرجعة من السيرفر
      setAvailableSuites(suitesResult?.data || suitesResult || []); 
      
      // تفعيل حالة البحث بنجاح لتختفي الرسالة وتظهر الكروت مع زر الحجز
      setHasSearched(true); 
    } catch (err) {
      console.error("API Service: Check availability failed:", err);
      setSuitesError(
        err.message || "Unable to establish communication with the hotel reservation engine. Please ensure your backend is online."
      );
    } finally {
      setIsLoadingSuites(false);
    }
  };

  // إعادة تعيين البحث للوضع الأول الافتراضي
  const handleResetOrLocalFallback = () => {
    setAvailableSuites([]); 
    setSuitesError(null);
    setHasSearched(false); 
  };

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
        onBookNowClick={() => scrollToSection("home")}
        onLoginClick={() => navigate("/guest-login")} 
        onSignupClick={() => navigate("/signup")}
        loggedInUser={null}
        onLogout={() => {}}
        scrollToSection={scrollToSection}
      />

      {/* Main Content */}
      <main className="flex-grow-1">
        
        {/* الـ Hero ممررين له الدالة المربوطة بالباكيند */}
        <Hero 
          onBookNowClick={handleCheckAvailability} 
          scrollToSection={scrollToSection} 
        />

        <div className="py-2 d-md-none" />
        <Amenities />

        {/* Statistics Banner */}
        <section className="py-5 border-top border-bottom" style={{ backgroundColor: "#111827", borderColor: "#e5e7eb" }}>
          <div className="container px-3">
            <div className="row g-4 text-center justify-content-center">
              <div className="col-6 col-md-3">
                <div className="h1 fw-bold mb-1 font-display" style={{ color: "#d97706" }}>
                  {statistics?.totalSuites || statistics?.totalRooms || "150+"}
                </div>
                <span className="small text-uppercase tracking-wider fw-semibold" style={{ fontSize: "12px", color: "#9ca3af" }}>Luxury Suites Owned</span>
              </div>
              <div className="col-6 col-md-3 border-start" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="h1 fw-bold mb-1 font-display" style={{ color: "#d97706" }}>
                  {statistics?.happyGuests || statistics?.activeBookings || "24k+"}
                </div>
                <span className="small text-uppercase tracking-wider fw-semibold" style={{ fontSize: "12px", color: "#9ca3af" }}>Happy Guests Served</span>
              </div>
              <div className="col-6 col-md-3 border-start" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="h1 fw-bold mb-1 font-display" style={{ color: "#d97706" }}>
                  {statistics?.averageRating || "4.95"}
                </div>
                <span className="small text-uppercase tracking-wider fw-semibold" style={{ fontSize: "12px", color: "#9ca3af" }}>Overall Guest Rating</span>
              </div>
              <div className="col-6 col-md-3 border-start" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="h1 fw-bold mb-1 font-display" style={{ color: "#d97706" }}>
                  {statistics?.yearsOfService || "18+"}
                </div>
                <span className="small text-uppercase tracking-wider fw-semibold" style={{ fontSize: "12px", color: "#9ca3af" }}>Years of Hospitality</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Rooms / Suites */}
        <div id="rooms">
          <FeaturedSuites
            suites={availableSuites}
            loading={isLoadingSuites}
            error={suitesError}
            onViewDetails={handleOpenSuiteDetails}
            // طالما المتاح رجع من الباكيند، بنمرر دالة التوجيه لصفحة الحجز، وإلا null لخفي الزرار
            onBookNow={hasSearched ? (suite) => navigate("/guest-login", { state: { suiteId: suite.id } }) : null}
            onResetSearch={handleResetOrLocalFallback}
            hideAvailabilityMessage={hasSearched} 
          />
        </div>

        <GuestExperiences />
      </main>

      <Footer />

      {/* Interactive Details Modal */}
      <SuiteDetailsModal
        isOpen={isSuiteDetailsOpen}
        suite={selectedSuite}
        onClose={() => setIsSuiteDetailsOpen(false)}
        onBookNow={hasSearched ? (suiteId) => navigate("/guest-login", { state: { suiteId } }) : null}
      />

    </div>
  );
}