import React from "react";
import { Users, Ruler, Eye, CalendarCheck, AlertCircle, RefreshCw } from "lucide-react";

export default function FeaturedSuites({ 
  suites, 
  loading, 
  error, 
  onViewDetails, 
  onBookNow, 
  onResetSearch,
  hideAvailabilityMessage 
}) {
  // Normalize suite data in case the backend API returns slightly different key names
  const normalizeSuite = (suite) => {
    return {
      id: suite.id || suite._id,
      name: suite.name || suite.title || suite.roomType || "Luxury Suite",
      price: suite.price || suite.rate || 0,
      guests: suite.guests || suite.maxGuests || suite.capacity || 2,
      children: suite.children || 0,
      area: suite.area || suite.roomSize || suite.size || 40,
      description: suite.description || suite.longDescription || "Experience unparalleled luxury and comfort in our meticulously designed suite, featuring elegant furnishings and world-class amenities.",
      features: suite.features || suite.amenities || ["Free Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service"],
      image: suite.image || suite.imageUrl || suite.photo || "/src/assets/images/deluxe_suite_room_1782522366897.jpg"
    };
  };

  return (
    <section id="rooms" className="bg-light py-5 border-bottom">
      <div className="container px-3 py-3">
        
        {/* Section Header */}
        <div className="text-center mb-5 d-flex flex-column gap-1">
          <span className="small fw-bold text-gold-500 text-uppercase tracking-wider">Premium Sanctuaries</span>
          <h2 className="font-display h2 fw-bold text-dark tracking-tight">Our Featured Suites</h2>
          <p className="text-muted mx-auto small mb-0" style={{ maxWidth: "450px" }}>
            Hand-picked accommodations for ultimate relaxation
          </p>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-gold-500 mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading available suites...</span>
            </div>
            <p className="text-muted font-sans tracking-wide">Querying live availability with our front desk...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
            <AlertCircle className="text-danger mx-auto mb-3" style={{ width: "48px", height: "48px" }} />
            <h4 className="fw-bold text-dark mb-2">Failed to Fetch Suites</h4>
            <p className="text-muted small mb-4">
              {error || "We encountered a network or server communication error. Please ensure your backend server is running and configured correctly."}
            </p>
            {onResetSearch && (
              <button 
                onClick={onResetSearch}
                className="btn btn-gold rounded-full px-4 py-2 mx-auto fw-semibold d-flex align-items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try with Mock/Local Data
              </button>
            )}
          </div>
        )}

        {/* 3. Initial Empty State (Not searched yet) */}
        {!loading && !error && !hideAvailabilityMessage && (suites === null || suites.length === 0) && (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4 mx-auto transition-all" style={{ maxWidth: "650px", borderTop: "4px solid #C5A880" }}>
            <CalendarCheck className="text-gold-500 mx-auto mb-3" style={{ width: "56px", height: "56px" }} />
            <h4 className="fw-bold text-dark mb-2">Check Room Availability</h4>
            <p className="text-muted leading-relaxed mb-0">
              Please enter your preferred check-in date, check-out date, and number of guests in the <strong className="text-dark">Direct Booking Desk</strong> above and click <strong className="text-dark">Search Availability</strong> to check real-time availability.
            </p>
          </div>
        )}

        {/* 4. Searched, but empty results state */}
        {!loading && !error && hideAvailabilityMessage && suites !== null && suites.length === 0 && (
          <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
            <CalendarCheck className="text-muted mx-auto mb-3" style={{ width: "48px", height: "48px" }} />
            <h4 className="fw-bold text-dark mb-2">No Suites Available</h4>
            <p className="text-muted small mb-4">
              We're sorry, but no suites match your selected criteria or dates. Please try choosing alternative dates or adjusting the guest count.
            </p>
            {onResetSearch && (
              <button 
                onClick={onResetSearch} 
                className="btn btn-outline-secondary rounded-full px-4 py-2 mx-auto fw-semibold"
              >
                Reset Search Criteria
              </button>
            )}
          </div>
        )}

        {/* 5. Active Dynamic Suites Grid */}
        {!loading && !error && suites !== null && suites.length > 0 && (
          <div className="row g-4 justify-content-center">
            {suites.map((rawSuite) => {
              const suite = normalizeSuite(rawSuite);
              return (
                <div key={suite.id} className="col-12 col-md-4">
                  <div 
                    className="card h-100 rounded-2xl border-0 shadow-sm overflow-hidden bg-white d-flex flex-column justify-content-between suite-card-premium cursor-pointer"
                    onClick={() => onViewDetails(suite)}
                  >
                    {/* Image Container with Hover Effect */}
                    <div 
                      className="position-relative bg-light"
                      style={{ aspectRatio: "16/10", overflow: "hidden" }}
                    >
                      <img
                        src={suite.image}
                        alt={suite.name}
                        referrerPolicy="no-referrer"
                        className="w-100 h-100 object-cover suite-image-zoom"
                      />
                      
                      {/* Instant Quick Book Overlay on hover */}
                      <div className="position-absolute start-0 top-0 w-100 h-100 d-flex align-items-center justify-content-center suite-card-overlay">
                        <Eye className="text-white" style={{ width: "32px", height: "32px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                      </div>
                    </div>

                    {/* Suite Information */}
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      
                      {/* Name & Pricing Row */}
                      <div>
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                          <h3 className="font-display h5 fw-bold text-dark mb-0 leading-tight">
                            {suite.name}
                          </h3>
                          <div className="text-end flex-shrink-0">
                            <span className="text-gold-500 font-display fw-bold h5 mb-0">
                              ${suite.price}
                            </span>
                            <span className="text-uppercase tracking-wider d-block text-muted" style={{ fontSize: "10px", fontWeight: "600" }}>/night</span>
                          </div>
                        </div>

                        {/* Specifications (Guests & Area) */}
                        <div 
                          className="d-flex align-items-center gap-3 text-muted border-top pt-3 mb-4"
                          style={{ fontSize: "12px" }}
                        >
                          <div className="d-flex align-items-center gap-1.5 text-secondary opacity-90">
                            <Users className="w-3 h-3 text-gold-500 flex-shrink-0" />
                            <span>
                              {suite.guests} Adults{suite.children > 0 && `, ${suite.children} Children`}
                            </span>
                          </div>
                          <div className="border-start border-slate-200" style={{ height: "12px" }}></div>
                          <div className="d-flex align-items-center gap-1.5 text-secondary opacity-90">
                            <Ruler className="w-3 h-3 text-gold-500 flex-shrink-0" />
                            <span>{suite.area} m² Room Area</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Buttons */}
                      <div className="pt-2 d-flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            onViewDetails(suite);
                          }}
                          className={`btn btn-outline-gold rounded-full py-2.5 fw-bold text-center cursor-pointer ${onBookNow ? 'w-50' : 'w-100'}`}
                          id={`view-details-${suite.id}`}
                        >
                          View Details
                        </button>
                        
                        {onBookNow && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); 
                              onBookNow(suite);
                            }}
                            className="btn btn-gold text-white rounded-full w-50 py-2.5 fw-bold text-center cursor-pointer"
                            id={`book-now-${suite.id}`}
                          >
                            Book Now
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}