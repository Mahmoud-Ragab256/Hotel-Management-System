import { Telegraf, session } from 'telegraf';
import { connectDatabase } from './config/database';
import { registerGuestHandlers } from './handlers/guest.handler';
import { registerBookingHandlers } from './handlers/booking.handler';
import { registerAdminHandlers } from './handlers/admin.handler';
import { registerEmployeeHandlers } from './handlers/employee.handler';
import { authMiddleware } from './middlewares/auth.middleware';
import { i18nMiddleware } from './services/i18n.service';
import dotenv from 'dotenv';

dotenv.config();

const startBot = async () => {
  try {
    console.log('🚀 Starting Hotel Management Bot...');
    
    // 1. الاتصال بقاعدة البيانات وتحميل الـ Models
    await connectDatabase();
    
    // 2. التحقق من وجود BOT_TOKEN
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN is not defined in .env file');
    }
    
    // 3. إنشاء البوت
    const bot = new Telegraf(botToken);
    
    // 4. إعداد الـ Session
    bot.use(session());
    
    // 5. إعداد الـ i18n middleware
    bot.use(i18nMiddleware);
    
    // 6. إعداد الـ auth middleware
    bot.use(authMiddleware);
    
    // 7. تسجيل command للبداية
    bot.start((ctx) => {
      ctx.reply(
        '👋 Welcome to Hotel Management Bot!\n\n' +
        'Available commands:\n' +
        '/help - Show all commands\n' +
        '/search - Search for available rooms\n' +
        '/mybookings - View your bookings\n' +
        '/profile - View your profile'
      );
    });
    
    bot.help((ctx) => {
      ctx.reply(
        '📋 Available Commands:\n\n' +
        '🔍 Guest Commands:\n' +
        '/start - Start the bot\n' +
        '/search - Search for available rooms\n' +
        '/book - Make a new booking\n' +
        '/mybookings - View your bookings\n' +
        '/profile - View/Update your profile\n\n' +
        '👨‍💼 Admin Commands:\n' +
        '/admin - Access admin panel\n' +
        '/addroom - Add a new room\n' +
        '/viewrooms - View all rooms\n' +
        '/bookings - View all bookings'
      );
    });
    
    // 8. تسجيل الـ handlers
    registerGuestHandlers(bot);
    registerBookingHandlers(bot);
    registerAdminHandlers(bot);
    registerEmployeeHandlers(bot);
    
    // 9. بدء البوت
    await bot.launch();
    console.log('✅ Bot started successfully!');
    console.log('📱 Bot is now running and waiting for messages...');
    
    // 10. التعامل مع إيقاف البوت بشكل صحيح
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      bot.stop(signal);
      process.exit(0);
    };
    
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
};

startBot(); 
