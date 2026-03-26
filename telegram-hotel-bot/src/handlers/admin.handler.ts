import { Markup } from 'telegraf';
import { BotContext } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

const Guest = mongoose.model('Guest');
const SystemSettings = mongoose.model('SystemSettings');

export class AdminHandler {
  // Show Admin Menu
  static async showAdminMenu(ctx: BotContext) {
    const keyboard = Markup.keyboard([
      [ctx.t!('admin.menu.broadcast'), ctx.t!('admin.menu.systemSettings')],
      [ctx.t!('admin.menu.employeeStats'), ctx.t!('admin.menu.reports')],
      [ctx.t!('buttons.back')]
    ]).resize();

    await ctx.reply('⚙️ *لوحة إدارة النظام*', { ...keyboard, parse_mode: 'Markdown' });
  }

  // Broadcast Message to All Guests
  static async initiateBroadcast(ctx: BotContext) {
    await ctx.reply(ctx.t!('admin.broadcast.enterMessage'), Markup.keyboard([
      [ctx.t!('buttons.cancel')]
    ]).resize());

    (ctx.session as any).expectingBroadcast = true;
  }

  static async sendBroadcast(ctx: BotContext, message: string) {
    try {
      const guests = await Guest.find({ 
        telegramId: { $exists: true, $ne: null } 
      }).lean();

      if (guests.length === 0) {
        await ctx.reply('❌ لا يوجد ضيوف لديهم حساب تيليجرام.');
        return;
      }

      // Confirm before sending
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(
          ctx.t!('admin.broadcast.confirm', { count: guests.length }), 
          `confirm_broadcast`
        )],
        [Markup.button.callback(ctx.t!('buttons.cancel'), 'cancel_broadcast')]
      ]);

      // Store the message temporarily
      (ctx.session as any).broadcastMessage = message;

      await ctx.reply(
        `📢 *معاينة الرسالة:*\n\n${message}\n\n👥 سيتم إرسالها إلى ${guests.length} ضيف.`,
        { ...keyboard, parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Broadcast Init Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    } finally {
      (ctx.session as any).expectingBroadcast = false;
    }
  }

  static async executeBroadcast(ctx: BotContext) {
    try {
      await ctx.answerCbQuery();
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

      const message = (ctx.session as any).broadcastMessage;
      if (!message) {
        await ctx.reply('❌ لم يتم العثور على الرسالة.');
        return;
      }

      const guests = await Guest.find({ 
        telegramId: { $exists: true, $ne: null } 
      }).lean();

      await ctx.reply(ctx.t!('admin.broadcast.sending'));

      let sentCount = 0;
      let failedCount = 0;

      for (const guest of guests) {
        try {
          await ctx.telegram.sendMessage(
            guest.telegramId!,
            `📢 *إعلان من الإدارة*\n\n${message}`,
            { parse_mode: 'Markdown' }
          );
          sentCount++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Failed to send to ${guest.telegramId}:`, error);
          failedCount++;
        }
      }

      const resultMessage = ctx.t!('admin.broadcast.sent', { count: sentCount });
      const failMessage = failedCount > 0 
        ? '\n' + ctx.t!('admin.broadcast.failed', { count: failedCount })
        : '';

      await ctx.reply(resultMessage + failMessage);

      // Clear session
      delete (ctx.session as any).broadcastMessage;
    } catch (error) {
      console.error('Broadcast Execution Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // System Settings Menu
  static async showSystemSettings(ctx: BotContext) {
    try {
      const settings = await SystemSettings.findOne();

      const groupStatus = settings?.staffGroupId 
        ? ctx.t!('admin.settings.currentGroup', { groupId: settings.staffGroupId })
        : ctx.t!('admin.settings.noGroup');

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(ctx.t!('admin.settings.linkStaffGroup'), 'link_staff_group')],
        [Markup.button.callback(ctx.t!('admin.settings.updateAiToken'), 'update_ai_token')],
        [Markup.button.callback(ctx.t!('buttons.back'), 'back_admin_menu')]
      ]);

      const message = `
⚙️ *${ctx.t!('admin.settings.title')}*

📱 *جروب الموظفين:*
${groupStatus}

🧠 *AI Token:* ${settings?.aiToken ? '✅ مُعدّ' : '❌ غير مُعدّ'}

💡 *${ctx.t!('admin.settings.linkInstructions')}*
      `.trim();

      await ctx.reply(message, { ...keyboard, parse_mode: 'Markdown' });
    } catch (error) {
      console.error('System Settings Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Link Staff Group
  static async linkStaffGroup(ctx: BotContext) {
    try {
      // This command should be executed in a group
      if (ctx.chat?.type !== 'group' && ctx.chat?.type !== 'supergroup') {
        await ctx.reply(ctx.t!('admin.settings.notInGroup'));
        return;
      }

      const groupId = ctx.chat.id.toString();

      await SystemSettings.updateOne(
        {},
        { staffGroupId: groupId },
        { upsert: true }
      );

      await ctx.reply(ctx.t!('admin.settings.groupLinked'));
    } catch (error) {
      console.error('Link Group Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Update AI Token
  static async updateAIToken(ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply(ctx.t!('admin.settings.enterAiToken'), Markup.keyboard([
      [ctx.t!('buttons.cancel')]
    ]).resize());

    (ctx.session as any).expectingAIToken = true;
  }

  static async saveAIToken(ctx: BotContext, token: string) {
    try {
      await SystemSettings.updateOne(
        {},
        { aiToken: token, updatedAt: new Date() },
        { upsert: true }
      );

      // Reinitialize AI service
      const { aiService } = await import('../services/ai.service');
      await aiService.initialize();

      await ctx.reply(ctx.t!('admin.settings.tokenUpdated'));
    } catch (error) {
      console.error('Update Token Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    } finally {
      (ctx.session as any).expectingAIToken = false;
    }
  }

  // Employee Statistics
  static async showEmployeeStats(ctx: BotContext) {
    try {
      const Employee = mongoose.model('Employee');
      
      const totalEmployees = await Employee.countDocuments({ isActive: true });
      const adminCount = await Employee.countDocuments({ role: 'Admin', isActive: true });
      const receptionistCount = await Employee.countDocuments({ role: 'Receptionist', isActive: true });
      const housekeepingCount = await Employee.countDocuments({ role: 'Housekeeping', isActive: true });
      const serviceCount = await Employee.countDocuments({ role: 'Service', isActive: true });

      const message = `
👥 *إحصائيات الموظفين*

📊 إجمالي الموظفين: ${totalEmployees}

👔 المدراء: ${adminCount}
🎯 الاستقبال: ${receptionistCount}
🧹 التنظيف: ${housekeepingCount}
🛎️ الخدمات: ${serviceCount}
      `.trim();

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Employee Stats Error:', error);
      await ctx.reply(ctx.t!('errors.general'));
    }
  }

  // Reports (placeholder for future implementation)
  static async showReports(ctx: BotContext) {
    await ctx.reply('📈 قسم التقارير قيد التطوير...\n\nسيتم إضافة:\n• تقارير الإيرادات\n• تقارير الإشغال\n• تقارير التقييمات\n• تقارير الخدمات');
  }
}
