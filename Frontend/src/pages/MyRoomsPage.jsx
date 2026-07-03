import React, { useState, useEffect } from "react";
import { Row, Col, Card, Modal, Button, Spinner, Alert } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";

const MyRoomsPage = () => {
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

        const bookings = await dashboardApi.getBookings();
        
        const activeRooms = [];
        const seenRoomIds = new Set();

        (bookings || []).forEach((booking) => {
          if (
            booking.roomId && 
            booking?.guestId?.email?.toLowerCase() === email.toLowerCase() &&
            !seenRoomIds.has(booking.roomId._id)
          ) {
            if (booking.status !== "Cancelled") {
              seenRoomIds.add(booking.roomId._id);
              activeRooms.push({
                ...booking.roomId,
                bookingStatus: booking.status,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                totalPrice: booking.totalPrice,
                bookingId: booking._id || booking.id
              });
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
      <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">My Rooms</h2>
          <p className="text-muted m-0">View details of your currently booked hotel rooms</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && rooms.length === 0 && (
        <Alert variant="info" className="text-center py-4">
          You don't have any active booked rooms at the moment.
        </Alert>
      )}

      <Row className="g-4">
        {rooms.map((room) => (
          <Col key={room._id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 shadow-sm border-0 overflow-hidden">
              <div 
                style={{ cursor: "pointer", height: "200px", overflow: "hidden" }}
                onClick={() => handleOpenModal(room)}
              >
                <Card.Img
                  variant="top"
                  src={room.images?.[0] || "https://placehold.co/600x400?text=No+Room+Image"}
                  alt={`Room ${room.roomNumber}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <Card.Body className="d-flex flex-column text-dark">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">Room #{room.roomNumber}</h5>
                  <span className={`badge ${getStatusBadgeClass(room.bookingStatus)}`}>
                    {room.bookingStatus}
                  </span>
                </div>
                <Card.Text className="text-muted small mb-3 flex-grow-1">
                  Type: {room.type || "Standard"} <br />
                  Floor: {room.floor || "1st Floor"}
                </Card.Text>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="w-100 fw-semibold"
                  onClick={() => handleOpenModal(room)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedRoom && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton className="text-dark">
            <Modal.Title className="fw-bold">Room #{selectedRoom.roomNumber} Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-dark">
            <Row className="g-4">
              <Col md={6}>
                <img
                  src={selectedRoom.images?.[0] || "https://placehold.co/600x400?text=No+Room+Image"}
                  alt={`Room ${selectedRoom.roomNumber}`}
                  className="img-fluid rounded shadow-sm w-100"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              </Col>
              <Col md={6}>
                <h4 className="fw-bold text-primary mb-3">Specifications</h4>
                <table className="table table-borderless sm__table text-dark mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Room Number:</td>
                      <td className="text-muted py-2">{selectedRoom.roomNumber}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Room Type:</td>
                      <td className="text-muted py-2">{selectedRoom.type || "Standard"}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Floor Level:</td>
                      <td className="text-muted py-2">{selectedRoom.floor || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Booking ID:</td>
                      <td className="text-muted py-2 fw-mono small">
                        #{selectedRoom.bookingId ? selectedRoom.bookingId.substring(0, 8) : "N/A"}...
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Total Price:</td>
                      <td className="text-primary fw-bold py-2">${selectedRoom.totalPrice || 0}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Check-In Date:</td>
                      <td className="text-muted py-2">
                        {selectedRoom.checkInDate ? new Date(selectedRoom.checkInDate).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold px-0 py-2">Check-Out Date:</td>
                      <td className="text-muted py-2">
                        {selectedRoom.checkOutDate ? new Date(selectedRoom.checkOutDate).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MyRoomsPage;

