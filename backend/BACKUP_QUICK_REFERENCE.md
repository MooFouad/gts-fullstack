# Database Backup - Quick Reference

## Create a Backup

```bash
cd backend
npm run backup:mongoose
```

## Restore a Backup

```bash
cd backend
npm run restore
```

## List All Backups

```bash
cd backend
npm run backup:list
```

---

## Backup Before:
- Major code changes
- Database schema updates
- Production deployments
- Data imports or bulk operations

---

## Files Location
- Backups: `backend/backups/`
- Scripts: `backend/scripts/backupDatabase.js` and `restoreDatabase.js`
- Full Guide: `backend/BACKUP_GUIDE.md`

---

## Two Backup Methods Available:

### 1. Mongoose (Simple - Recommended)
```bash
npm run backup:mongoose
```
- No extra tools needed
- Creates JSON file
- Works everywhere

### 2. Mongodump (Advanced)
```bash
npm run backup
```
- Requires MongoDB Database Tools
- Faster for large databases
- BSON format

---

## Automatic Cleanup
- Keeps last 7 backups automatically
- Older backups deleted automatically

---

## Need Help?
Read the full guide: `backend/BACKUP_GUIDE.md`
