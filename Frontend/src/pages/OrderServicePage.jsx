import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const OrderServicePage = () => {
  const { colors, isDark } = useTheme();
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

  const statusColors = {
    Completed: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    Pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
    Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.2)' },
  };

  const getStatusPill = (status) => {
    const currentStatus = status || "Pending";
    const colorsObj = statusColors[currentStatus] || { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '600',
        background: colorsObj.bg,
        color: colorsObj.text,
        border: `1px solid ${colorsObj.border}`,
        fontFamily: '"Inter", sans-serif'
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colorsObj.text }} />
        {currentStatus}
      </span>
    );
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
      <div className="mb-4">
        <h2 className="fw-bold m-0" style={{ color: colors.textPrimary }}>Order a Service</h2>
        <p className="m-0" style={{ color: colors.textSecondary }}>Request hotel services directly to your room</p>
      </div>

      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg("")} dismissible>{successMsg}</Alert>}

      <div
        style={{
          background: colors.bgCard,
          borderRadius: '20px',
          border: `1px solid ${colors.borderCard}`,
          boxShadow: colors.shadow,
          padding: '24px',
          boxSizing: 'border-box',
          marginBottom: '40px'
        }}
      >
        <h4 className="fw-bold mb-4" style={{ fontSize: "1.25rem", color: colors.textPrimary }}>Request New Service</h4>
        
        {myBookings.length === 0 ? (
          <Alert variant="warning">
            You need an active hotel booking or checked-in room to order services.
          </Alert>
        ) : (
          <Form onSubmit={handleOrderSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: colors.textSecondary }}>Select Room / Booking</Form.Label>
                  <Form.Select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    required
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '10px 14px',
                      outline: 'none',
                      fontSize: '14.5px'
                    }}
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
                  <Form.Label className="fw-semibold" style={{ color: colors.textSecondary }}>Available Services</Form.Label>
                  <Form.Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '10px 14px',
                      outline: 'none',
                      fontSize: '14.5px'
                    }}
                  >
                    <option value="" style={{ backgroundColor: colors.bgCard, color: colors.textSecondary }}>-- Choose a Service --</option>
                    {services.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id} style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                        {s.name} - ${s.price} ({s.category || "General"})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: colors.textSecondary }}>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '10px 14px',
                      outline: 'none',
                      fontSize: '14.5px'
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: colors.textSecondary }}>Special Instructions / Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Please bring extra towels, deliver at 4 PM..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '10px 14px',
                      outline: 'none',
                      fontSize: '14.5px'
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="text-end mt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    background: colors.accent,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {submitLoading ? (
                    <div style={{ width: '16px', height: '16px', border: '1.5px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </Col>
            </Row>
          </Form>
        )}
      </div>

      <div className="mb-3">
        <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem", color: colors.textPrimary }}>Orders Log</h4>
        <p className="m-0" style={{ color: colors.textSecondary }}>History of your requested services</p>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow
          }}
        >
          <p className="m-0" style={{ color: colors.textSecondary }}>You haven't ordered any services yet.</p>
        </div>
      ) : (
        <div
          style={{
            background: colors.bgCard,
            borderRadius: '20px',
            border: `1px solid ${colors.borderCard}`,
            boxShadow: colors.shadow,
            overflow: 'hidden'
          }}
        >
          <div className="table-responsive">
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                color: colors.textPrimary,
                fontSize: '14.5px'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    borderBottom: `1px solid ${colors.borderCard}`,
                    textAlign: 'left'
                  }}
                >
                  <th className="px-4 py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary, width: '15%' }}>Order ID</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Service</th>
                  <th className="py-3 text-uppercase small fw-bold text-center" style={{ color: colors.textSecondary }}>Qty</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Total Price</th>
                  <th className="py-3 text-uppercase small fw-bold text-center" style={{ color: colors.textSecondary }}>Status</th>
                  <th className="py-3 text-uppercase small fw-bold" style={{ color: colors.textSecondary }}>Notes</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-end" style={{ color: colors.textSecondary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const id = order._id || order.id || "";
                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: `1px solid ${colors.borderCard}`,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.01)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-4 py-3 fw-mono small" style={{ color: colors.textSecondary }}>
                        #{id ? id.substring(0, 8).toUpperCase() : "N/A"}
                      </td>
                      <td className="py-3 fw-semibold" style={{ color: colors.textPrimary }}>
                        {order.serviceId?.name || "Custom Service"}
                      </td>
                      <td className="py-3 text-center" style={{ color: colors.textSecondary }}>
                        {order.quantity || 1}
                      </td>
                      <td className="py-3 fw-bold" style={{ color: colors.accent }}>
                        ${Number(order.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        {getStatusPill(order.status)}
                      </td>
                      <td className="py-3 small text-truncate" style={{ color: colors.textSecondary, maxWidth: "200px" }}>
                        {order.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button
                          disabled={order.status !== "Pending" || actionLoading !== null}
                          onClick={() => handleCancelOrder(id)}
                          style={{
                            background: 'transparent',
                            color: order.status === "Pending" ? '#ef4444' : colors.textSecondary,
                            border: `1px solid ${order.status === "Pending" ? '#ef4444' : colors.borderCard}`,
                            borderRadius: '12px',
                            padding: '6px 14px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: order.status === "Pending" ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            opacity: order.status === "Pending" ? '1' : '0.5',
                            minWidth: '70px',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => { if (order.status === "Pending") e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; }}
                          onMouseLeave={(e) => { if (order.status === "Pending") e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {actionLoading === id ? (
                            <div style={{ width: '12px', height: '12px', border: '1.5px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderServicePage;