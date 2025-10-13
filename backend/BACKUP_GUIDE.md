 Database Backup & Restore Guide

This guide explains how to backup and restore your MongoDB database for the GTS Dashboard application.

## Quick Start

### Backup Database

```bash
# Navigate to backend directory
cd backend

# Create a backup using Mongoose (easiest, no external tools needed)
npm run backup:mongoose

# OR use mongodump (requires MongoDB Database Tools)
npm run backup

# List all backups
npm run backup:list
```

### Restore Database

```bash
# Interactive restore (recommended)
npm run restore

# Restore a specific backup
npm run restore:backup backup-2025-01-15T10-30-00-000Z
```

---

## Backup Methods

### Method 1: Mongoose Backup (Recommended for Beginners)

**Pros:**
- No external tools required
- Works on all platforms (Windows, Mac, Linux)
- Simple JSON format
- Easy to inspect backup contents

**Cons:**
- Slower for very large databases
- Larger file size

**Usage:**
```bash
npm run backup:mongoose
```

This creates a JSON file in `backend/backups/` with all your data.

---

### Method 2: mongodump Backup (Recommended for Production)

**Pros:**
- Official MongoDB backup tool
- Faster and more efficient
- Better for large databases
- Compressed BSON format

**Cons:**
- Requires MongoDB Database Tools installation

**Installation:**

1. Download MongoDB Database Tools from:
   https://www.mongodb.com/try/download/database-tools

2. Install and add to PATH:
   - **Windows**: Add `C:\Program Files\MongoDB\Tools\100\bin` to PATH
   - **Mac/Linux**: Usually auto-installed with MongoDB

3. Verify installation:
   ```bash
   mongodump --version
   ```

**Usage:**
```bash
npm run backup
```

---

## Restore Process

### Interactive Restore (Recommended)

```bash
npm run restore
```

This will:
1. Show you all available backups
2. Let you choose which one to restore
3. Ask for confirmation before replacing data
4. Automatically detect backup type (Mongoose or mongodump)

### Direct Restore

```bash
# Restore a specific backup by name
npm run restore:backup backup-mongoose-2025-01-15T10-30-00-000Z.json
```

---

## Backup Management

### List All Backups

```bash
npm run backup:list
```

Shows:
- Backup name
- Creation date
- File size
- Total number of backups

### Automatic Cleanup

The backup script automatically:
- Keeps the last 7 backups
- Deletes older backups automatically
- Saves disk space

To change the retention period, edit `scripts/backupDatabase.js`:
```javascript
cleanupOldBackups(7); // Change 7 to your desired number
```

---

## Automated Backups

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2 AM)
4. Action: Start a program
   - Program: `npm`
   - Arguments: `run backup:mongoose`
   - Start in: `C:\web\GTS\New folder\fullstack\backend`

### Linux/Mac Cron

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/fullstack/backend && npm run backup:mongoose
```

### Using Node-Cron (In-App)

Create `backend/services/backupScheduler.js`:

```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

// Backup every day at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('🔄 Starting scheduled backup...');
  exec('npm run backup:mongoose', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Scheduled backup failed:', error);
      return;
    }
    console.log('✅ Scheduled backup completed');
  });
});

module.exports = { start: () => console.log('📅 Backup scheduler started') };
```

Then in `server.js`, add:
```javascript
const backupScheduler = require('./services/backupScheduler');
// After server starts:
backupScheduler.start();
```

---

## Backup Storage Locations

### Local Backups
- Location: `backend/backups/`
- Naming: `backup-YYYY-MM-DDTHH-mm-ss-sssZ`
- Format: Directory (mongodump) or JSON file (mongoose)

### Remote Backups (Recommended for Production)

#### Option 1: Cloud Storage (AWS S3, Google Cloud Storage)

Install AWS SDK:
```bash
npm install aws-sdk
```

Add to backup script:
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
// Upload backup to S3 after creation
```

#### Option 2: Git LFS (Large File Storage)

For small databases:
```bash
git lfs install
git lfs track "backend/backups/*.json"
git add .gitattributes
```

---

## MongoDB Atlas Automatic Backups

If using MongoDB Atlas (cloud):

1. Log into MongoDB Atlas
2. Go to your cluster
3. Click "Backup" tab
4. Enable Cloud Backup (paid feature)

Atlas provides:
- Continuous backups
- Point-in-time restore
- Automatic snapshots
- 7-day retention (configurable)

---

## Best Practices

### 1. Regular Backups
- Development: Weekly backups before major changes
- Production: Daily automated backups

### 2. Test Your Backups
```bash
# Periodically test restore process
npm run backup:mongoose
npm run restore
```

### 3. Multiple Backup Locations
- Keep local backups for quick recovery
- Store remote backups for disaster recovery
- Consider 3-2-1 rule: 3 copies, 2 different media, 1 offsite

### 4. Before Major Changes
```bash
# Always backup before:
# - Database migrations
# - Major updates
# - Schema changes
npm run backup:mongoose
```

### 5. Secure Your Backups
- Don't commit backups to git (already in .gitignore)
- Encrypt sensitive backups
- Restrict access to backup directory
- Use environment variables for credentials

---

## Troubleshooting

### "mongodump not found"
**Solution:** Install MongoDB Database Tools or use Mongoose backup:
```bash
npm run backup:mongoose
```

### "Connection timeout"
**Solution:** Check your MONGODB_URI in `.env` file and ensure MongoDB is running.

### "Permission denied"
**Solution:** Ensure the `backend/backups/` directory has write permissions:
```bash
chmod 755 backend/backups
```

### "Out of disk space"
**Solution:**
1. Check available disk space
2. Delete old backups manually from `backend/backups/`
3. Reduce backup retention in script

### Backup file is empty or very small
**Solution:**
1. Check if database has data
2. Verify MongoDB connection
3. Check for errors during backup

---

## Recovery Scenarios

### Lost All Data
```bash
npm run restore
# Select most recent backup
```

### Accidental Deletion
```bash
npm run restore
# Select backup from before deletion
```

### Corrupted Database
```bash
# 1. Stop the server
# 2. Restore from backup
npm run restore
# 3. Restart server
npm start
```

### Migration to New Server
```bash
# On old server:
npm run backup:mongoose

# Copy backup file to new server
# On new server:
npm run restore:backup [backup-file-name]
```

---

## Support

For issues or questions:
1. Check MongoDB logs
2. Verify `.env` configuration
3. Test MongoDB connection
4. Review backup script logs

---

## Summary of Commands

| Command | Description |
|---------|-------------|
| `npm run backup` | Backup using mongodump |
| `npm run backup:mongoose` | Backup using Mongoose (no tools needed) |
| `npm run backup:list` | List all available backups |
| `npm run restore` | Interactive restore menu |
| `npm run restore:backup [name]` | Restore specific backup |

**Recommended:** Use `npm run backup:mongoose` for simplicity!
