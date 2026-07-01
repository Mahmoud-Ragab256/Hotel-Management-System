import { Request, Response } from 'express';
import { Booking } from '../../DB/Models/booking.model.js';
import { Room } from '../../DB/Models/room.model.js';
import { ServiceOrder } from '../../DB/Models/serviceOrder.model.js';


export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const totalBookings = await Booking.countDocuments();

    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const pendingOrders = await ServiceOrder.countDocuments({ status: 'Pending' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    const bookingStatusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bookingStatusDistribution = {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      total: totalBookings
    };

    bookingStatusCounts.forEach(item => {
      if (item._id === 'Confirmed' || item._id === 'CheckedIn' || item._id === 'CheckedOut') {
        bookingStatusDistribution.confirmed += item.count;
      } else if (item._id === 'Pending') {
        bookingStatusDistribution.pending += item.count;
      } else if (item._id === 'Cancelled') {
        bookingStatusDistribution.cancelled += item.count;
      }
    });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('guestId', 'firstName lastName email') 
      .populate('roomId', 'roomNumber'); 

    const serviceOrders = await ServiceOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'bookingId',
        populate: { path: 'roomId', select: 'roomNumber' } 
      })
      .populate('serviceId', 'name')
      .populate('assignedEmployeeId', 'firstName lastName'); 

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] } } },
      {
        $group: {
          _id: { $month: '$checkInDate' },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrend = monthsNames.map((month, index) => {
      const found = monthlyRevenue.find(item => item._id === index + 1);
      return {
        month,
        revenue: found ? found.revenue : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        cards: {
          occupancyRate: { value: Number(occupancyRate.toFixed(1)), change: "+5.2%" }, // الـ change ممكن نخليه استاتيك أو تحسبيه مقارنة بالشهر اللي فات لو مطلوب
          totalBookings: { value: totalBookings, change: "12% vs last month" },
          revenue: { value: totalRevenue, change: "-2.1% decrease" },
          pendingOrders: { value: pendingOrders },
          maintenanceRooms: { value: maintenanceRooms }
        },
        bookingStatusDistribution,
        revenueTrend,
        recentBookings,
        serviceOrders
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
};