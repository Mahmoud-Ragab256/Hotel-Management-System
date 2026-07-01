 import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { dashboardApi, getApiErrorMessage } from '../services/api';
import { formatDate } from '../utils/date';
import StatCard from '../components/StatCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBed, 
  faCalendarCheck, 
  faDollarSign, 
  faClipboardList, 
  faTools,
} from '@fortawesome/free-solid-svg-icons';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!stats) return null;


  const lineChartData = {
    labels: stats.revenueTrend.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: stats.revenueTrend.map(item => item.revenue),
        fill: true,
        borderColor: '#4e54c8',
        backgroundColor: 'rgba(78, 84, 200, 0.05)',
        tension: 0.4, 
        pointRadius: 0, 
        pointHoverRadius: 5
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }, 
    scales: {
      y: { grid: { display: false }, ticks: { display: true } },
      x: { grid: { display: false } }
    }
  };


  const doughnutData = {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.bookingStatusDistribution.confirmed,
          stats.bookingStatusDistribution.pending,
          stats.bookingStatusDistribution.cancelled
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        cutout: '75%' 
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const guestPortal = stats.guestPortal || { total: stats.cards?.guestPortalBookings?.value || 0, pending: 0 };
  const recentGuests = stats.recentGuests || [];

  return (
    <div className="dashboard-wrapper">
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} xl={2.4} style={{ flex: '0 0 auto', width: '20%' }} className="custom-card-col">
          <StatCard 
            title="Occupancy Rate" 
            value={`${stats.cards.occupancyRate.value}%`} 
            icon={faBed} 
            description={stats.cards.occupancyRate.change}
            variant="primary"
          />
        </Col>
        <Col xs={12} sm={6} xl={2.4} style={{ flex: '0 0 auto', width: '20%' }} className="custom-card-col">
          <StatCard 
            title="Total Bookings" 
            value={stats.cards.totalBookings.value} 
            icon={faCalendarCheck} 
            description={stats.cards.totalBookings.change}
            variant="success"
          />
        </Col>
        <Col xs={12} sm={6} xl={2.4} style={{ flex: '0 0 auto', width: '20%' }} className="custom-card-col">
          <StatCard 
            title="Revenue" 
            value={`$${stats.cards.revenue.value.toLocaleString()}`} 
            icon={faDollarSign} 
            description={stats.cards.revenue.change}
            variant="danger"
          />
        </Col>
        <Col xs={12} sm={6} xl={2.4} style={{ flex: '0 0 auto', width: '20%' }} className="custom-card-col">
          <StatCard 
            title="Pending Orders" 
            value={stats.cards.pendingOrders.value} 
            icon={faClipboardList} 
            description="Requiring action"
            variant="warning"
          />
        </Col>
        <Col xs={12} sm={6} xl={2.4} style={{ flex: '0 0 auto', width: '20%' }} className="custom-card-col">
          <StatCard 
            title="Maintenance" 
            value={stats.cards.maintenanceRooms.value} 
            icon={faTools} 
            description="Rooms offline"
            variant="secondary"
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm h-100 p-4">
            <Card.Body>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Guest Website Activity</h5>
                  <small className="text-muted">
                    Website bookings, pending website bookings, and recent guest registrations in one place.
                  </small>
                </div>
                <Badge bg="primary">Client Portal</Badge>
              </div>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                    <div className="text-muted small mb-2">Website bookings</div>
                    <div className="d-flex align-items-center justify-content-between">
                      <strong className="fs-3">{guestPortal.total}</strong>
                      <Badge bg="info">Guest Website</Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                    <div className="text-muted small mb-2">Pending website bookings</div>
                    <div className="d-flex align-items-center justify-content-between">
                      <strong className="fs-3">{guestPortal.pending}</strong>
                      <Badge bg="warning" text="dark">Pending</Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                    <div className="text-muted small mb-2">Recent guest registrations</div>
                    <div className="d-flex align-items-center justify-content-between">
                      <strong className="fs-3">{recentGuests.length}</strong>
                      <Badge bg="secondary">Latest</Badge>
                    </div>
                  </div>
                </Col>
              </Row>

              <Table responsive hover borderless className="align-middle mb-0">
                <thead className="table-light text-muted">
                  <tr>
                    <th>Guest</th>
                    <th>Phone</th>
                    <th>VIP</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGuests.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted py-3">No guest registrations yet.</td></tr>
                  ) : recentGuests.map((guest) => (
                    <tr key={guest._id}>
                      <td>
                        <div className="fw-semibold">{guest.fullName || 'Unknown Guest'}</div>
                        <small className="text-muted">{guest.email || 'No email'}</small>
                      </td>
                      <td>{guest.phone || 'N/A'}</td>
                      <td><Badge bg="secondary">{guest.vipLevel || 'Bronze'}</Badge></td>
                      <td>{formatDate(guest.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100 p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Revenue Trend</h5>
                  <small className="text-muted">Monthly overview of room & service earnings</small>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100 p-4">
            <Card.Body>
              <h5 className="fw-bold mb-1">Booking Status</h5>
              <small className="text-muted">Current distribution of reservations</small>
              <div className="position-relative d-flex justify-content-center align-items-center my-4" style={{ height: '200px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="position-absolute text-center">
                  <h3 className="fw-bold mb-0">{stats.bookingStatusDistribution.total}</h3>
                  <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>Total</small>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-success rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>Confirmed</span>
                  <span className="fw-bold">{stats.bookingStatusDistribution.confirmed}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-warning rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>Pending</span>
                  <span className="fw-bold">{stats.bookingStatusDistribution.pending}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span><span className="badge bg-danger rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>Cancelled</span>
                  <span className="fw-bold">{stats.bookingStatusDistribution.cancelled}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Recent Bookings</h5>
              </div>
              <Table responsive hover borderless className="align-middle mb-0">
                <thead className="table-light text-muted">
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div className="fw-semibold">{booking.guestId?.fullName || 'Unknown Guest'}</div>
                        <small className="text-muted">{booking.guestId?.email}</small>
                      </td>
                      <td>{booking.roomId?.roomNumber || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'CheckedIn' || booking.status === 'CheckedOut' || booking.status === 'Confirmed'
                            ? 'bg-success-subtle text-success'
                            : booking.status === 'Pending'
                            ? 'bg-warning-subtle text-warning'
                            : 'bg-danger-subtle text-danger'
                        } px-2.5 py-1.5 rounded`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <Badge bg={booking.source === 'GuestPortal' ? 'info' : 'secondary'}>
                          {booking.source === 'GuestPortal' ? 'Guest Website' : 'Dashboard'}
                        </Badge>
                      </td>
                      <td>{formatDate(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Service Orders</h5>
              </div>
              <Table responsive hover borderless className="align-middle mb-0">
                <thead className="table-light text-muted">
                  <tr>
                    <th>Room</th>
                    <th>Service</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="fw-semibold">{order.bookingId?.roomId?.roomNumber || 'N/A'}</td>
                      <td>{order.serviceId?.name || 'Custom Service'}</td>
                      <td>{order.assignedEmployeeId ? `${order.assignedEmployeeId.firstName} ${order.assignedEmployeeId.lastName}` : 'Unassigned'}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'Completed'
                            ? 'bg-success-subtle text-success'
                            : order.status === 'Pending'
                            ? 'bg-warning-subtle text-warning'
                            : 'bg-info-subtle text-info'
                        } px-2.5 py-1.5 rounded`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;