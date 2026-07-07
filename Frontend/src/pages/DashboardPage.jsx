import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Card, Spinner, Alert } from 'react-bootstrap';
import { dashboardApi, getApiErrorMessage } from '../services/api';
import { formatDisplayDate } from '../utils/date.ts';
import StatCard from '../components/StatCard';
import { useTheme } from '../context/ThemeContext.jsx';
import { 
  faBed, 
  faCalendarCheck, 
  faDollarSign, 
  faClipboardList, 
  faTools 
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
  const { colors, isDark } = useTheme();
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
        borderColor: isDark ? '#4f46e5' : '#4e54c8',
        backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(78, 84, 200, 0.05)',
        tension: 0.4, 
        pointRadius: 2, 
        pointBackgroundColor: isDark ? '#4f46e5' : '#4e54c8',
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#111625' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1a1a1a',
        bodyColor: isDark ? '#9ca3af' : '#5a5a5a',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        padding: 10
      }
    }, 
    scales: {
      y: { 
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)', drawBorder: false }, 
        ticks: { color: isDark ? '#7c8ba1' : '#6b7280' } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: isDark ? '#7c8ba1' : '#6b7280' } 
      }
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
        backgroundColor: isDark ? ['#10b981', '#f59e0b', '#ef4444'] : ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: isDark ? 2 : 0,
        borderColor: isDark ? '#111625' : '#ffffff',
        cutout: '75%' 
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#111625' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1a1a1a',
        bodyColor: isDark ? '#9ca3af' : '#5a5a5a',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        padding: 10
      }
    }
  };

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
        <Col lg={8}>
          <Card 
            className="border-0 shadow-sm h-100 p-4"
            style={{ 
              backgroundColor: colors.bgCard, 
              color: colors.textPrimary, 
              border: isDark ? `1px solid ${colors.borderCard}` : 'none' 
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: colors.textPrimary }}>Revenue Trend</h5>
                  <small style={{ color: colors.textSecondary }}>Monthly overview of room & service earnings</small>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card 
            className="border-0 shadow-sm h-100 p-4"
            style={{ 
              backgroundColor: colors.bgCard, 
              color: colors.textPrimary, 
              border: isDark ? `1px solid ${colors.borderCard}` : 'none' 
            }}
          >
            <Card.Body>
              <h5 className="fw-bold mb-1" style={{ color: colors.textPrimary }}>Booking Status</h5>
              <small style={{ color: colors.textSecondary }}>Current distribution of reservations</small>
              <div className="position-relative d-flex justify-content-center align-items-center my-4" style={{ height: '200px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="position-absolute text-center">
                  <h3 className="fw-bold mb-0" style={{ color: colors.textPrimary }}>{stats.bookingStatusDistribution.total}</h3>
                  <small style={{ fontSize: '10px', color: colors.textSecondary }} className="text-uppercase">Total</small>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: colors.textPrimary }}>
                    <span className="badge bg-success rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>
                    Confirmed
                  </span>
                  <span className="fw-bold" style={{ color: colors.textPrimary }}>{stats.bookingStatusDistribution.confirmed}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: colors.textPrimary }}>
                    <span className="badge bg-warning rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>
                    Pending
                  </span>
                  <span className="fw-bold" style={{ color: colors.textPrimary }}>{stats.bookingStatusDistribution.pending}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: colors.textPrimary }}>
                    <span className="badge bg-danger rounded-circle me-2" style={{ width: '10px', height: '10px', display: 'inline-block' }}></span>
                    Cancelled
                  </span>
                  <span className="fw-bold" style={{ color: colors.textPrimary }}>{stats.bookingStatusDistribution.cancelled}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card 
            className="border-0 shadow-sm p-4"
            style={{ 
              backgroundColor: colors.bgCard, 
              color: colors.textPrimary, 
              border: isDark ? `1px solid ${colors.borderCard}` : 'none' 
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: colors.textPrimary }}>Recent Bookings</h5>
              </div>
              <Table responsive hover borderless className="align-middle mb-0" style={{ color: colors.textPrimary }}>
                <thead style={{ background: isDark ? colors.bgCardAlt : '#f8f9fa' }}>
                  <tr>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Guest</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Room</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Status</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking._id} style={{ borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'rgba(0,0,0,0.05)' }}>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>
                        <div className="fw-semibold" style={{ color: colors.textPrimary }}>{booking.guestId?.firstName} {booking.guestId?.lastName}</div>
                        <small style={{ color: colors.textSecondary }}>{booking.guestId?.email}</small>
                      </td>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>{booking.roomId?.roomNumber || 'N/A'}</td>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>
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
                      <td style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>{formatDisplayDate(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card 
            className="border-0 shadow-sm p-4"
            style={{ 
              backgroundColor: colors.bgCard, 
              color: colors.textPrimary, 
              border: isDark ? `1px solid ${colors.borderCard}` : 'none' 
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: colors.textPrimary }}>Service Orders</h5>
              </div>
              <Table responsive hover borderless className="align-middle mb-0" style={{ color: colors.textPrimary }}>
                <thead style={{ background: isDark ? colors.bgCardAlt : '#f8f9fa' }}>
                  <tr>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Room</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Service</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Assigned To</th>
                    <th style={{ color: colors.textSecondary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceOrders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'rgba(0,0,0,0.05)' }}>
                      <td className="fw-semibold" style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>{order.bookingId?.roomId?.roomNumber || 'N/A'}</td>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>{order.serviceId?.name || 'Custom Service'}</td>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>{order.assignedEmployeeId ? `${order.assignedEmployeeId.firstName} ${order.assignedEmployeeId.lastName}` : 'Unassigned'}</td>
                      <td style={{ color: colors.textPrimary, borderBottom: isDark ? `1px solid ${colors.borderCard}` : 'none' }}>
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