import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import { aiService } from '../services/ai.service';
import mongoose, { Document, Schema } from 'mongoose';

// ========== Room Category Schema ==========
const roomCategorySchema = new Schema({
  name: String,
  basePrice: Number,
  capacity: Object,
  amenities: [String],
  description: String,
}, { collection: 'roomcategories' });

const RoomCategory = (mongoose.models['RoomCategory'] ||
  mongoose.model('RoomCategory', roomCategorySchema)) as any;

// ========== Room Schema ==========
const roomSchema = new Schema({
  roomNumber: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'RoomCategory' },
  status: String,
  floor: Number,
  images: [String],
}, { collection: 'rooms' });

const Room = (mongoose.models['Room'] ||
  mongoose.model('Room', roomSchema)) as any;

// ========== Booking Schema ==========
const bookingSchema = new Schema({
  guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  checkInDate: Date,
  checkOutDate: Date,
  status: String,
  totalPrice: Number,
  paymentStatus: String,
}, { collection: 'bookings' });

const Booking = (mongoose.models['Booking'] ||
  mongoose.model('Booking', bookingSchema)) as any;

// ========== Service Order Schema ==========
const serviceOrderSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
  serviceType: String,
  details: String,
  status: String,
  assignedEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  requestedAt: Date,
  completedAt: Date,
  completedBy: String,
}, { collection: 'serviceorders' });

const ServiceOrder = (mongoose.models['ServiceOrder'] ||
  mongoose.model('ServiceOrder', serviceOrderSchema)) as any;

// ========== System Settings Schema ==========
const systemSettingsSchema = new Schema({
  aiToken: String,
  staffGroupId: String,
}, { collection: 'system_settings' });

const SystemSettings = (mongoose.models['SystemSettings'] ||
  mongoose.model('SystemSettings', systemSettingsSchema)) as any;


export class GuestHandler {
  // Guest Main Menu
  static async showGuestMenu(ctx: BotContext) {
    const keyboard = Markup.keyboard([
      [ctx.t!('guest.menu.aiAssistant'), ctx.t!('guest.menu.exploreRooms')],
      [ctx.t!('guest.menu.myBookings'), ctx.t!('guest.menu.requestService')],
      [ctx.t!('guest.menu.faq')]
    ]).resize();

    await ctx.reply(ctx.t!('mainMenu.title'), keyboard);
  }

  // AI Assistant
  static async handleAIAssistant(ctx: BotContext) {
    await ctx.reply(ctx.t!('guest.aiAssistant.welcome'), Markup.keyboard([
      [ctx.t!('buttons.back'), ctx.t!('buttons.home')]
    ]).resize());

    (ctx.session as any).expectingAIQuery = true;
  }

  static async processAIQuery(ctx: BotContext, query: string) {
    try {
      await ctx.reply(ctx.t!('guest.aiAssistant.processing'));

      const availableRooms = await Room.find({ status: 'Available' })
        .populate('categoryId')
        .lean();

      if (availableRooms.length === 0) {
        await ctx.reply('😔 عذراً، لا توجد غرف متاحة حالياً.');
        return;
      }

      const matchedRooms = await aiService.searchRooms(query, availableRooms);

      if (matchedRooms.length === 0) {
        await ctx.reply(ctx.t!('guest.aiAssistant.noResults'));
        return;
      }

      await ctx.reply(ctx.t!('guest.aiAssistant.foundRooms'));

      for (const room of matchedRooms.slice(0, 5)) {
        const category = room.categoryId as any;
        const amenitiesList = category?.amenities?.join(', ') || 'N/A';

        const message = `
🏨 *غرفة ${room.roomNumber}*
📂 النوع: ${category?.name || 'Standard'}
💰 السعر: $${category?.basePrice || 0}/ليلة
✨ المرافق: ${amenitiesList}
        `.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📅 احجز الآن', `book_${room._id}`)],
          [Markup.button.callback('👁️ تفاصيل', `room_${room._id}`)]
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
      const rooms = await Room.find({ status: 'Available' })
        .populate('categoryId')
        .limit(10)
        .lean();

      if (rooms.length === 0) {
        await ctx.reply('😔 عذراً، لا توجد غرف متاحة حالياً.');
        return;
      }

      await ctx.reply(ctx.t!('guest.rooms.available'));

      for (const room of rooms) {
        const category = room.categoryId as any;
        const amenitiesList = category?.amenities?.join(', ') || 'N/A';

        const message = `
🏨 *غرفة ${room.roomNumber}*
📂 ${category?.name || 'Standard'}
💰 $${category?.basePrice || 0}/ليلة
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

  // My Bookings
  static async showMyBookings(ctx: BotContext) {
    try {
      const bookings = await Booking.find({ guestId: ctx.user!.id })
        .populate('roomId')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (bookings.length === 0) {
        await ctx.reply(ctx.t!('guest.bookings.noBookings'));
        return;
      }

      await ctx.reply(ctx.t!('guest.bookings.myBookings'));

      for (const booking of bookings) {
        const room = booking.roomId as any;
        const checkIn = new Date(booking.checkInDate).toLocaleDateString('ar-EG');
        const checkOut = new Date(booking.checkOutDate).toLocaleDateString('ar-EG');

        const message = `
📅 *حجز #${booking._id.toString().slice(-6)}*
🛏️ الغرفة: ${room?.roomNumber || 'N/A'}
📊 الحالة: ${booking.status}
📆 الدخول: ${checkIn}
📆 الخروج: ${checkOut}
💰 الإجمالي: $${booking.totalPrice}
        `.trim();

        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Show Bookings Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Service Menu
  static async showServiceMenu(ctx: BotContext) {
    const keyboard = Markup.keyboard([
      [ctx.t!('guest.service.roomService'), ctx.t!('guest.service.housekeeping')],
      [ctx.t!('guest.service.laundry'), ctx.t!('guest.service.maintenance')],
      [ctx.t!('guest.service.spa')],
      [ctx.t!('buttons.back'), ctx.t!('buttons.home')]
    ]).resize();

    await ctx.reply(ctx.t!('guest.service.selectService'), keyboard);
    (ctx.session as any).expectingServiceRequest = true;
  }

  static async processServiceRequest(ctx: BotContext, serviceType: string, details: string) {
    try {
      const activeBooking = await Booking.findOne({
        guestId: ctx.user!.id,
        status: { $in: ['Confirmed', 'CheckedIn'] }
      }).populate('roomId');

      if (!activeBooking) {
        await ctx.reply('❌ لا يوجد لديك حجز نشط حالياً.');
        (ctx.session as any).expectingServiceRequest = false;
        return;
      }

      const room = activeBooking.roomId as any;

      const serviceOrder = await ServiceOrder.create({
        bookingId: activeBooking._id,
        guestId: ctx.user!.id,
        serviceType,
        details,
        status: 'Pending',
        requestedAt: new Date()
      });

      await ctx.reply(ctx.t!('guest.service.requestSent'));

      await this.notifyStaffGroup(ctx, {
        roomNumber: room?.roomNumber || 'N/A',
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

  // FAQ
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
    const answers: Record<string, string> = {
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
      const settings = await SystemSettings.findOne();

      if (!settings?.staffGroupId) {
        console.warn('Staff group not configured');
        return;
      }

      const message = `
🛎️ *طلب خدمة جديد!*

🏨 الغرفة: ${data.roomNumber}
👤 الضيف: ${data.guestName}
🔧 الخدمة: ${data.serviceType}
📝 التفاصيل: ${data.details}
      `.trim();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ إنهاء الطلب', `complete_service_${data.orderId}`)]
      ]);

      await ctx.telegram.sendMessage(settings.staffGroupId, message, {
        ...keyboard,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Notify Staff Error:', error);
    }
  }
}

export function registerGuestHandlers(bot: any) {
  bot.command('mybookings', async (ctx: BotContext) => {
    if (!ctx.user) { await ctx.reply('❌ يجب تسجيل الدخول أولاً.'); return; }
    await GuestHandler.showMyBookings(ctx);
  });

  bot.action('back_guest_menu', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    await GuestHandler.showGuestMenu(ctx);
  });

  bot.action(/^faq_(.+)$/, async (ctx: BotContext) => {
    const topic = (ctx as any).match[1];
    await GuestHandler.handleFAQAnswer(ctx, topic);
  });

  bot.action(/^book_(.+)$/, async (ctx: BotContext) => {
    const { BookingHandler } = await import('./booking.handler');
    const roomId = (ctx as any).match[1];
    await BookingHandler.initiateBooking(ctx, roomId);
  });

  // Handle text messages for guest flows (AI queries, service requests)
  bot.on('text', async (ctx: BotContext, next: () => Promise<void>) => {
    const session = ctx.session as any;
    const text = (ctx.message as any)?.text;

    if (!text) return next();
    if (!ctx.user || ctx.user.type !== 'guest') return next();

    if (session?.expectingAIQuery) {
      await GuestHandler.processAIQuery(ctx, text);
      return;
    }

    if (session?.expectingServiceRequest) {
      await GuestHandler.processServiceRequest(ctx, 'General', text);
      return;
    }

    // Handle keyboard button presses
    const t = ctx.t!;
    if (text === t('guest.menu.aiAssistant')) {
      await GuestHandler.handleAIAssistant(ctx);
    } else if (text === t('guest.menu.exploreRooms')) {
      await GuestHandler.showAvailableRooms(ctx);
    } else if (text === t('guest.menu.myBookings')) {
      await GuestHandler.showMyBookings(ctx);
    } else if (text === t('guest.menu.requestService')) {
      await GuestHandler.showServiceMenu(ctx);
    } else if (text === t('guest.menu.faq')) {
      await GuestHandler.showFAQ(ctx);
    } else {
      return next();
    }
  });
}
