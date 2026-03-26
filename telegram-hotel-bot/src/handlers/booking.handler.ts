import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

function getModel(name: string) {
  const m = mongoose.models[name];
  if (!m) throw new Error(`Model ${name} not registered yet`);
  return m;
}

export class BookingHandler {

  // Show available rooms for booking
  static async showAvailableRooms(ctx: BotContext) {
    try {
      const Room = getModel('Room');
      const rooms = await Room.find({ status: 'available' }).limit(10).lean();

      if (rooms.length === 0) {
        await ctx.reply('😔 عذراً، لا توجد غرف متاحة حالياً.');
        return;
      }

      await ctx.reply('🏨 *الغرف المتاحة:*', { parse_mode: 'Markdown' });

      for (const room of rooms as any[]) {
        const message = `
🛏️ *غرفة ${room.roomNumber}*
📂 النوع: ${room.type}
💰 السعر: $${room.price}/ليلة
🏢 الطابق: ${room.floor}
✨ المرافق: ${room.amenities?.join(', ') || 'N/A'}
        `.trim();

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📅 احجز الآن', `initiate_book_${room._id}`)]
        ]);

        await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Show Rooms Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Initiate booking flow
  static async initiateBooking(ctx: BotContext, roomId: string) {
    try {
      await ctx.answerCbQuery();
      const Room = getModel('Room');
      const room = await Room.findById(roomId).lean() as any;

      if (!room) {
        await ctx.reply('❌ الغرفة غير موجودة.');
        return;
      }

      if (room.status !== 'available') {
        await ctx.reply('❌ عذراً، هذه الغرفة غير متاحة حالياً.');
        return;
      }

      (ctx.session as any).bookingRoomId = roomId;
      (ctx.session as any).bookingStep = 'checkIn';

      await ctx.reply(
        `📅 *حجز غرفة ${room.roomNumber}*\n\nأدخل تاريخ الوصول (مثال: 2025-12-01):`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Initiate Booking Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Process check-in date
  static async processCheckInDate(ctx: BotContext, dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date < new Date()) {
      await ctx.reply('❌ تاريخ غير صحيح. أدخل تاريخاً صحيحاً في المستقبل (مثال: 2025-12-01):');
      return;
    }

    (ctx.session as any).bookingCheckIn = dateStr;
    (ctx.session as any).bookingStep = 'checkOut';
    await ctx.reply('📅 أدخل تاريخ المغادرة (مثال: 2025-12-05):');
  }

  // Process check-out date and confirm
  static async processCheckOutDate(ctx: BotContext, dateStr: string) {
    try {
      const checkIn = new Date((ctx.session as any).bookingCheckIn);
      const checkOut = new Date(dateStr);

      if (isNaN(checkOut.getTime()) || checkOut <= checkIn) {
        await ctx.reply('❌ تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول.');
        return;
      }

      const Room = getModel('Room');
      const roomId = (ctx.session as any).bookingRoomId;
      const room = await Room.findById(roomId).lean() as any;

      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * room.price;

      (ctx.session as any).bookingCheckOut = dateStr;
      (ctx.session as any).bookingTotalPrice = totalPrice;
      (ctx.session as any).bookingStep = 'guests';

      await ctx.reply(
        `👥 كم عدد الضيوف؟ (أدخل رقماً من 1 إلى 4):`
      );
    } catch (error) {
      console.error('CheckOut Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Process number of guests and show summary
  static async processGuestsCount(ctx: BotContext, countStr: string) {
    try {
      const count = parseInt(countStr);
      if (isNaN(count) || count < 1 || count > 10) {
        await ctx.reply('❌ أدخل عدداً صحيحاً بين 1 و 10.');
        return;
      }

      const Room = getModel('Room');
      const roomId = (ctx.session as any).bookingRoomId;
      const room = await Room.findById(roomId).lean() as any;
      const checkIn = (ctx.session as any).bookingCheckIn;
      const checkOut = (ctx.session as any).bookingCheckOut;
      const totalPrice = (ctx.session as any).bookingTotalPrice;

      (ctx.session as any).bookingGuestsCount = count;
      (ctx.session as any).bookingStep = 'confirm';

      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );

      const summary = `
📋 *ملخص الحجز:*

🛏️ الغرفة: ${room.roomNumber} (${room.type})
📅 الوصول: ${checkIn}
📅 المغادرة: ${checkOut}
🌙 عدد الليالي: ${nights}
👥 عدد الضيوف: ${count}
💰 إجمالي السعر: $${totalPrice}
      `.trim();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('✅ تأكيد الحجز', 'confirm_booking')],
        [Markup.button.callback('❌ إلغاء', 'cancel_booking')]
      ]);

      await ctx.reply(summary, { ...keyboard, parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Guests Count Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Confirm and create booking
  static async confirmBooking(ctx: BotContext) {
    try {
      await ctx.answerCbQuery();

      if (!ctx.user) {
        await ctx.reply('❌ يجب تسجيل الدخول أولاً.');
        return;
      }

      const Booking = getModel('Booking');
      const Room = getModel('Room');

      const roomId = (ctx.session as any).bookingRoomId;
      const checkIn = new Date((ctx.session as any).bookingCheckIn);
      const checkOut = new Date((ctx.session as any).bookingCheckOut);
      const totalPrice = (ctx.session as any).bookingTotalPrice;
      const numberOfGuests = (ctx.session as any).bookingGuestsCount;

      // Check room still available
      const room = await Room.findById(roomId);
      if (!room || (room as any).status !== 'available') {
        await ctx.reply('❌ عذراً، الغرفة لم تعد متاحة.');
        BookingHandler.clearBookingSession(ctx);
        return;
      }

      // Create booking
      const booking = await Booking.create({
        guest: new mongoose.Types.ObjectId(ctx.user.id),
        room: new mongoose.Types.ObjectId(roomId),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        numberOfGuests,
        status: 'pending',
        paymentStatus: 'pending'
      });

      // Update room status
      await Room.findByIdAndUpdate(roomId, { status: 'occupied' });

      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(
        `✅ *تم تأكيد الحجز بنجاح!*\n\n` +
        `رقم الحجز: #${booking._id.toString().slice(-6)}\n` +
        `سنتواصل معك قريباً لتأكيد الدفع. 🙏`,
        { parse_mode: 'Markdown' }
      );

      BookingHandler.clearBookingSession(ctx);
    } catch (error) {
      console.error('Confirm Booking Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Cancel booking flow
  static async cancelBookingFlow(ctx: BotContext) {
    await ctx.answerCbQuery();
    BookingHandler.clearBookingSession(ctx);
    await ctx.reply('✅ تم إلغاء عملية الحجز.');
  }

  private static clearBookingSession(ctx: BotContext) {
    const s = ctx.session as any;
    delete s.bookingStep;
    delete s.bookingRoomId;
    delete s.bookingCheckIn;
    delete s.bookingCheckOut;
    delete s.bookingTotalPrice;
    delete s.bookingGuestsCount;
  }
}

export function registerBookingHandlers(bot: any) {
  bot.command('search', async (ctx: BotContext) => {
    await BookingHandler.showAvailableRooms(ctx);
  });

  bot.action(/^initiate_book_(.+)$/, async (ctx: BotContext) => {
    const roomId = (ctx as any).match[1];
    await BookingHandler.initiateBooking(ctx, roomId);
  });

  bot.action('confirm_booking', async (ctx: BotContext) => {
    await BookingHandler.confirmBooking(ctx);
  });

  bot.action('cancel_booking', async (ctx: BotContext) => {
    await BookingHandler.cancelBookingFlow(ctx);
  });

  // Handle text input for booking flow
  bot.on('text', async (ctx: BotContext, next: () => Promise<void>) => {
    const session = ctx.session as any;
    const text = (ctx.message as any)?.text;

    if (!text || !session?.bookingStep) return next();

    switch (session.bookingStep) {
      case 'checkIn':
        await BookingHandler.processCheckInDate(ctx, text);
        break;
      case 'checkOut':
        await BookingHandler.processCheckOutDate(ctx, text);
        break;
      case 'guests':
        await BookingHandler.processGuestsCount(ctx, text);
        break;
      default:
        return next();
    }
  });
}
