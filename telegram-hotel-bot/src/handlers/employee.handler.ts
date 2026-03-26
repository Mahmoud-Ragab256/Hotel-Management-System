import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import mongoose, { Schema } from 'mongoose';

// ========== ServiceOrder Schema (defined here since no separate model file exists) ==========
const serviceOrderSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
  serviceType: String,
  details: String,
  status: { type: String, default: 'Pending' },
  assignedEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  requestedAt: Date,
  completedAt: Date,
  completedBy: String,
}, { collection: 'serviceorders', timestamps: true });

const ServiceOrder = (mongoose.models['ServiceOrder'] ||
  mongoose.model('ServiceOrder', serviceOrderSchema)) as any;

// Helper: get model safely (Room, Booking, Guest must be loaded via database.ts first)
function getModel(name: string) {
  return mongoose.models[name] || (() => { throw new Error(`Model ${name} not registered`); })();
}

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
      const Room = getModel('Room');
      const Booking = getModel('Booking');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const totalRooms = await Room.countDocuments();
      const availableRooms = await Room.countDocuments({ status: 'available' });
      const occupiedRooms = totalRooms - availableRooms;

      const confirmedBookings = await Booking.countDocuments({
        status: 'confirmed',
        checkInDate: { $gte: today }
      });

      const pendingBookings = await Booking.countDocuments({ status: 'pending' });

      const todayBookings = await Booking.find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
      });

      const todayRevenue = todayBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthBookings = await Booking.find({
        createdAt: { $gte: monthStart },
        status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
      });

      const monthRevenue = monthBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

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
      const Booking = getModel('Booking');

      const occupiedBookings = await Booking.find({
        status: { $in: ['confirmed', 'checked-in'] },
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

      for (const booking of occupiedBookings as any[]) {
        const room = booking.room;
        const guest = booking.guest;
        const checkOut = new Date(booking.checkOutDate).toLocaleDateString('ar-EG');

        const message = `
🛏️ *${ctx.t!('employee.occupiedRooms.room', { number: room?.roomNumber || 'N/A' })}*
👤 ${ctx.t!('employee.occupiedRooms.guest', { name: guest?.name || 'N/A' })}
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
        .sort({ requestedAt: -1 })
        .limit(10)
        .lean();

      if (pendingOrders.length === 0) {
        await ctx.reply('✅ لا توجد طلبات معلقة حالياً.');
        return;
      }

      await ctx.reply('📋 *الطلبات المعلقة:*', { parse_mode: 'Markdown' });

      for (const order of pendingOrders as any[]) {
        const message = `
🛎️ *طلب خدمة جديد*
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

      if ((order as any).status === 'Completed') {
        await ctx.answerCbQuery('✅ تم إنهاء هذا الطلب مسبقاً');
        return;
      }

      (order as any).status = 'Completed';
      (order as any).completedBy = ctx.user!.id;
      (order as any).completedAt = new Date();
      await order.save();

      await ctx.answerCbQuery('✅ تم إنهاء الطلب بنجاح');

      const completionMessage = ctx.t!('notifications.taskCompleted', {
        employeeName: ctx.user!.name
      });

      try {
        await ctx.editMessageText(
          (ctx.callbackQuery as any)!.message!.text + '\n\n' + completionMessage,
          { parse_mode: 'Markdown' }
        );
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      } catch (editError) {
        await ctx.reply(completionMessage);
      }

      // Notify the guest
      const GuestModel = mongoose.models['Guest'];
      if (GuestModel) {
        const guest = await GuestModel.findById((order as any).guestId);
        if (guest?.telegramId) {
          await ctx.telegram.sendMessage(
            guest.telegramId,
            `✅ تم إنهاء طلب الخدمة الخاص بك: ${(order as any).serviceType}\nشكراً لثقتك بنا! 🙏`
          );
        }
      }
    } catch (error) {
      console.error('Complete Service Error:', error);
      await ctx.answerCbQuery('❌ حدث خطأ');
    }
  }
}

export function registerEmployeeHandlers(bot: any) {
  bot.action(/^complete_service_(.+)$/, async (ctx: BotContext) => {
    const orderId = (ctx as any).match[1];
    await EmployeeHandler.completeServiceRequest(ctx, orderId);
  });
}
