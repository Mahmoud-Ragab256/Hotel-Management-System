import mongoose, { Document, Model, Schema } from 'mongoose';


export interface ISystemSettings extends Document {
  aiToken?: string;
  staffGroupId?: string;
  createdAt: Date;
  updatedAt: Date;
}


const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    aiToken: {
      type: String,
    },
    staffGroupId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


export const SystemSettings: Model<ISystemSettings> = mongoose.model<ISystemSettings>(
  'SystemSettings',
  systemSettingsSchema
);