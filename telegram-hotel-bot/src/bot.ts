import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { authMiddleware, BotContext, requireAuth, requireAdmin } from './middlewares/auth.middleware';
import { GuestHandler } from './handlers/guest.handler';
import { EmployeeHandler } from './handlers/employee.handler';
import { AdminHandler } from './handlers/admin.handler';
import { AuthHandler } from './handlers/auth.handler';
import { t, changeLanguage } from './services/i18n.service';

dotenv.config();

// Initialize bot
const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN!);

// Session middleware
bot.use(session());

// Auth middleware
bot.use(authMiddleware);

// Add translation function to context
bot.use((ctx, next) => {
  ctx.t = (key: string, options?: any) => {
    const lang = ctx.user?.language || 'ar';
    changeLanguage(lang);
    return t(key, options);
  };
  return next();
});

// ============ START COMMAND ============
bot.command('start', async (ctx) => {
  if (!ctx.user) {
    // User not registered
    await AuthHandler.showAuthMenu(ctx);
  } else {
    // User logged in
    const welcomeMsg = `${ctx.t!('welcome')}\n\nمرحباً ${ctx.user.name}! 👋`;
    await ctx.reply(welcomeMsg);

    if (ctx.user.type === 'guest') {
      await GuestHandler.showGuestMenu(ctx);
    } else {
      await EmployeeHandler.showEmployeeMenu(ctx);
    }
  }
});

// ============ HELP COMMAND ============
bot.command('help', async (ctx) => {
  const helpText = `
📖 *دليل الاستخدام*

*للضيوف:*
• /start - البداية
• استخدم القوائم للتنقل
• المساعد الذكي للبحث عن غرف
• إدارة حجوزاتك
• طلب الخدمات

*للموظفين:*
• /stats - الإحصائيات
• عرض الغرف المشغولة
• إدارة الطلبات

*للإدمن:*
• /broadcast - إرسال إعلان
• /settings - إعدادات النظام
• /linkgroup - ربط جروب الموظفين
  `.trim();

  await ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// ============ ADMIN COMMANDS ============
bot.command('linkgroup', requireAdmin, async (ctx) => {
  await AdminHandler.linkStaffGroup(ctx);
});

bot.command('broadcast', requireAdmin, async (ctx) => {
  await AdminHandler.initiateBroadcast(ctx);
});

bot.command('settings', requireAdmin, async (ctx) => {
  await AdminHandler.showSystemSettings(ctx);
});

bot.command('stats', requireAuth, async (ctx) => {
  if (ctx.user!.type === 'employee') {
    await EmployeeHandler.showStats(ctx);
  } else {
    await ctx.reply('❌ هذا الأمر متاح للموظفين فقط');
  }
});

// ============ CALLBACK QUERY HANDLERS ============
bot.action('auth_login', async (ctx) => {
  await AuthHandler.initiateLogin(ctx);
});

bot.action('auth_register', async (ctx) => {
  await AuthHandler.initiateRegister(ctx);
});

bot.action('back_guest_menu', requireAuth, async (ctx) => {
  await ctx.answerCbQuery();
  await GuestHandler.showGuestMenu(ctx);
});

bot.action('back_admin_menu', requireAdmin, async (ctx) => {
  await ctx.answerCbQuery();
  await AdminHandler.showAdminMenu(ctx);
});

bot.action(/^faq_(.+)$/, requireAuth, async (ctx) => {
  const topic = ctx.match[1];
  await GuestHandler.handleFAQAnswer(ctx, topic);
});

bot.action('link_staff_group', requireAdmin, async (ctx) => {
  await ctx.answerCbQuery('قم بإضافة البوت إلى جروب الموظفين واستخدم /linkgroup هناك');
});

bot.action('update_ai_token', requireAdmin, async (ctx) => {
  await AdminHandler.updateAIToken(ctx);
});

bot.action('confirm_broadcast', requireAdmin, async (ctx) => {
  await AdminHandler.executeBroadcast(ctx);
});

bot.action('cancel_broadcast', requireAdmin, async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  await ctx.reply('❌ تم إلغاء الإرسال');
  delete (ctx.session as any).broadcastMessage;
});

bot.action(/^complete_service_(.+)$/, requireAuth, async (ctx) => {
  if (ctx.user!.type !== 'employee') {
    await ctx.answerCbQuery(ctx.t!('notifications.notAuthorized'));
    return;
  }
  
  const orderId = ctx.match[1];
  await EmployeeHandler.completeServiceRequest(ctx, orderId);
});

bot.action(/^book_(.+)$/, requireAuth, async (ctx) => {
  await ctx.answerCbQuery('ميزة الحجز قيد التطوير... استخدم الموقع أو اتصل بالاستقبال.');
});

bot.action(/^room_(.+)$/, requireAuth, async (ctx) => {
  await ctx.answerCbQuery('عرض تفاصيل الغرفة قيد التطوير...');
});

// ============ TEXT MESSAGE HANDLERS ============
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const session = ctx.session as any;

  // Handle cancellation
  if (text === ctx.t!('auth.cancel') || text === ctx.t!('buttons.cancel')) {
    delete session.loginStep;
    delete session.registerStep;
    delete session.expectingAIQuery;
    delete session.expectingServiceRequest;
    delete session.expectingBroadcast;
    delete session.expectingAIToken;
    
    await ctx.reply('❌ تم الإلغاء', { reply_markup: { remove_keyboard: true } });
    
    if (ctx.user) {
      if (ctx.user.type === 'guest') {
        await GuestHandler.showGuestMenu(ctx);
      } else {
        await EmployeeHandler.showEmployeeMenu(ctx);
      }
    }
    return;
  }

  // === AUTH FLOWS ===
  if (session.loginStep === 'email') {
    await AuthHandler.processLoginEmail(ctx, text);
    return;
  }

  if (session.loginStep === 'password') {
    await AuthHandler.processLoginPassword(ctx, text);
    return;
  }

  if (session.registerStep === 'name') {
    await AuthHandler.processRegisterName(ctx, text);
    return;
  }

  if (session.registerStep === 'email') {
    await AuthHandler.processRegisterEmail(ctx, text);
    return;
  }

  if (session.registerStep === 'phone') {
    await AuthHandler.processRegisterPhone(ctx, text);
    return;
  }

  if (session.registerStep === 'password') {
    await AuthHandler.processRegisterPassword(ctx, text);
    return;
  }

  // === ADMIN FLOWS ===
  if (session.expectingBroadcast) {
    await AdminHandler.sendBroadcast(ctx, text);
    return;
  }

  if (session.expectingAIToken) {
    await AdminHandler.saveAIToken(ctx, text);
    return;
  }

  // === GUEST FLOWS ===
  if (session.expectingAIQuery) {
    await GuestHandler.processAIQuery(ctx, text);
    return;
  }

  if (session.expectingServiceRequest) {
    // Determine service type from previous interaction
    const serviceType = session.selectedService || 'General';
    await GuestHandler.processServiceRequest(ctx, serviceType, text);
    return;
  }

  // === MENU NAVIGATION ===
  if (!ctx.user) {
    await AuthHandler.showAuthMenu(ctx);
    return;
  }

  // Guest Menu Items
  if (text === ctx.t!('guest.menu.aiAssistant')) {
    await GuestHandler.handleAIAssistant(ctx);
  } else if (text === ctx.t!('guest.menu.exploreRooms')) {
    await GuestHandler.showAvailableRooms(ctx);
  } else if (text === ctx.t!('guest.menu.myBookings')) {
    await GuestHandler.showMyBookings(ctx);
  } else if (text === ctx.t!('guest.menu.requestService')) {
    await GuestHandler.showServiceMenu(ctx);
  } else if (text === ctx.t!('guest.menu.faq')) {
    await GuestHandler.showFAQ(ctx);
  }
  
  // Service options
  else if (text === ctx.t!('guest.service.roomService')) {
    session.selectedService = 'Room Service';
    await ctx.reply(ctx.t!('guest.service.enterDetails'));
  } else if (text === ctx.t!('guest.service.housekeeping')) {
    session.selectedService = 'Housekeeping';
    await ctx.reply(ctx.t!('guest.service.enterDetails'));
  } else if (text === ctx.t!('guest.service.laundry')) {
    session.selectedService = 'Laundry';
    await ctx.reply(ctx.t!('guest.service.enterDetails'));
  } else if (text === ctx.t!('guest.service.maintenance')) {
    session.selectedService = 'Maintenance';
    await ctx.reply(ctx.t!('guest.service.enterDetails'));
  } else if (text === ctx.t!('guest.service.spa')) {
    session.selectedService = 'Spa';
    await ctx.reply(ctx.t!('guest.service.enterDetails'));
  }

  // Employee Menu Items
  else if (text === ctx.t!('employee.menu.stats')) {
    await EmployeeHandler.showStats(ctx);
  } else if (text === ctx.t!('employee.menu.occupiedRooms')) {
    await EmployeeHandler.showOccupiedRooms(ctx);
  } else if (text === ctx.t!('employee.menu.pendingRequests')) {
    await EmployeeHandler.showPendingRequests(ctx);
  }

  // Admin Menu Items
  else if (text === ctx.t!('admin.menu.broadcast')) {
    await AdminHandler.initiateBroadcast(ctx);
  } else if (text === ctx.t!('admin.menu.systemSettings')) {
    await AdminHandler.showSystemSettings(ctx);
  } else if (text === ctx.t!('admin.menu.employeeStats')) {
    await AdminHandler.showEmployeeStats(ctx);
  } else if (text === ctx.t!('admin.menu.reports')) {
    await AdminHandler.showReports(ctx);
  }

  // Back/Home buttons
  else if (text === ctx.t!('buttons.back') || text === ctx.t!('buttons.home')) {
    if (ctx.user.type === 'guest') {
      await GuestHandler.showGuestMenu(ctx);
    } else if (ctx.user.isAdmin) {
      await AdminHandler.showAdminMenu(ctx);
    } else {
      await EmployeeHandler.showEmployeeMenu(ctx);
    }
  }

  // Unknown command
  else {
    await ctx.reply('❓ لم أفهم. استخدم القوائم أو اكتب /help');
  }
});

// ============ ERROR HANDLING ============
bot.catch((err, ctx) => {
  console.error('Bot Error:', err);
  ctx.reply('❌ حدث خطأ. الرجاء المحاولة مرة أخرى.');
});

// ============ START BOT ============
const startBot = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize AI service
    const { aiService } = await import('./services/ai.service');
    await aiService.initialize();

    // Start bot
    console.log('🤖 Starting Telegram Bot...');
    await bot.launch();
    console.log('✅ Bot is running!');

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
};

startBot();
