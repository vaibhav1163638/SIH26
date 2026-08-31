# AgroSarthi AI - PS 131

This is the Next.js App Router application for the SIH 2026 PS 131 prototype.

## 🗄️ MongoDB Verification Guide

The application natively connects to a MongoDB database to persist actual farmer profiles, crop scans, and locations. 

To verify that your data is actively being saved, you can inspect the database directly:

### 1. Database & Collections
- **Database Name:** `sih131`
- **Important Collections:** 
  - `farmers` (User accounts and passwords)
  - `farms` (Farm profiles, crops, locations)
  - `scans` (Scan history and AI results)
  - `alerts` (Regional outbreak alerts)

### 2. How to view the data
**If using Local MongoDB (Compass):**
1. Open MongoDB Compass.
2. Connect to `mongodb://localhost:27017`
3. Select the `sih131` database on the left sidebar.
4. Click into `farms` or `scans` to see the documents you just created.

**If using MongoDB Atlas (Cloud):**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to your Project -> Database.
3. Click "Browse Collections".
4. Expand the `sih131` namespace.

### 3. Developer Health Check
When running locally (`npm run dev`), you can view live database collection counts by visiting:
[http://localhost:3000/api/health](http://localhost:3000/api/health)

A successful response looks like this:
```json
{
  "status": "ok",
  "database": "connected",
  "demoMode": false,
  "collections": {
    "farmers": 1,
    "farms": 1,
    "scans": 3,
    "alerts": 2
  }
}
```

*Note: If the `demoMode` field is `true`, MongoDB is unavailable and the app is running in in-memory fallback mode.*
