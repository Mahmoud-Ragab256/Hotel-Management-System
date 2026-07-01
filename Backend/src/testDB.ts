import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGODB_URI?.trim();
const mongoDbName = process.env.MONGODB_DB?.trim();

if (!mongoUri) {
  console.error('MONGODB_URI is missing in Backend/.env');
  process.exit(1);
}

const maskUri = (uri: string): string =>
  uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*?@)?([^/?]+)(\/[^?]*)?(\?.*)?/i, (_match, proto, auth, host, db, qs) => {
    return `${proto}${auth ? '***:***@' : ''}${host}${db || '/(no-db-in-uri)'}${qs ? '?***' : ''}`;
  });

try {
  await mongoose.connect(mongoUri, mongoDbName ? { dbName: mongoDbName } : undefined);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection opened but database handle is not available');
  }

  console.log('MongoDB ping: OK');
  console.log(`URI: ${maskUri(mongoUri)}`);
  console.log(`Active database: ${db.databaseName}`);

  const collections = await db.listCollections().toArray();
  console.log(`Collections: ${collections.length}`);

  for (const collection of collections) {
    const count = await db.collection(collection.name).estimatedDocumentCount();
    console.log(`- ${collection.name}: ${count}`);
  }

  const roomsCount = await db.collection('rooms').estimatedDocumentCount().catch(() => 0);
  const categoriesCount = await db.collection('roomcategories').estimatedDocumentCount().catch(() => 0);

  console.log(`Rooms count: ${roomsCount}`);
  console.log(`Room categories count: ${categoriesCount}`);

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('MongoDB test failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
}
