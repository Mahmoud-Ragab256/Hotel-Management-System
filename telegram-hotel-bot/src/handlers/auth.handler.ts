import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import { Guest } from '../models/Guest.model';
import { Employee } from '../models/Employee.model';

export class AuthHandler {
  // Show Login/Register Options
  static async showAuthMenu(ctx: BotContext) {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t!('auth.login'), 'auth_login')],
      [Markup.button.callback(ctx.t!('auth.register'), 'auth_register')]
    ]);

    await ctx.reply(ctx.t!('auth.notRegistered'), keyboard);
  }

  // Login Flow
  static async initiateLogin(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply(ctx.t!('auth.enterEmail'), Markup.keyboard([
      [ctx.t!('auth.cancel')]
    ]).resize());

    (ctx.session as any).loginStep = 'email';
  }

  static async processLoginEmail(ctx: BotContext, email: string) {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await ctx.reply(ctx.t!('auth.invalidEmail'));
      return;
    }

    (ctx.session as any).loginEmail = email;
    (ctx.session as any).loginStep = 'password';

    await ctx.reply(ctx.t!('auth.enterPassword'));
  }

  static async processLoginPassword(ctx: BotContext, password: string) {
    try {
      const email = (ctx.session as any).loginEmail;
      
      // Try to find as guest first
      let user = await Guest.findOne({ email });
      let userType: 'guest' | 'employee' = 'guest';

      // If not guest, try employee
      if (!user) {
        user = await Employee.findOne({ email, isActive: true });
        userType = 'employee';
      }

      if (!user) {
        await ctx.reply(ctx.t!('auth.loginFailed'));
        this.clearLoginSession(ctx);
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await ctx.reply(ctx.t!('auth.loginFailed'));
        this.clearLoginSession(ctx);
        return;
      }

      // Update telegram ID
      user.telegramId = ctx.from!.id.toString();
      user.telegramUsername = ctx.from!.username;
      await user.save();

      await ctx.reply(ctx.t!('auth.loginSuccess') + ` 🎉\n\nمرحباً ${user.name}!`);
      
      this.clearLoginSession(ctx);

      // Refresh user context
      await ctx.reply('جاري تحميل القائمة الرئيسية...');
      
      // Simulate user context update
      if (userType === 'guest') {
        ctx.user = {
          id: user._id.toString(),
          type: 'guest',
          name: user.name,
          email: user.email,
          language: user.language || 'ar'
        };
      } else {
        const employee = user as any;
        ctx.user = {
          id: employee._id.toString(),
          type: 'employee',
          role: employee.role,
          name: employee.name,
          email: employee.email,
          language: employee.language || 'ar',
          isAdmin: employee.role === 'Admin'
        };
      }

      // Show appropriate menu
      const { GuestHandler } = await import('./guest.handler');
      const { EmployeeHandler } = await import('./employee.handler');
      
      if (userType === 'guest') {
        await GuestHandler.showGuestMenu(ctx);
      } else {
        await EmployeeHandler.showEmployeeMenu(ctx);
      }

    } catch (error) {
      console.error('Login Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
      this.clearLoginSession(ctx);
    }
  }

  // Register Flow (Guest Only)
  static async initiateRegister(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply(ctx.t!('auth.enterName'), Markup.keyboard([
      [ctx.t!('auth.cancel')]
    ]).resize());

    (ctx.session as any).registerStep = 'name';
  }

  static async processRegisterName(ctx: BotContext, name: string) {
    (ctx.session as any).registerName = name;
    (ctx.session as any).registerStep = 'email';
    await ctx.reply(ctx.t!('auth.enterEmail'));
  }

  static async processRegisterEmail(ctx: BotContext, email: string) {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await ctx.reply(ctx.t!('auth.invalidEmail'));
      return;
    }

    // Check if email exists
    const existingGuest = await Guest.findOne({ email });
    const existingEmployee = await Employee.findOne({ email });

    if (existingGuest || existingEmployee) {
      await ctx.reply('❌ البريد الإلكتروني مسجل مسبقاً. استخدم تسجيل الدخول.');
      this.clearRegisterSession(ctx);
      return;
    }

    (ctx.session as any).registerEmail = email;
    (ctx.session as any).registerStep = 'phone';
    await ctx.reply(ctx.t!('auth.enterPhone'));
  }

  static async processRegisterPhone(ctx: BotContext, phone: string) {
    // Validate phone
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      await ctx.reply(ctx.t!('auth.invalidPhone'));
      return;
    }

    (ctx.session as any).registerPhone = phone;
    (ctx.session as any).registerStep = 'password';
    await ctx.reply(ctx.t!('auth.enterPassword'));
  }

  static async processRegisterPassword(ctx: BotContext, password: string) {
    try {
      const name = (ctx.session as any).registerName;
      const email = (ctx.session as any).registerEmail;
      const phone = (ctx.session as any).registerPhone;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create guest
      const guest = await Guest.create({
        name,
        email,
        password: hashedPassword,
        phone,
        telegramId: ctx.from!.id.toString(),
        telegramUsername: ctx.from!.username,
        language: 'ar'
      });

      await ctx.reply(ctx.t!('auth.registerSuccess') + ` 🎉\n\nمرحباً ${name}!`);
      
      this.clearRegisterSession(ctx);

      // Set user context
      ctx.user = {
        id: guest._id.toString(),
        type: 'guest',
        name: guest.name,
        email: guest.email,
        language: 'ar'
      };

      // Show guest menu
      const { GuestHandler } = await import('./guest.handler');
      await GuestHandler.showGuestMenu(ctx);

    } catch (error) {
      console.error('Register Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
      this.clearRegisterSession(ctx);
    }
  }

  // Session Management
  private static clearLoginSession(ctx: BotContext) {
    delete (ctx.session as any).loginStep;
    delete (ctx.session as any).loginEmail;
  }

  private static clearRegisterSession(ctx: BotContext) {
    delete (ctx.session as any).registerStep;
    delete (ctx.session as any).registerName;
    delete (ctx.session as any).registerEmail;
    delete (ctx.session as any).registerPhone;
  }
}
