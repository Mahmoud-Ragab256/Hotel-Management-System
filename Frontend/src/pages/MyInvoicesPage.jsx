import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spinner, Alert, Table } from "react-bootstrap";
import { dashboardApi, getApiErrorMessage } from "../services/api.js";

const MyInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = await dashboardApi.getMe();
      const email = currentUser?.email || "";

      if (!email) {
        setError("Could not identify the logged-in user.");
        setInvoices([]);
        return;
      }

      const allBookings = await dashboardApi.getBookings();
      const userBookings = (allBookings || []).filter(
        (b) => b?.guestId?.email?.toLowerCase() === email.toLowerCase()
      );

      const userBookingIds = userBookings.map((b) => (b._id || b.id || "").toString());

      const allInvoices = await dashboardApi.getInvoices();

      const userInvoices = (allInvoices || []).filter((invoice) => {
        if (!invoice) return false;

        const invoiceBookingStr = invoice.bookingId?._id || invoice.bookingId;
        if (!invoiceBookingStr) return false;

        return userBookingIds.includes(invoiceBookingStr.toString());
      });

      setInvoices(userInvoices);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    try {
      setActionLoading(invoiceId);
      setError("");
      await dashboardApi.updateInvoice(invoiceId, { status: "Paid" });
      await fetchInvoices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvoice = async (invoiceId, bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this invoice and its related booking?")) {
      return;
    }

    try {
      setActionLoading(invoiceId);
      setError("");

      await dashboardApi.updateInvoice(invoiceId, { status: "Cancelled" });

      if (bookingId) {
        await dashboardApi.cancelBooking(bookingId, "Invoice cancelled by user");
      }

      await fetchInvoices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.trim()) {
      case "Paid":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";
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
        <h2 className="fw-bold m-0">My Invoices</h2>
        <p className="text-muted m-0">Manage your billing, payments, and invoice statements</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && invoices.length === 0 && (
        <Alert variant="info" className="text-center py-4">
          You don't have any invoices at the moment.
        </Alert>
      )}

      {invoices.length > 0 && (
        <Card className="border-0 shadow-sm rounded overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-dark">
              <thead className="bg-light text-secondary small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="py-3">Room</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Issue Date</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const id = invoice._id || invoice.id || "";
                  const bId = invoice?.bookingId?._id || invoice?.bookingId || "";
                  const roomNum = invoice?.bookingId?.roomId?.roomNumber || invoice?.bookingId?.roomNumber || "N/A";

                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 fw-mono text-muted small">
                        #{id ? id.substring(0, 8) : "N/A"}...
                      </td>
                      <td className="py-3 fw-semibold">
                        Room #{roomNum}
                      </td>
                      <td className="py-3 text-primary fw-bold">
                        ${invoice.totalAmount || 0}
                      </td>
                      <td className="py-3">
                        <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-3 text-muted small">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {invoice.status?.trim() === "Pending" && (
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={actionLoading !== null}
                              onClick={() => handlePayInvoice(id)}
                            >
                              {actionLoading === id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Pay"
                              )}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={actionLoading !== null}
                              onClick={() => handleCancelInvoice(id, bId)}
                            >
                              {actionLoading === id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          </div>
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

export default MyInvoicesPage;