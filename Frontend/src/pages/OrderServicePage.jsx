import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";

const OrderServicePage = () => {
  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [selectedService, setSelectedService] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";

      if (!email) {
        setError("Could not identify the logged-in user.");
        return;
      }

      const [allServices, allBookings, allOrders] = await Promise.all([
        dashboardApi.getServices(),
        dashboardApi.getBookings(),
        dashboardApi.getServiceOrders()
      ]);

      setServices(allServices || []);

      const userBookings = (allBookings || []).filter(
        (b) => b?.guestId?.email?.toLowerCase() === email.toLowerCase() && b?.status !== "Cancelled"
      );
      setMyBookings(userBookings);

      if (userBookings.length > 0) {
        setSelectedBooking(userBookings[0]._id || userBookings[0].id || "");
      }

      const userBookingIds = userBookings.map((b) => (b._id || b.id || "").toString());
      const userOrders = (allOrders || []).filter((order) => {
        const orderBookingId = order?.bookingId?._id || order?.bookingId;
        return orderBookingId && userBookingIds.includes(orderBookingId.toString());
      });

      setOrders(userOrders);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedBooking) {
      setError("Please select both a service and your active room/booking.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");
      setSuccessMsg("");

      const serviceObj = services.find((s) => (s._id || s.id) === selectedService);
      const price = serviceObj?.price || 0;
      const calculatedTotal = price * quantity;

      const payload = {
        bookingId: selectedBooking,
        serviceId: selectedService,
        quantity: Number(quantity),
        totalPrice: calculatedTotal,
        notes: notes.trim()
      };

      await dashboardApi.createServiceOrder(payload);
      
      setSuccessMsg("Service ordered successfully! The cost has been added to your invoice.");
      setSelectedService("");
      setQuantity(1);
      setNotes("");
      
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this service order?")) {
      return;
    }

    try {
      setActionLoading(orderId);
      setError("");
      setSuccessMsg("");

      await dashboardApi.updateServiceOrder(orderId, { status: "Cancelled" });
      setSuccessMsg("Service order cancelled successfully.");
      
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Completed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
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
    <div className="container-fluid px-0 text-dark">
      <div className="mb-4">
        <h2 className="fw-bold m-0">Order a Service</h2>
        <p className="text-muted m-0">Request hotel services directly to your room</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg("")} dismissible>{successMsg}</Alert>}

      <Card className="border-0 shadow-sm rounded mb-5">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-dark" style={{ fontSize: "1.25rem" }}>Request New Service</h4>
          
          {myBookings.length === 0 ? (
            <Alert variant="warning">
              You need an active hotel booking or checked-in room to order services.
            </Alert>
          ) : (
            <Form onSubmit={handleOrderSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Select Room / Booking</Form.Label>
                    <Form.Select
                      value={selectedBooking}
                      onChange={(e) => setSelectedBooking(e.target.value)}
                      required
                    >
                      {myBookings.map((b) => (
                        <option key={b._id || b.id} value={b._id || b.id}>
                          Room #{b.roomId?.roomNumber || b.roomNumber || "N/A"} ({b.roomId?.type || "Stay"})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Available Services</Form.Label>
                    <Form.Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a Service --</option>
                      {services.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name} - ${s.price} ({s.category || "General"})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Special Instructions / Notes</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Please bring extra towels, deliver at 4 PM..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={12} className="text-end mt-4">
                  <Button type="submit" variant="primary" disabled={submitLoading}>
                    {submitLoading ? <Spinner animation="border" size="sm" /> : "Confirm Order"}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>

      <div className="mb-3">
        <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>Orders Log</h4>
        <p className="text-muted small m-0">History of your requested services</p>
      </div>

      {orders.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          You haven't ordered any services yet.
        </Alert>
      ) : (
        <Card className="border-0 shadow-sm rounded overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-dark">
              <thead className="bg-light text-secondary small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="py-3">Service</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Total Price</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Notes</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const id = order._id || order.id || "";
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 fw-mono text-muted small">
                        #{id ? id.substring(0, 8) : "N/A"}...
                      </td>
                      <td className="py-3 fw-semibold">
                        {order.serviceId?.name || "Custom Service"}
                      </td>
                      <td className="py-3">
                        {order.quantity || 1}
                      </td>
                      <td className="py-3 fw-bold text-dark">
                        ${order.totalPrice || 0}
                      </td>
                      <td className="py-3">
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-3 text-muted small text-truncate" style={{ maxWidth: "200px" }}>
                        {order.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant={order.status === "Pending" ? "danger" : "secondary"}
                          size="sm"
                          disabled={order.status !== "Pending" || actionLoading !== null}
                          onClick={() => handleCancelOrder(id)}
                        >
                          {actionLoading === id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Cancel"
                          )}
                        </Button>
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

export default OrderServicePage;