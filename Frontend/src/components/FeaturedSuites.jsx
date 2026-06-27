import React from "react";
import { Users, Ruler, Eye } from "lucide-react";
import { SUITES } from "../data/landingData";

export default function FeaturedSuites({ onViewDetails, onBookNow }) {
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

        {/* Suites Grid */}
        <div className="row g-4 justify-content-center">
          {SUITES.map((suite) => (
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

                  {/* Card Button */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(suite);
                      }}
                      className="btn btn-outline-gold rounded-full w-100 py-2.5 fw-bold text-center cursor-pointer"
                      id={`view-details-${suite.id}`}
                    >
                      View Details
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
