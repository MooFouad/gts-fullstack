const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../backups');

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

// List available backups
function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
        isMongoose: file.includes('mongoose') && file.endsWith('.json')
      }))
      .sort((a, b) => b.time - a.time);

    return files;
  } catch (error) {
    console.error('❌ Error listing backups:', error.message);
    return [];
  }
}

// Restore using mongorestore
function restoreWithMongorestore(backupPath) {
  const mongoUri = parseMongoUri(process.env.MONGODB_URI);

  if (!mongoUri) {
    console.error('❌ Could not parse MongoDB URI');
    return;
  }

  let command;
  if (mongoUri.isAtlas) {
    // MongoDB Atlas restore
    command = `mongorestore --uri="${process.env.MONGODB_URI}" --drop "${backupPath}"`;
  } else {
    // Local MongoDB restore
    const dbBackupPath = path.join(backupPath, mongoUri.database);
    command = `mongorestore --host=${mongoUri.host} --port=${mongoUri.port} --db=${mongoUri.database} --drop "${dbBackupPath}"`;
  }

  console.log('🔄 Starting database restore with mongorestore...');
  console.log(`📦 Restoring from: ${backupPath}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Restore failed:', error.message);
      console.error('💡 Make sure MongoDB Database Tools are installed:');
      console.error('   Download from: https://www.mongodb.com/try/download/database-tools');
      return;
    }
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    console.log('✅ Database restored successfully!');
    console.log(stdout);
  });
}

// Restore using Mongoose
async function restoreWithMongoose(backupPath) {
  const mongoose = require('mongoose');

  console.log('🔄 Starting database restore with Mongoose...');
  console.log(`📦 Restoring from: ${backupPath}`);

  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    // Restore each collection
    for (const [collectionName, documents] of Object.entries(backupData)) {
      console.log(`📥 Restoring collection: ${collectionName}`);

      // Drop existing collection
      try {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`   🗑️  Dropped existing collection`);
      } catch (error) {
        // Collection might not exist, continue
      }

      // Insert documents
      if (documents.length > 0) {
        await mongoose.connection.db.collection(collectionName).insertMany(documents);
        console.log(`   ✓ Restored ${documents.length} documents`);
      } else {
        console.log(`   ⚠️  No documents to restore`);
      }
    }

    console.log('✅ Database restored successfully!');
    console.log(`📊 Total collections restored: ${Object.keys(backupData).length}`);

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Interactive restore
async function interactiveRestore() {
  const backups = listBackups();

  if (backups.length === 0) {
    console.log('📭 No backups found');
    process.exit(0);
  }

  console.log('\n📦 Available backups:\n');
  backups.forEach((backup, index) => {
    const type = backup.isMongoose ? '(Mongoose)' : '(mongodump)';
    console.log(`${index + 1}. ${backup.name} ${type}`);
    console.log(`   📅 ${backup.time.toLocaleString()}\n`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the number of the backup to restore (or 0 to cancel): ', (answer) => {
    const choice = parseInt(answer);

    if (choice === 0 || isNaN(choice)) {
      console.log('❌ Restore cancelled');
      rl.close();
      process.exit(0);
    }

    if (choice < 1 || choice > backups.length) {
      console.log('❌ Invalid choice');
      rl.close();
      process.exit(1);
    }

    const selectedBackup = backups[choice - 1];

    rl.question('\n⚠️  WARNING: This will replace all existing data!\nAre you sure? (yes/no): ', async (confirm) => {
      if (confirm.toLowerCase() === 'yes') {
        if (selectedBackup.isMongoose) {
          await restoreWithMongoose(selectedBackup.path);
        } else {
          restoreWithMongorestore(selectedBackup.path);
        }
      } else {
        console.log('❌ Restore cancelled');
      }
      rl.close();
    });
  });
}

// Main execution
const args = process.argv.slice(2);
const backupName = args[0];

if (backupName) {
  // Direct restore with backup name
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupName}`);
    console.log('\n💡 Use --list to see available backups:');
    console.log('   npm run backup:list');
    process.exit(1);
  }

  const isMongoose = backupName.includes('mongoose') && backupName.endsWith('.json');

  if (isMongoose) {
    restoreWithMongoose(backupPath);
  } else {
    restoreWithMongorestore(backupPath);
  }
} else {
  // Interactive restore
  interactiveRestore();
}
