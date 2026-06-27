import React from "react";
import { Wifi, Waves, ConciergeBell, Car } from "lucide-react";
import { AMENITIES } from "../data/landingData";

const iconMap = {
  Wifi,
  Waves,
  ConciergeBell,
  Car,
};

export default function Amenities() {
  return (
    <section id="services" className="bg-white pb-5 border-bottom" style={{ paddingTop: "96px" }}>
      <div className="container px-3 py-3">
        
        {/* Section Header */}
        <div className="text-center mb-5 d-flex flex-column gap-1">
          <span className="small fw-bold text-gold-500 text-uppercase tracking-wider">Luxurious Offerings</span>
          <h2 className="font-display h2 fw-bold text-dark tracking-tight">World-Class Services</h2>
          <p className="text-muted mx-auto small mb-0" style={{ maxWidth: "450px" }}>
            Experience exceptional state-of-the-art facilities crafted for your pure indulgence and relaxation.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="row g-4 justify-content-center">
          {AMENITIES.map((amenity) => {
            const IconComponent = iconMap[amenity.icon] || Wifi;
            return (
              <div key={amenity.id} className="col-6 col-lg-3">
                <div 
                  className="d-flex flex-column align-items-center text-center p-4 rounded-2xl border border-light shadow-sm h-100 bg-white"
                  style={{ transition: "all 0.3s ease" }}
                >
                  {/* Circular Gold Icon Container */}
                  <div 
                    className="d-flex align-items-center justify-content-center bg-gold-100 text-gold-600 mb-3 shadow-sm"
                    style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="fw-bold text-dark mb-2 tracking-tight" style={{ fontSize: "14px" }}>
                    {amenity.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted leading-relaxed mb-0" style={{ maxWidth: "180px", fontSize: "12px" }}>
                    {amenity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
