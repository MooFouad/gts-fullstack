// Script to drop the emailsubscriptions collection from MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const dropCollection = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if collection exists
    const collections = await db.listCollections({ name: 'emailsubscriptions' }).toArray();

    if (collections.length === 0) {
      console.log('ℹ️  Collection "emailsubscriptions" does not exist');
      process.exit(0);
    }

    console.log('🗑️  Dropping "emailsubscriptions" collection...');
    await db.dropCollection('emailsubscriptions');
    console.log('✅ Successfully dropped "emailsubscriptions" collection');

    // Show remaining collections
    const remainingCollections = await db.listCollections().toArray();
    console.log('\n📋 Remaining collections:');
    remainingCollections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

dropCollection();
