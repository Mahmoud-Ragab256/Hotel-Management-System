import React, { useState } from "react";
import { Calendar, Users, ChevronDown, Sparkles } from "lucide-react";

export default function Hero({ onBookNowClick, scrollToSection }) {
  // Booking Card States
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const handleSearchClick = () => {
    // If the user searches from hero, pass these parameters directly to the booking modal!
    onBookNowClick("", checkIn, checkOut, guests);
  };

  return (
    <section 
      id="home" 
      className="position-relative d-flex flex-column justify-content-between bg-dark pb-0"
      style={{ minHeight: "85vh" }}
    >
      
      {/* Background Image with Dark Overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
        <img
          src="/src/assets/images/grand_royale_facade_1782522354988.jpg"
          alt="Grand Royale Facade"
          referrerPolicy="no-referrer"
          className="w-100 h-100 object-cover"
          style={{ opacity: "0.35" }}
        />
        {/* Multilayer luxury dark overlay for contrast */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{ 
            background: "linear-gradient(to bottom, rgba(10, 17, 40, 0.6), rgba(10, 17, 40, 0.75), rgba(10, 17, 40, 0.95))" 
          }} 
        />
      </div>

      {/* Main Content Area */}
      <div className="position-relative z-3 container d-flex flex-column justify-content-center text-center pt-5 pb-5 flex-grow-1">
        
        {/* Title */}
        <h1 
          className="font-display text-white mb-4 fw-bold tracking-tight mx-auto"
          style={{ 
            maxWidth: "800px", 
            fontSize: "calc(1.8rem + 2.5vw)",
            lineHeight: "1.15"
          }}
        >
          Experience Luxury <br />& Comfort
        </h1>

        {/* Subtitle */}
        <p 
          className="text-light opacity-75 leading-relaxed mx-auto mb-4"
          style={{ 
            maxWidth: "600px", 
            fontSize: "1.05rem"
          }}
        >
          Indulge in an unforgettable stay where timeless elegance meets unparalleled service in the heart of the city.
        </p>

        {/* Buttons */}
        <div 
          className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mx-auto w-100"
          style={{ maxWidth: "450px" }}
        >
          <button
            onClick={() => onBookNowClick()}
            className="btn btn-gold rounded-full w-100 py-3 fw-bold shadow-gold-100 transition-all cursor-pointer"
            id="hero-book-stay"
          >
            Book Your Stay
          </button>
          <button
            onClick={() => scrollToSection("rooms")}
            className="btn btn-outline-light rounded-full w-100 py-3 fw-bold transition-all cursor-pointer"
            id="hero-explore-rooms"
          >
            Explore Rooms
          </button>
        </div>

      </div>

      {/* Booking Floating Bar (floating over the bottom boundary) */}
      <div 
        className="position-relative z-3 container w-100 mt-auto"
        style={{ maxWidth: "1000px", marginBottom: "-56px" }}
      >
        <div className="bg-white rounded-4 shadow-lg p-4 border border-light-200">
          
          {/* Centered Elegant Header */}
          <div className="text-center pb-3 mb-3 border-bottom">
            <span className="small font-sans fw-bold text-gold-600 tracking-wider text-uppercase" style={{ fontSize: "12px", letterSpacing: "2px" }}>
              ✦ Direct Booking Desk ✦
            </span>
          </div>

          <div className="row g-3 align-items-end">
            {/* Check-In input */}
            <div className="col-12 col-md-3">
              <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Check-In</label>
              <div className="position-relative">
                <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-gold-500 d-flex align-items-center pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="form-control bg-light border-0 text-dark cursor-pointer"
                  style={{ borderRadius: "50px", paddingLeft: "42px", paddingRight: "15px", height: "46px", fontSize: "14px" }}
                  id="hero-checkin-date"
                />
              </div>
            </div>

            {/* Check-Out input */}
            <div className="col-12 col-md-3">
              <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Check-Out</label>
              <div className="position-relative">
                <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-gold-500 d-flex align-items-center pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="form-control bg-light border-0 text-dark cursor-pointer"
                  style={{ borderRadius: "50px", paddingLeft: "42px", paddingRight: "15px", height: "46px", fontSize: "14px" }}
                  id="hero-checkout-date"
                />
              </div>
            </div>

            {/* Guests dropdown/select */}
            <div className="col-12 col-md-3">
              <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Guests</label>
              <div className="position-relative">
                <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-gold-500 d-flex align-items-center pointer-events-none">
                  <Users className="w-4 h-4" />
                </span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="form-select bg-light border-0 text-dark cursor-pointer"
                  style={{ borderRadius: "50px", paddingLeft: "42px", paddingRight: "35px", height: "46px", fontSize: "14px" }}
                  id="hero-guests-select"
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-12 col-md-3">
              <button
                onClick={handleSearchClick}
                className="btn btn-gold w-100 fw-bold shadow-sm cursor-pointer d-flex align-items-center justify-content-center"
                style={{ borderRadius: "50px", height: "46px" }}
                id="hero-search-availability"
              >
                Search Availability
              </button>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
