import React, { useState, useEffect } from "react";
import { Row, Col, Card, Modal } from "react-bootstrap";
import { API_BASE_URL, dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${base}${path}`;
};

const MyRoomsPage = ({ hideHeader = false }) => {
  const { colors, isDark } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        setLoading(true);
        setError("");

        const currentUser = await dashboardApi.getMe();
        const email = currentUser?.email || "";

        if (!email) {
          setError("Could not identify the logged-in user.");
          setLoading(false);
          return;
        }

        const [bookings, allRooms, categories] = await Promise.all([
          dashboardApi.getBookings(),
          dashboardApi.getRooms(),
          dashboardApi.getRoomCategories()
        ]);
        
        const roomMap = new Map();
        (allRooms || []).forEach(room => {
          roomMap.set(room._id || room.id, room);
        });

        const categoryMap = new Map();
        (categories || []).forEach(cat => {
          categoryMap.set(cat._id || cat.id, cat);
        });

        const activeRooms = [];
        const seenRoomIds = new Set();

        (bookings || []).forEach((booking) => {
          if (
            booking.roomId && 
            booking?.guestId?.email?.toLowerCase() === email.toLowerCase()
          ) {
            const roomIdStr = booking.roomId._id || booking.roomId;
            const fullRoom = roomMap.get(roomIdStr);

            if (fullRoom && !seenRoomIds.has(roomIdStr)) {
              if (booking.status !== "Cancelled") {
                seenRoomIds.add(roomIdStr);
                
                const roomCategoryId = fullRoom.categoryId?._id || fullRoom.categoryId;
                const catInfo = categoryMap.get(roomCategoryId);
                
                const roomImages = (fullRoom.images && fullRoom.images.length > 0)
                  ? fullRoom.images
                  : (catInfo?.images || []);

                activeRooms.push({
                  ...fullRoom,
                  categoryName: catInfo?.name || "Luxury Suite",
                  images: roomImages,
                  bookingStatus: booking.status,
                  checkInDate: booking.checkInDate,
                  checkOutDate: booking.checkOutDate,
                  totalPrice: booking.totalPrice,
                  bookingId: booking._id || booking.id
                });
              }
            }
          }
        });

        setRooms(activeRooms);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUserRooms();
  }, []);

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
    setShowModal(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.trim()) {
      case "Confirmed":
        return "bg-success";
      case "CheckedIn":
      case "Checked In":
        return "bg-info text-dark";
      case "CheckedOut":
      case "Checked Out":
        return "bg-secondary";
      case "Pending":
        return "bg-warning text-dark";
      default:
        return "bg-primary";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '200px' }}>
        <div style={{ width: '32px', height: '32px', border: `2px solid ${colors.borderCard}`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0" style={{ color: colors.textPrimary }}>
      {!hideHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold m-0" style={{ color: colors.textPrimary }}>My Rooms</h2>
            <p className="m-0" style={{ color: colors.textSecondary }}>View details of your currently booked hotel rooms</p>
          </div>
        </div>
      )}

      {error && (
        <div 
          style={{
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <div 
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow,
            marginBottom: '20px'
          }}
        >
          <p className="m-0" style={{ color: colors.textSecondary }}>You don't have any active booked rooms at the moment.</p>
        </div>
      )}

      <Row className="g-4">
        {rooms.map((room) => (
          <Col key={room._id} xs={12} sm={6} md={4} lg={3}>
            <Card
              className="h-100 border-0 overflow-hidden"
              style={{
                backgroundColor: colors.bgCard,
                border: isDark ? `1px solid ${colors.borderCard}` : 'none',
                boxShadow: isDark ? 'none' : colors.shadow
              }}
            >
              <div 
                style={{ cursor: "pointer", height: "200px", overflow: "hidden" }}
                onClick={() => handleOpenModal(room)}
              >
                <Card.Img
                  variant="top"
                  src={resolveImageUrl(room.images?.[0]) || "https://placehold.co/600x400?text=No+Room+Image"}
                  alt={`Room ${room.roomNumber}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <Card.Body className="d-flex flex-column" style={{ color: colors.textPrimary }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0" style={{ color: colors.textPrimary }}>Room #{room.roomNumber}</h5>
                  <span className={`badge ${getStatusBadgeClass(room.bookingStatus)}`}>
                    {room.bookingStatus}
                  </span>
                </div>
                <Card.Text className="small mb-3 flex-grow-1" style={{ color: colors.textSecondary }}>
                  Type: {room.categoryName || room.type || "Standard"} <br />
                  Floor: {room.floor || "1st Floor"}
                </Card.Text>
                <button 
                  style={{
                    width: '100%',
                    border: `1px solid ${colors.accent}`,
                    color: colors.accent,
                    backgroundColor: 'transparent',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.accent;
                  }}
                  onClick={() => handleOpenModal(room)}
                >
                  View Details
                </button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedRoom && (
        <>
          <style>{`
            .custom-room-modal-content {
              background-color: ${colors.bgCard} !important;
              border: 1px solid ${colors.borderCard} !important;
              border-radius: 24px !important;
              box-shadow: ${isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)'} !important;
              overflow: hidden;
            }
          `}</style>
          <Modal 
            show={showModal} 
            onHide={handleCloseModal} 
            size="lg" 
            centered
            contentClassName="custom-room-modal-content"
          >
            <Modal.Header style={{ backgroundColor: colors.bgCard, borderBottom: `1px solid ${colors.borderCard}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Modal.Title className="fw-bold" style={{ color: colors.textPrimary, fontFamily: '"Playfair Display", serif', fontSize: '22px' }}>
                Room #{selectedRoom.roomNumber} Details
              </Modal.Title>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textSecondary,
                  fontSize: '26px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  padding: '4px 12px',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
              >
                &times;
              </button>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: colors.bgCard, color: colors.textPrimary, padding: '24px' }}>
              <Row className="g-4 align-items-center">
                <Col md={6}>
                  <img
                    src={resolveImageUrl(selectedRoom.images?.[0]) || "https://placehold.co/600x400?text=No+Room+Image"}
                    alt={`Room ${selectedRoom.roomNumber}`}
                    className="img-fluid w-100"
                    style={{ 
                      maxHeight: "320px", 
                      objectFit: "cover", 
                      borderRadius: '16px',
                      border: `1px solid ${colors.borderCard}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </Col>
                <Col md={6}>
                  <h4 className="fw-bold mb-3" style={{ color: colors.accent, fontFamily: '"Playfair Display", serif' }}>Specifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: "Room Number", value: selectedRoom.roomNumber },
                      { label: "Room Type", value: selectedRoom.categoryName || selectedRoom.type || "Standard" },
                      { label: "Floor Level", value: selectedRoom.floor || "N/A" },
                      { label: "Booking ID", value: `#${selectedRoom.bookingId ? selectedRoom.bookingId.substring(0, 8).toUpperCase() : "N/A"}` },
                      { label: "Total Price", value: `$${Number(selectedRoom.totalPrice || 0).toLocaleString()}`, isPrice: true },
                      { label: "Check-In Date", value: selectedRoom.checkInDate ? new Date(selectedRoom.checkInDate).toLocaleDateString() : "N/A" },
                      { label: "Check-Out Date", value: selectedRoom.checkOutDate ? new Date(selectedRoom.checkOutDate).toLocaleDateString() : "N/A" }
                    ].map((spec, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          paddingBottom: '10px', 
                          borderBottom: i < 6 ? `1px solid ${colors.borderCard}` : 'none' 
                        }}
                      >
                        <span style={{ fontWeight: '600', color: colors.textPrimary }}>{spec.label}:</span>
                        <span style={{ color: spec.isPrice ? colors.accent : colors.textSecondary, fontWeight: spec.isPrice ? '700' : '400' }}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: colors.bgCard, borderTop: `1px solid ${colors.borderCard}` }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: colors.accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Close Details
              </button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default MyRoomsPage;

