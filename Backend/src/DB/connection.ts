import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();
    const mongoDbName = process.env.MONGODB_DB?.trim();

    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing in Backend/.env');
    }

    await mongoose.connect(
      mongoUri,
      mongoDbName ? { dbName: mongoDbName } : undefined
    );

    console.log(
      `MongoDB connected successfully${mongoDbName ? ` | DB: ${mongoDbName}` : ''}`
    );
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
