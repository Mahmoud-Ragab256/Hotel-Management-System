import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import { aiService } from '../services/ai.service';
import mongoose from 'mongoose';

const Room = mongoose.model('Room');
const Booking = mongoose.model('Booking');
const ServiceOrder = mongoose.model('ServiceOrder');

export class GuestHandler {
  // Guest Main Menu
  static async showGuestMenu(ctx: BotContext) {
    const keyboard = Markup.keyboard([
      [ctx.t!('guest.menu.aiAssistant'), ctx.t!('guest.menu.exploreRooms')],
      [ctx.t!('guest.menu.myBookings'), ctx.t!('guest.menu.requestService')],
      [ctx.t!('guest.menu.faq'), ctx.t!('guest.menu.back')]
    ]).resize();

    await ctx.reply(ctx.t!('mainMenu.title'), keyboard);
  }

  // AI Assistant for Smart Room Search
  static async handleAIAssistant(ctx: BotContext) {
    await ctx.reply(ctx.t!('guest.aiAssistant.welcome'), Markup.keyboard([
      [ctx.t!('buttons.back'), ctx.t!('buttons.home')]
    ]).resize());

    // Store state to expect AI query
    (ctx.session as any).expectingAIQuery = true;
  }

  static async processAIQuery(ctx: BotContext, query: string) {
    try {
      await ctx.reply(ctx.t!('guest.aiAssistant.processing'));

      // Get available rooms
      const availableRooms = await Room.find({ isAvailable: true })
        .populate('category')
        .lean();

      if (availableRooms.length === 0) {
        await ctx.reply('😔 عذراً، لا توجد غرف متاحة حالياً.');
        return;
      }

      // Use AI to search
      const matchedRooms = await aiService.searchRooms(query, availableRooms);

      if (matchedRooms.length === 0) {
        await ctx.reply(ctx.t!('guest.aiAssistant.noResults'));
        return;
      }

      await ctx.reply(ctx.t!('guest.aiAssistant.foundRooms'));

      // Display matched rooms
      for (const room of matchedRooms.slice(0, 5)) {
        const amenitiesList = room.amenities?.join(', ') || 'N/A';
        const message = `
🏨 *غرفة ${room.roomNumber}*
📂 النوع: ${room.category?.name || 'Standard'}
💰 السعر: $${room.pricePerNight}/ليلة
👥 السعة: ${room.capacity} أشخاص
✨ المرافق: ${amenitiesList}

${room.description || ''}
        `.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📅 احجز الآن', `book_${room._id}`)],
          [Markup.button.callback('👁️ المزيد من التفاصيل', `room_${room._id}`)]
        ]);

        await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('AI Query Error:', error);
      await ctx.reply(ctx.t!('errors.aiError'));
    } finally {
      (ctx.session as any).expectingAIQuery = false;
    }
  }

  // Explore Available Rooms
  static async showAvailableRooms(ctx: BotContext) {
    try {
      const rooms = await Room.find({ isAvailable: true })
        .populate('category')
        .limit(10)
        .lean();

      if (rooms.length === 0) {
        await ctx.reply('😔 عذراً، لا توجد غرف متاحة حالياً.');
        return;
      }

      await ctx.reply(ctx.t!('guest.rooms.available'));

      for (const room of rooms) {
        const amenitiesList = room.amenities?.join(', ') || 'N/A';
        const message = `
🏨 *غرفة ${room.roomNumber}*
📂 ${room.category?.name || 'Standard'}
💰 $${room.pricePerNight}/ليلة
👥 ${room.capacity} أشخاص
✨ ${amenitiesList}
        `.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📅 احجز', `book_${room._id}`)],
          [Markup.button.callback('👁️ تفاصيل', `room_${room._id}`)]
        ]);

        await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Show Rooms Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Show User Bookings
  static async showMyBookings(ctx: BotContext) {
    try {
      const bookings = await Booking.find({ 
        guest: ctx.user!.id 
      })
        .populate('room')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (bookings.length === 0) {
        await ctx.reply(ctx.t!('guest.bookings.noBookings'));
        return;
      }

      await ctx.reply(ctx.t!('guest.bookings.myBookings'));

      for (const booking of bookings) {
        const room = booking.room as any;
        const checkIn = new Date(booking.checkInDate).toLocaleDateString('ar-EG');
        const checkOut = new Date(booking.checkOutDate).toLocaleDateString('ar-EG');

        const message = `
📅 *حجز #${booking._id.toString().slice(-6)}*
🛏️ الغرفة: ${room.roomNumber}
📊 ${ctx.t!('guest.bookings.status', { status: booking.status })}
📆 الدخول: ${checkIn}
📆 الخروج: ${checkOut}
💰 الإجمالي: $${booking.totalAmount}
        `.trim();

        const buttons = [];
        if (booking.status === 'Confirmed' || booking.status === 'Pending') {
          buttons.push([
            Markup.button.callback('📄 الفاتورة', `invoice_${booking._id}`),
            Markup.button.callback('❌ إلغاء', `cancel_booking_${booking._id}`)
          ]);
        }

        const keyboard = Markup.inlineKeyboard(buttons);
        await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Show Bookings Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Request Service
  static async showServiceMenu(ctx: BotContext) {
    const keyboard = Markup.keyboard([
      [ctx.t!('guest.service.roomService'), ctx.t!('guest.service.housekeeping')],
      [ctx.t!('guest.service.laundry'), ctx.t!('guest.service.maintenance')],
      [ctx.t!('guest.service.spa'), ctx.t!('guest.service.other')],
      [ctx.t!('buttons.back'), ctx.t!('buttons.home')]
    ]).resize();

    await ctx.reply(ctx.t!('guest.service.selectService'), keyboard);
    (ctx.session as any).expectingServiceRequest = true;
  }

  static async processServiceRequest(ctx: BotContext, serviceType: string, details: string) {
    try {
      // Find active booking for this guest
      const activeBooking = await Booking.findOne({
        guest: ctx.user!.id,
        status: { $in: ['Confirmed', 'CheckedIn'] }
      }).populate('room');

      if (!activeBooking) {
        await ctx.reply('❌ لا يوجد لديك حجز نشط حالياً.');
        return;
      }

      const room = activeBooking.room as any;

      // Create service order
      const serviceOrder = await ServiceOrder.create({
        booking: activeBooking._id,
        guest: ctx.user!.id,
        serviceType,
        details,
        status: 'Pending',
        requestedAt: new Date()
      });

      await ctx.reply(ctx.t!('guest.service.requestSent'));

      // Send notification to staff group
      await this.notifyStaffGroup(ctx, {
        type: 'service_request',
        roomNumber: room.roomNumber,
        serviceType,
        details,
        guestName: ctx.user!.name,
        orderId: serviceOrder._id
      });

    } catch (error) {
      console.error('Service Request Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    } finally {
      (ctx.session as any).expectingServiceRequest = false;
    }
  }

  // FAQ Section
  static async showFAQ(ctx: BotContext) {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t!('guest.faq.checkInTime'), 'faq_checkin')],
      [Markup.button.callback(ctx.t!('guest.faq.wifi'), 'faq_wifi')],
      [Markup.button.callback(ctx.t!('guest.faq.location'), 'faq_location')],
      [Markup.button.callback(ctx.t!('guest.faq.parking'), 'faq_parking')],
      [Markup.button.callback(ctx.t!('guest.faq.breakfast'), 'faq_breakfast')],
      [Markup.button.callback(ctx.t!('buttons.back'), 'back_guest_menu')]
    ]);

    await ctx.reply(ctx.t!('guest.faq.title'), keyboard);
  }

  static async handleFAQAnswer(ctx: BotContext, topic: string) {
    const answers: any = {
      checkin: ctx.t!('guest.faq.checkInAnswer'),
      wifi: ctx.t!('guest.faq.wifiAnswer'),
      location: ctx.t!('guest.faq.locationAnswer'),
      parking: ctx.t!('guest.faq.parkingAnswer'),
      breakfast: ctx.t!('guest.faq.breakfastAnswer')
    };

    await ctx.answerCbQuery();
    await ctx.reply(answers[topic] || ctx.t!('errors.notFound'));
  }

  // Notify Staff Group
  private static async notifyStaffGroup(ctx: BotContext, data: any) {
    try {
      const SystemSettings = mongoose.model('SystemSettings');
      const settings = await SystemSettings.findOne();
      
      if (!settings?.staffGroupId) {
        console.warn('Staff group not configured');
        return;
      }

      const message = ctx.t!('notifications.serviceRequest', {
        roomNumber: data.roomNumber,
        service: data.serviceType,
        details: data.details,
        assignedTo: 'خدمة الغرف'
      });

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ إنهاء الطلب', `complete_service_${data.orderId}`)]
      ]);

      await ctx.telegram.sendMessage(settings.staffGroupId, message, keyboard);
    } catch (error) {
      console.error('Notify Staff Error:', error);
    }
  }
}
