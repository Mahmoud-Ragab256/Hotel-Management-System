import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  aiToken?: string;
  staffGroupId?: string;
  aiModel: string;
  defaultLanguage: string;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  aiToken: { type: String },
  staffGroupId: { type: String },
  aiModel: { type: String, default: 'gpt-4o-mini' },
  defaultLanguage: { type: String, default: 'ar' },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'system_settings'
});

// Ensure only one document exists
SystemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

SystemSettingsSchema.statics.updateSettings = async function(updates: Partial<ISystemSettings>) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    settings.updatedAt = new Date();
    await settings.save();
  }
  return settings;
};

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
