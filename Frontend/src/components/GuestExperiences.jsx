import React, { useState } from "react";
import { Star, Sparkles, X, Plus } from "lucide-react";
import { REVIEWS } from "../data/landingData";

export default function GuestExperiences() {
  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author: "",
    role: "Leisure Traveler",
    rating: 5,
    comment: "",
  });
  const [error, setError] = useState("");

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!newReview.author.trim() || !newReview.comment.trim()) {
      setError("Please fill out your name and review details.");
      return;
    }

    const createdReview = {
      id: `custom-review-${Date.now()}`,
      author: newReview.author.trim(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150&h=150`,
      role: newReview.role,
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };

    setReviewsList([createdReview, ...reviewsList]);
    setIsFormOpen(false);
    setNewReview({
      author: "",
      role: "Leisure Traveler",
      rating: 5,
      comment: "",
    });
  };

  return (
    <section id="reviews" className="bg-white py-5 border-bottom position-relative">
      <div className="container px-3 py-3">
        
        {/* Section Header with "Read All Reviews" link */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-5 border-bottom pb-4">
          <div className="d-flex flex-column gap-1">
            <h2 className="font-display h2 fw-bold text-dark tracking-tight mb-0">Guest Experiences</h2>
            <p className="text-muted small mb-0">
              What our visitors are saying about their stay
            </p>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-outline-gold rounded-full px-4 py-2 fw-semibold small d-flex align-items-center gap-1.5 cursor-pointer"
              id="write-review-trigger"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Write a Review
            </button>
            <a 
              href="#reviews" 
              onClick={(e) => {
                e.preventDefault();
                setIsFormOpen(true);
              }}
              className="text-gold-600 hover-text-gold-500 fw-semibold small d-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: "13px" }}
            >
              Read All Reviews <span>→</span>
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="row g-4">
          {reviewsList.slice(0, 3).map((review) => (
            <div key={review.id} className="col-12 col-md-4">
              <div 
                className="card h-100 rounded-2xl border-light p-4 shadow-sm bg-light d-flex flex-column justify-content-between position-relative overflow-hidden"
              >
                <div 
                  className="position-absolute top-0 end-0 rounded-circle" 
                  style={{ width: "64px", height: "64px", backgroundColor: "rgba(37, 99, 235, 0.03)", marginRight: "-24px", marginTop: "-24px" }} 
                />
                
                <div className="position-relative z-3">
                  {/* Stars */}
                  <div className="d-flex align-items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="w-4 h-4" 
                        color="#eab308"
                        fill={star <= review.rating ? "#eab308" : "none"}
                      />
                    ))}
                  </div>

                  {/* Comment quote */}
                  <p className="text-muted small italic leading-relaxed mb-4">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="d-flex align-items-center gap-3 pt-3 border-top border-slate-200/50 position-relative z-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    referrerPolicy="no-referrer"
                    className="rounded-circle border"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <div>
                    <h4 className="fw-bold text-dark mb-0 leading-tight" style={{ fontSize: "13px" }}>
                      {review.author}
                    </h4>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>
                      {review.role}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Write Review Modal Backdrop & Form */}
      {isFormOpen && (
        <div className="custom-modal-overlay">
          <div 
            className="position-absolute w-100 h-100"
            onClick={() => setIsFormOpen(false)}
            style={{ zIndex: "1" }}
          />
          
          <div 
            className="position-relative bg-white rounded-2xl shadow-lg p-4 p-md-5 animate-fadeIn"
            style={{ zIndex: "2", width: "100%", maxWidth: "440px" }}
          >
            
            {/* Close */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
              style={{ width: "32px", height: "32px" }}
              id="close-review-form"
            >
              <X className="w-4 h-4 text-muted" />
            </button>

            <div className="d-flex flex-column gap-3">
              <div className="text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center bg-gold-50 border border-gold-200 text-gold-500 rounded-circle mb-2"
                  style={{ width: "42px", height: "42px" }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display h5 fw-bold text-dark mb-1">Share Your Experience</h3>
                <p className="text-muted small mb-0">Your valuable feedback ensures we maintain pristine service standards.</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small mb-0">
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="d-flex flex-column gap-3">
                {/* Author Name */}
                <div>
                  <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Your Name *</label>
                  <input
                    type="text"
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    placeholder="E.g. Richard Hendricks"
                    className="form-control bg-light border-0 text-dark"
                    style={{ borderRadius: "50px", height: "42px", fontSize: "14px" }}
                    id="review-name-input"
                  />
                </div>

                {/* Role / Traveler Type */}
                <div>
                  <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Traveler Type</label>
                  <select
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                    className="form-select bg-light border-0 text-dark cursor-pointer"
                    style={{ borderRadius: "50px", height: "42px", fontSize: "14px" }}
                    id="review-type-select"
                  >
                    <option value="Business Traveler">Business Traveler</option>
                    <option value="Family Trip">Family Trip</option>
                    <option value="Solo Explorer">Solo Explorer</option>
                    <option value="Honeymoon Getaway">Honeymoon Getaway</option>
                    <option value="Luxury Seeker">Luxury Seeker</option>
                  </select>
                </div>

                  {/* Rating selection (Interactive stars) */}
                  <div>
                    <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Your Rating</label>
                    <div className="d-flex align-items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="btn btn-link p-0 border-0 bg-transparent cursor-pointer"
                        >
                          <Star 
                            className="w-6 h-6" 
                            color="#eab308"
                            fill={star <= newReview.rating ? "#eab308" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                {/* Comment / Review Description */}
                <div>
                  <label className="form-label mb-1 fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: "10px" }}>Review Details *</label>
                  <textarea
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell future guests about the service, facilities, dining, or views..."
                    className="form-control bg-light border-0 text-dark rounded-2xl p-3"
                    style={{ fontSize: "14px" }}
                    id="review-text-textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gold rounded-full w-100 py-2.5 fw-bold cursor-pointer"
                  id="submit-review-btn"
                >
                  Submit Review
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
