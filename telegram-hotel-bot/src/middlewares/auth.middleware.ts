import { Context } from 'telegraf';
import { Guest } from '../models/Guest.model';
import { Employee } from '../models/Employee.model';

export interface BotContext extends Context {
  session: Record<string, any>;
  user?: {
    id: string;
    type: 'guest' | 'employee';
    role?: string;
    name: string;
    email: string;
    language: string;
    isAdmin?: boolean;
  };
  t?: (key: string, options?: any) => string;
}

export const authMiddleware = async (ctx: BotContext, next: () => Promise<void>) => {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    return next();
  }

  try {
    // Check if user is a guest
    const guest = await Guest.findOne({ telegramId });
    if (guest) {
      ctx.user = {
        id: guest._id.toString(),
        type: 'guest',
        name: guest.name,
        email: guest.email,
        language: guest.language || 'ar'
      };
      return next();
    }

    // Check if user is an employee
    const employee = await Employee.findOne({ telegramId, isActive: true });
    if (employee) {
      ctx.user = {
        id: employee._id.toString(),
        type: 'employee',
        role: employee.role,
        name: employee.name,
        email: employee.email,
        language: employee.language || 'ar',
        isAdmin: employee.role === 'Admin'
      };
      return next();
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
  }

  return next();
};

export const requireAuth = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.user) {
    await ctx.reply(ctx.t?.('errors.unauthorized') || '❌ غير مصرح لك بالدخول.');
    return;
  }
  return next();
};

export const requireGuest = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.user || ctx.user.type !== 'guest') {
    await ctx.reply('❌ هذه الميزة متاحة للضيوف فقط.');
    return;
  }
  return next();
};

export const requireEmployee = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.user || ctx.user.type !== 'employee') {
    await ctx.reply('❌ هذه الميزة متاحة للموظفين فقط.');
    return;
  }
  return next();
};

export const requireAdmin = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.user || ctx.user.type !== 'employee' || !ctx.user.isAdmin) {
    await ctx.reply('❌ هذه الميزة متاحة للإدمن فقط.');
    return;
  }
  return next();
};
