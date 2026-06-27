import React, { useState } from "react";
import { MapPin, Phone, Mail, CheckCircle2, Compass, Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <footer 
      className="text-white-50 pt-5 pb-4 border-top border-secondary"
      style={{ backgroundColor: "#12120f" }}
    >
      <div className="container px-3">
        
        {/* Main Footer Grid */}
        <div className="row g-4 mb-5">
          
          {/* Col 1: Brand Info */}
          <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-2 text-white">
              <div 
                className="d-flex align-items-center justify-content-center bg-gold-500 text-white rounded-circle"
                style={{ width: "32px", height: "32px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" stroke="none" />
                  <path d="M3 20h18" />
                </svg>
              </div>
              <span className="font-display h5 mb-0 fw-bold tracking-tight text-white">
                Grand Royale
              </span>
            </div>
            
            <p className="small text-white-50 leading-relaxed mb-0 font-sans">
              Defining luxury hospitality for over a century. We pride ourselves on creating memorable experiences for every guest.
            </p>

            {/* Direct Contact Links */}
            <div className="d-flex align-items-center gap-3 pt-2">
              <a 
                href="https://maps.google.com/?q=123+Elegance+Avenue,+Luxury+District,+New+York,+NY+10001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50 hover:text-white transition-colors cursor-pointer"
                title="Hotel Location on Google Maps"
              >
                <Compass className="w-5 h-5" />
              </a>
              <a 
                href="mailto:reservations@grandroyale.com"
                className="text-white-50 hover:text-white transition-colors cursor-pointer"
                title="Email Reservations"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Contact Info */}
          <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-2">
            <h4 className="font-display text-white fw-bold small text-uppercase tracking-wider mb-2">
              Contact Info
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2.5 small mb-0 text-white-50">
              <li className="d-flex align-items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }} />
                <span>
                  123 Elegance Avenue, Luxury District, <br />
                  New York, NY 10001
                </span>
              </li>
              <li className="d-flex align-items-center gap-2.5">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "#3b82f6" }} />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="d-flex align-items-center gap-2.5">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "#3b82f6" }} />
                <span>reservations@grandroyale.com</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-2">
            <h4 className="font-display text-white fw-bold small text-uppercase tracking-wider mb-2">
              Quick Links
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0 fw-semibold">
              <li>
                <a href="#offers" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">
                  Special Offers
                </a>
              </li>
              <li>
                <a href="#dining" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">
                  Dining & Bar
                </a>
              </li>
              <li>
                <a href="#events" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">
                  Weddings & Events
                </a>
              </li>
              <li>
                <a href="#spa" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">
                  Spa & Wellness
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-2">
            <h4 className="font-display text-white fw-bold small text-uppercase tracking-wider mb-2">
              Newsletter
            </h4>
            <p className="small text-white-50 leading-normal mb-1">
              Subscribe for exclusive offers and updates.
            </p>

            {isSubscribed ? (
              <div 
                className="p-3 text-gold-300 small d-flex align-items-center gap-2 rounded-2xl"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)" }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="d-flex flex-column gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="form-control text-white small"
                  style={{ 
                    borderRadius: "50px", 
                    height: "40px", 
                    fontSize: "12px", 
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff"
                  }}
                  id="footer-email-input"
                />
                {error && <p className="text-danger small mb-0" style={{ fontSize: "10px" }}>{error}</p>}
                <button
                  type="submit"
                  className="btn btn-gold rounded-full w-100 py-2 fw-bold text-white"
                  id="footer-subscribe-btn"
                  style={{ fontSize: "12px", height: "40px" }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom copyright line */}
        <div 
          className="border-top border-secondary pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 text-uppercase font-sans text-white-50"
          style={{ fontSize: "10px", letterSpacing: "1px" }}
        >
          <p className="mb-0">© 2026 GRAND ROYALE LUXURY HOTEL. ALL RIGHTS RESERVED.</p>
          <div className="d-flex gap-4">
            <a href="#terms" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">Terms</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">Privacy</a>
            <a href="#cookies" onClick={(e) => e.preventDefault()} className="text-white-50 text-decoration-none hover:text-white transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
