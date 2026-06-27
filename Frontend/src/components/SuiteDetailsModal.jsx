import React from "react";
import { X, Check, Star, Ruler, Users, BedDouble, Sparkles } from "lucide-react";
export default function SuiteDetailsModal({
  isOpen,
  suite,
  onClose,
  onBookNow,
}) {
  if (!isOpen || !suite) return null;

  return (
    <div className="custom-modal-overlay">
      {/* Backdrop */}
      <div
        className="position-absolute w-100 h-100 bg-transparent"
        onClick={onClose}
        style={{ zIndex: "1" }}
      />

      {/* Modal Container */}
      <div 
        className="position-relative bg-white rounded-2xl overflow-hidden shadow-lg border border-light-200 row g-0"
        style={{ zIndex: "2", width: "100%", maxWidth: "880px", maxHeight: "90vh" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="position-absolute top-0 end-0 m-3 btn btn-dark opacity-75 rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
          style={{ width: "36px", height: "36px", zIndex: "10" }}
          id="close-suite-modal"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Left Side: Images & High-level Info */}
        <div 
          className="col-12 col-md-6 position-relative bg-dark d-flex flex-column justify-content-end text-light p-4 p-md-5"
          style={{ minHeight: "280px", overflow: "hidden" }}
        >
          <img
            src={suite.image}
            alt={suite.name}
            referrerPolicy="no-referrer"
            className="position-absolute top-0 start-0 w-100 h-100 object-cover opacity-75 z-0"
          />
          {/* Subtle gradient overlay */}
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 z-1" 
            style={{ 
              background: "linear-gradient(to top, rgba(10, 17, 40, 0.95), rgba(10, 17, 40, 0.4), transparent)" 
            }} 
          />
          
          <div className="position-relative z-3 d-flex flex-column gap-2 text-white">
            <div className="d-flex align-items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-4 h-4" 
                  color="#eab308"
                  fill="#eab308"
                />
              ))}
            </div>
            <h2 className="font-display h3 fw-bold tracking-tight mb-1 text-white">
              {suite.name}
            </h2>
            <p className="text-gold-300 font-display h5 fw-semibold mb-0">
              ${suite.price} <span className="small font-sans text-uppercase text-light opacity-75" style={{ fontSize: "11px", letterSpacing: "1px" }}>/ Night</span>
            </p>
          </div>
        </div>

        {/* Right Side: Detailed Features & CTA */}
        <div 
          className="col-12 col-md-6 p-4 p-md-5 bg-white d-flex flex-column justify-content-between"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <div>
            {/* Short specs */}
            <div className="row g-2 text-center border-bottom pb-4 mb-4">
              <div className="col-4 d-flex flex-column gap-1">
                <Users className="w-5 h-5 text-gold-500 mx-auto" />
                <span className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>Guests</span>
                <span className="fw-bold text-dark" style={{ fontSize: "12px" }}>
                  {suite.guests} Adults {suite.children > 0 && `, ${suite.children} C`}
                </span>
              </div>
              <div className="col-4 d-flex flex-column gap-1 border-start border-end border-slate-100">
                <Ruler className="w-5 h-5 text-gold-500 mx-auto" />
                <span className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>Room Area</span>
                <span className="fw-bold text-dark" style={{ fontSize: "12px" }}>{suite.area} m²</span>
              </div>
              <div className="col-4 d-flex flex-column gap-1">
                <BedDouble className="w-5 h-5 text-gold-500 mx-auto" />
                <span className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>Bed Type</span>
                <span className="fw-bold text-dark" style={{ fontSize: "12px" }}>
                  {suite.id === "ocean-view-suite" ? "California King" : suite.id === "deluxe-suite" ? "King Bed" : "Queen Bed"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4 d-flex flex-column gap-1">
              <h4 className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>Overview</h4>
              <p className="text-secondary small leading-relaxed mb-0">{suite.description}</p>
            </div>

            {/* Signature Features checklist */}
            <div className="mb-4 d-flex flex-column gap-2">
              <h4 className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>Suite Amenities</h4>
              <div className="row g-2">
                {suite.features.map((feature, index) => (
                  <div key={index} className="col-12 col-sm-6 d-flex align-items-start gap-2 text-muted" style={{ fontSize: "12px" }}>
                    <Check className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" style={{ marginTop: "2px" }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions notice */}
            <div className="p-3 bg-gold-50 border border-gold-100 rounded-2xl d-flex align-items-start gap-2 text-gold-800 small mb-4">
              <Sparkles className="w-4 h-4 text-gold-500 flex-shrink-0" style={{ marginTop: "2px" }} />
              <span style={{ fontSize: "11px", lineHeight: "1.4" }}>Complimentary high-speed Wi-Fi, daily turndown services, butler coordination, and spa pool credentials are included with your suite.</span>
            </div>
          </div>

          {/* Booking Trigger Footer */}
          <div className="border-top pt-4 d-flex align-items-center justify-content-between gap-3">
            <div>
              <span className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>Best Rate Direct</span>
              <span className="h4 font-display fw-bold text-dark mb-0">${suite.price}</span>
              <span className="text-muted" style={{ fontSize: "10px" }}> / Night (Taxes Excl.)</span>
            </div>
            
            <button
              onClick={() => {
                onBookNow(suite.id);
                onClose();
              }}
              className="btn btn-gold rounded-full px-4 py-2.5 fw-bold cursor-pointer"
              id={`book-from-details-${suite.id}`}
              style={{ fontSize: "14px" }}
            >
              Book This Suite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
