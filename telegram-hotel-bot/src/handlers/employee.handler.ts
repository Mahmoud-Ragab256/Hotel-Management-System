import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const Room = mongoose.model('Room');
const Booking = mongoose.model('Booking');
const ServiceOrder = mongoose.model('ServiceOrder');

export class EmployeeHandler {
  // Employee Main Menu
  static async showEmployeeMenu(ctx: BotContext) {
    const buttons = [
      [ctx.t!('employee.menu.stats'), ctx.t!('employee.menu.occupiedRooms')],
      [ctx.t!('employee.menu.pendingRequests')]
    ];

    // Add admin menu for admins
    if (ctx.user?.isAdmin) {
      buttons.push([ctx.t!('admin.menu.broadcast'), ctx.t!('admin.menu.systemSettings')]);
    }

    buttons.push([ctx.t!('buttons.back')]);

    const keyboard = Markup.keyboard(buttons).resize();
    await ctx.reply(ctx.t!('mainMenu.title'), keyboard);
  }

  // Show Today's Statistics
  static async showStats(ctx: BotContext) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count rooms
      const totalRooms = await Room.countDocuments();
      const availableRooms = await Room.countDocuments({ isAvailable: true });
      const occupiedRooms = totalRooms - availableRooms;

      // Count bookings
      const confirmedBookings = await Booking.countDocuments({
        status: 'Confirmed',
        checkInDate: { $gte: today }
      });

      const pendingBookings = await Booking.countDocuments({
        status: 'Pending'
      });

      // Calculate revenue
      const todayBookings = await Booking.find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $in: ['Confirmed', 'CheckedIn', 'Completed'] }
      });

      const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      // Monthly revenue
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthBookings = await Booking.find({
        createdAt: { $gte: monthStart },
        status: { $in: ['Confirmed', 'CheckedIn', 'Completed'] }
      });

      const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const message = `
📊 *${ctx.t!('employee.stats.title')}*

🛏️ ${ctx.t!('employee.stats.availableRooms', { count: availableRooms })}
🛏️ ${ctx.t!('employee.stats.occupiedRooms', { count: occupiedRooms })}

📅 ${ctx.t!('employee.stats.confirmedBookings', { count: confirmedBookings })}
⏳ ${ctx.t!('employee.stats.pendingBookings', { count: pendingBookings })}

💰 ${ctx.t!('employee.stats.todayRevenue', { amount: todayRevenue.toFixed(2) })}
💵 ${ctx.t!('employee.stats.monthRevenue', { amount: monthRevenue.toFixed(2) })}
      `.trim();

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Stats Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Show Occupied Rooms
  static async showOccupiedRooms(ctx: BotContext) {
    try {
      const occupiedBookings = await Booking.find({
        status: { $in: ['Confirmed', 'CheckedIn'] },
        checkInDate: { $lte: new Date() },
        checkOutDate: { $gte: new Date() }
      })
        .populate('room')
        .populate('guest')
        .lean();

      if (occupiedBookings.length === 0) {
        await ctx.reply(ctx.t!('employee.occupiedRooms.noOccupied'));
        return;
      }

      await ctx.reply(ctx.t!('employee.occupiedRooms.title'));

      for (const booking of occupiedBookings) {
        const room = booking.room as any;
        const guest = booking.guest as any;
        const checkOut = new Date(booking.checkOutDate).toLocaleDateString('ar-EG');

        const message = `
🛏️ *${ctx.t!('employee.occupiedRooms.room', { number: room.roomNumber })}*
👤 ${ctx.t!('employee.occupiedRooms.guest', { name: guest.name })}
📆 ${ctx.t!('employee.occupiedRooms.checkOut', { date: checkOut })}
📊 الحالة: ${booking.status}
        `.trim();

        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Occupied Rooms Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Show Pending Service Requests
  static async showPendingRequests(ctx: BotContext) {
    try {
      const pendingOrders = await ServiceOrder.find({ status: 'Pending' })
        .populate('booking')
        .populate('guest')
        .sort({ requestedAt: -1 })
        .limit(10)
        .lean();

      if (pendingOrders.length === 0) {
        await ctx.reply('✅ لا توجد طلبات معلقة حالياً.');
        return;
      }

      await ctx.reply('📋 *الطلبات المعلقة:*', { parse_mode: 'Markdown' });

      for (const order of pendingOrders) {
        const guest = order.guest as any;
        const booking = order.booking as any;
        
        const message = `
🛎️ *طلب خدمة جديد*
👤 الضيف: ${guest.name}
🛏️ الغرفة: ${booking.room?.roomNumber || 'N/A'}
📝 الخدمة: ${order.serviceType}
💬 التفاصيل: ${order.details}
⏰ الوقت: ${new Date(order.requestedAt).toLocaleString('ar-EG')}
        `.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('✅ إنهاء', `complete_service_${order._id}`)]
        ]);

        await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Pending Requests Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Complete Service Request
  static async completeServiceRequest(ctx: BotContext, orderId: string) {
    try {
      const order = await ServiceOrder.findById(orderId);
      
      if (!order) {
        await ctx.answerCbQuery('❌ الطلب غير موجود');
        return;
      }

      if (order.status === 'Completed') {
        await ctx.answerCbQuery('✅ تم إنهاء هذا الطلب مسبقاً');
        return;
      }

      // Update order status
      order.status = 'Completed';
      order.completedBy = ctx.user!.id;
      order.completedAt = new Date();
      await order.save();

      await ctx.answerCbQuery('✅ تم إنهاء الطلب بنجاح');

      // Edit the message
      const completionMessage = ctx.t!('notifications.taskCompleted', {
        employeeName: ctx.user!.name
      });

      try {
        await ctx.editMessageText(
          ctx.callbackQuery!.message!.text + '\n\n' + completionMessage,
          { parse_mode: 'Markdown' }
        );
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      } catch (editError) {
        // Message might be too old to edit
        await ctx.reply(completionMessage);
      }

      // Notify the guest
      const guest = await mongoose.model('Guest').findById(order.guest);
      if (guest?.telegramId) {
        await ctx.telegram.sendMessage(
          guest.telegramId,
          `✅ تم إنهاء طلب الخدمة الخاص بك: ${order.serviceType}\nشكراً لثقتك بنا! 🙏`
        );
      }
    } catch (error) {
      console.error('Complete Service Error:', error);
      await ctx.answerCbQuery('❌ حدث خطأ');
    }
  }
}
