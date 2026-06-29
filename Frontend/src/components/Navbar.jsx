import React, { useState } from "react";
import { Sparkles, Menu, X, User, LogOut } from "lucide-react";

export default function Navbar({
  onBookNowClick,
  onLoginClick,
  loggedInUser,
  onLogout,
  scrollToSection,
  // 🆕 أضفنا بروب التوجيه لصفحة الـ Sign In (إنشاء حساب)
  onSignupClick, 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky-top bg-white border-bottom shadow-sm py-2">
      <div className="container px-3">
        <div className="d-flex justify-content-between align-items-center" style={{ height: "70px" }}>
          
          {/* Logo (Left) */}
          <div 
            onClick={() => scrollToSection("home")} 
            className="d-flex align-items-center gap-2 cursor-pointer"
          >
            <div 
              className="nav-logo-icon d-flex align-items-center justify-content-center bg-gold-500 text-white rounded-circle shadow-sm"
              style={{ width: "38px", height: "38px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" stroke="none" />
                <path d="M3 20h18" />
              </svg>
            </div>
            <span className="nav-logo-text font-display h4 mb-0 fw-bold tracking-tight text-dark">
              Grand Royale
            </span>
          </div>

          {/* Desktop Nav Items (Center) */}
          <div className="d-none d-md-flex align-items-center gap-4 nav-center-links">
            <button
              onClick={() => scrollToSection("home")}
              className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("rooms")}
              className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
            >
              Rooms
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("reviews")}
              className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
            >
              Reviews
            </button>
          </div>

          {/* Desktop Call To Action / Auth (Right) */}
          <div className="d-none d-md-flex align-items-center gap-3">
            {loggedInUser ? (
              <div className="d-flex align-items-center gap-2 bg-gold-50 px-3 py-1 border border-gold-100 rounded-full">
                <span className="small fw-bold text-gold-700 d-flex align-items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {loggedInUser}
                </span>
                <button
                  onClick={onLogout}
                  className="btn btn-link p-0 text-secondary hover-text-danger transition-colors d-flex align-items-center cursor-pointer border-0 bg-transparent"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={onLoginClick}
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Log In
                </button>
                <span className="text-secondary opacity-40">|</span>
                <button
                  onClick={onSignupClick} // 🆕 تم ربط زرار الـ Sign In بالضغط والتوجيه لصفحة الـ signup
                  className="btn btn-link p-0 text-decoration-none text-secondary hover-text-gold-500 fw-semibold small transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="d-flex d-md-none align-items-center gap-2">
            {loggedInUser && (
              <span className="small fw-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-100 d-flex align-items-center gap-1">
                <User className="w-3 h-3" />
                {loggedInUser}
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-light p-2 rounded-lg text-secondary cursor-pointer d-flex align-items-center border-0"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="d-md-none border-top border-slate-200 bg-white shadow-lg animate-fadeIn">
          <div className="px-3 pt-2 pb-4 d-flex flex-column gap-1">
            <button
              onClick={() => {
                scrollToSection("home");
                setIsOpen(false);
              }}
              className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                scrollToSection("rooms");
                setIsOpen(false);
              }}
              className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
            >
              Rooms
            </button>
            <button
              onClick={() => {
                scrollToSection("services");
                setIsOpen(false);
              }}
              className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
            >
              Services
            </button>
            <button
              onClick={() => {
                scrollToSection("reviews");
                setIsOpen(false);
              }}
              className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
            >
              Reviews
            </button>
            {loggedInUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="btn btn-light text-start w-full px-3 py-2 border-0 text-danger bg-transparent transition-all rounded-lg"
              >
                Logout ({loggedInUser})
              </button>
            ) : (
              <div className="d-flex flex-column gap-1">
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsOpen(false);
                  }}
                  className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onSignupClick(); // 🆕 تم ربط زرار الـ Sign In في القائمة الجانبية للموبايل أيضاً
                    setIsOpen(false);
                  }}
                  className="btn btn-light text-start w-full px-3 py-2 border-0 text-dark bg-transparent hover-text-gold-500 transition-all rounded-lg"
                >
                  Sign In
                </button>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => {
                  onBookNowClick();
                  setIsOpen(false);
                }}
                className="btn btn-gold rounded-full w-100 py-2.5 fw-bold text-center shadow-sm cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}