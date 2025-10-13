const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create backups directory if it doesn't exist
const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Parse MongoDB URI to get database name and connection details
function parseMongoUri(uri) {
  try {
    // Handle MongoDB Atlas URI
    if (uri.includes('mongodb+srv://')) {
      const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
      if (match) {
        return {
          username: match[1],
          password: match[2],
          host: match[3],
          database: match[4],
          isAtlas: true
        };
      }
    }
    // Handle local MongoDB URI
    else if (uri.includes('mongodb://')) {
      const match = uri.match(/mongodb:\/\/([^:\/]+):(\d+)\/([^?]+)/);
      if (match) {
        return {
          host: match[1],
          port: match[2],
          database: match[3],
          isAtlas: false
        };
      }
    }
  } catch (error) {
    console.error('Error parsing MongoDB URI:', error.message);
  }
  return null;
}

// Backup using mongodump (recommended for production)
function backupWithMongodump() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
  const mongoUri = parseMongoUri(process.env.MONGODB_URI);

  if (!mongoUri) {
    console.error('❌ Could not parse MongoDB URI');
    return;
  }

  let command;
  if (mongoUri.isAtlas) {
    // MongoDB Atlas backup
    command = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupPath}"`;
  } else {
    // Local MongoDB backup
    command = `mongodump --host=${mongoUri.host} --port=${mongoUri.port} --db=${mongoUri.database} --out="${backupPath}"`;
  }

  console.log('🔄 Starting database backup with mongodump...');
  console.log(`📦 Backup location: ${backupPath}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed:', error.message);
      console.error('💡 Make sure MongoDB Database Tools are installed:');
      console.error('   Download from: https://www.mongodb.com/try/download/database-tools');
      console.error('\n💡 Alternative: Use the Mongoose backup method with --mongoose flag');
      return;
    }
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);

    // Cleanup old backups (keep last 7)
    cleanupOldBackups(7);
  });
}

// Backup using Mongoose (no external tools required)
async function backupWithMongoose() {
  const mongoose = require('mongoose');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-mongoose-${timestamp}.json`);

  console.log('🔄 Starting database backup with Mongoose...');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backup = {};

    // Export each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📦 Backing up collection: ${collectionName}`);

      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      backup[collectionName] = data;
      console.log(`   ✓ Exported ${data.length} documents`);
    }

    // Save backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Total collections backed up: ${collections.length}`);

    // Cleanup old backups (keep last 7)
    cleanupOldBackups(7);

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Cleanup old backups
function cleanupOldBackups(keepCount) {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > keepCount) {
      console.log(`🧹 Cleaning up old backups (keeping last ${keepCount})...`);
      files.slice(keepCount).forEach(file => {
        if (fs.lstatSync(file.path).isDirectory()) {
          fs.rmSync(file.path, { recursive: true, force: true });
        } else {
          fs.unlinkSync(file.path);
        }
        console.log(`   🗑️  Deleted: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('⚠️  Cleanup warning:', error.message);
  }
}

// List all backups
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
        size: getDirectorySize(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      console.log('📭 No backups found');
      return;
    }

    console.log(`\n📦 Available backups (${files.length}):\n`);
    files.forEach((file, index) => {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   📅 Date: ${file.time.toLocaleString()}`);
      console.log(`   💾 Size: ${sizeInMB} MB\n`);
    });
  } catch (error) {
    console.error('❌ Error listing backups:', error.message);
  }
}

// Get directory or file size
function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const stat = fs.statSync(dirPath);
    if (stat.isFile()) {
      return stat.size;
    }
    if (stat.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        size += getDirectorySize(path.join(dirPath, file));
      });
    }
  } catch (error) {
    // Ignore errors
  }
  return size;
}

// Main execution
const args = process.argv.slice(2);
const useMongoose = args.includes('--mongoose');
const listOnly = args.includes('--list');

if (listOnly) {
  listBackups();
} else if (useMongoose) {
  backupWithMongoose();
} else {
  backupWithMongodump();
}
