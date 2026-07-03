import React, { useState, useEffect } from "react";
import { Table, Badge, Spinner, Alert, Card, Button } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const loadPageData = async () => {
    try {
      setError("");

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";
      setUserEmail(email);

      if (!email) {
        setError("Could not identify the logged-in user.");
        setLoading(false);
        return;
      }


      const allBookings = await dashboardApi.getBookings();
      const userBookings = (allBookings || []).filter(
        (b) => b?.guestId?.email?.toLowerCase() === email.toLowerCase()
      );
      
      setBookings(userBookings);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);


  const handleConfirm = async (bookingId) => {
    if (!window.confirm("Are you sure you want to confirm this booking?")) return;
    setActionLoading(true);
    try {

      await dashboardApi.updateBooking(bookingId, { status: "Confirmed" });
      await loadPageData(); 
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };


  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Please enter the reason for cancellation:");
    if (reason === null) return; 
    if (!reason.trim()) {
      alert("Cancellation reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      
      await dashboardApi.cancelBooking(bookingId, reason);
      await loadPageData(); 
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const currentStatus = status?.trim();
    switch (currentStatus) {
      case "Confirmed":
        return <Badge bg="success">Confirmed</Badge>;
      case "CheckedIn":
      case "Checked In":
        return <Badge bg="info">Checked In</Badge>;
      case "CheckedOut":
      case "Checked Out":
        return <Badge bg="secondary">Checked Out</Badge>;
      case "Cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      case "Pending":
        return <Badge bg="warning" text="dark">Pending</Badge>;
      default:
        return <Badge bg="primary">{status || "Unknown"}</Badge>;
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
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0">My Bookings</h2>
        <p className="text-muted m-0">Manage and track your entire hotel reservation history</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {!loading && bookings.length === 0 && (
        <Alert variant="info" className="text-center py-4">
          You haven't made any bookings yet.
        </Alert>
      )}

      {bookings.length > 0 && (
        <Card className="border-0 shadow-sm rounded overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-dark">
              <thead className="bg-light text-secondary small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="py-3">Room</th>
                  <th className="py-3">Check-In</th>
                  <th className="py-3">Check-Out</th>
                  <th className="py-3">Total Paid</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const id = booking._id || booking.id || "";
                  const roomNum = booking.roomId?.roomNumber || booking.roomNumber || "N/A";
                  const isPending = booking.status?.trim() === "Pending";
                  
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 fw-mono text-muted small">
                        #{id ? id.substring(0, 8) : "N/A"}...
                      </td>
                      <td className="py-3 fw-semibold">
                        Room #{roomNum}
                      </td>
                      <td className="py-3">
                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3">
                        {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 fw-bold text-primary">
                        ${booking.totalPrice || 0}
                      </td>
                      <td className="py-3 text-center">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {isPending ? (
                          <div className="d-flex justify-content-end gap-2">
                            <Button 
                              variant="success" 
                              size="sm" 
                              disabled={actionLoading}
                              onClick={() => handleConfirm(id)}
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              disabled={actionLoading}
                              onClick={() => handleCancel(id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyBookingsPage;