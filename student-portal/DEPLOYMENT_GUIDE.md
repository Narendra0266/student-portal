# Deployment Guide: School Management Portal to Vercel

## Project Overview

This is a **School Management Portal** for Modern Group of Education with:
- **Frontend**: Static HTML/CSS/JS files in `/frontend`
- **Backend**: Express.js API with MySQL database in `/backend`
- **Current Setup**: Single Express server serving both frontend and API

---

## Architecture Decision: Split Deployment

> **⚠️ Important**: Vercel is optimized for **static frontends** and **serverless functions**. It **cannot run persistent MySQL connections** or long-running Express servers.

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐        HTTPS/API Calls        ┌─────────┐ │
│  │   VERCEL     │  ◄────────────────────────────► │ BACKEND │ │
│  │  (Frontend)  │                               │  (API)  │ │
│  │              │     ┌─────────────────────┐    │         │ │
│  │  • index.html│     │  MANAGED MYSQL      │    │         │ │
│  │  • student.  │     │  (PlanetScale/      │    │         │ │
│  │  • admin.html│     │   Railway/Aiven)    │    │         │ │
│  │  • CSS/JS    │     │                     │    │         │ │
│  └──────────────┘     └─────────────────────┘    └─────────┘ │
│        │                                               ▲      │
│        │              Deploy Separately                │      │
│        ▼                                               │      │
│  Global CDN                                    Render/Railway/Fly.io
│  HTTPS + Custom Domain                          Persistent Server
```

---

## Option 1: Frontend-Only on Vercel (Recommended)

### Prerequisites
- Vercel account (free tier works)
- GitHub/GitLab/Bitbucket repository
- External backend deployed (Render, Railway, Fly.io, etc.)
- External MySQL database (PlanetScale, Railway, Aiven, etc.)

### Step 1: Prepare Backend for Production

The backend needs to be deployed separately because:
- Express servers need persistent processes
- MySQL requires persistent connections
- Vercel functions have 10-60s timeout limits

**Deploy Backend to Render.com (Recommended):**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create **New Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `student-portal`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-secure-random-string-256-bit
   DB_HOST=your-mysql-host
   DB_PORT=3306
   DB_USER=your-db-user
   DB_PASS=your-db-password
   DB_NAME=school_portal
   ```
7. Deploy!

**Alternative: Railway.app**
- Similar process, often simpler for MySQL

**Alternative: Fly.io**
- More control, Docker-based

### Step 2: Set Up Managed MySQL Database

**Option A: PlanetScale (MySQL-compatible, serverless)**
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database `school_portal`
3. Run `database/schema.sql` in PlanetScale console
4. Get connection string → use in backend env vars

**Option B: Railway MySQL**
1. Add MySQL service in Railway project
2. Run schema
3. Use internal connection

**Option C: Aiven / Clever Cloud / DigitalOcean Managed DB**

### Step 3: Update Frontend API Base URL

The frontend currently uses relative URLs (`/api/...`). For cross-origin deployment, update `frontend/js/auth.js`:

```javascript
// Change line 3 in auth.js from:
const API_BASE_URL = window.location.origin;

// To:
const API_BASE_URL = 'https://your-backend.onrender.com';  // Your backend URL
```

**Or use environment-based approach:**
```javascript
// In auth.js
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? window.location.origin 
  : 'https://your-backend.onrender.com';
```

### Step 4: Configure CORS on Backend

Update `backend/server.js` to allow Vercel domain:

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://your-project.vercel.app',  // Your Vercel URL
  'https://your-custom-domain.com'    // If using custom domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Step 5: Deploy Frontend to Vercel

**Via Vercel CLI (Fastest):**
```bash
cd student-portal
npm i -g vercel
vercel login
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `student-portal`
   - **Build Command**: `echo 'No build step needed'`
   - **Output Directory**: `frontend`
4. Deploy!

**The existing `vercel.json` handles:**
- Static file serving from `frontend/`
- Security headers (XSS, frame protection, MIME sniffing)
- SPA rewrites (if you add React/Vue later)

---

## Option 2: Full-Stack on Vercel (Advanced)

> **⚠️ Not recommended for this project** due to MySQL requirements. Only use if you migrate to a serverless-compatible database.

### Required Changes

1. **Convert Express routes to Vercel Serverless Functions:**
   ```
   student-portal/
   ├── api/
   │   ├── auth.js          # POST /api/auth/login
   │   ├── students.js      # GET/POST /api/students/*
   │   ├── teachers.js
   │   ├── admin.js
   │   └── ... (all routes)
   ├── frontend/            # Static files
   └── vercel.json
   ```

2. **Use Serverless-Compatible Database:**
   - **PlanetScale** (MySQL) - Best for Vercel
   - **Supabase** (PostgreSQL) - Requires query changes
   - **MongoDB Atlas** - Requires ORM change
   - **Vercel KV/Postgres** - Limited free tier

3. **Update Database Connection:**
   ```javascript
   // api/lib/db.js
   const mysql = require('mysql2/promise');
   
   let cachedConnection = null;
   
   async function getConnection() {
     if (cachedConnection) return cachedConnection;
     
     cachedConnection = await mysql.createConnection({
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASS,
       database: process.env.DB_NAME,
       ssl: { rejectUnauthorized: true }  // Required for PlanetScale
     });
     
     return cachedConnection;
   }
   
   module.exports = { getConnection };
   ```

4. **Connection Pooling for Serverless:**
   - Use `@planetscale/database` (HTTP-based, no pooling needed)
   - Or configure connection limits carefully

---

## Environment Variables Reference

### Frontend (Vercel Project Settings)
| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Backend API base URL |

### Backend (Render/Railway/Fly.io)
| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `5000` (Render uses this) | Server port |
| `NODE_ENV` | `production` | Environment |
| `JWT_SECRET` | `secure-random-256-bit-string` | **Must be secure!** |
| `DB_HOST` | `your-db-host` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `your-user` | DB username |
| `DB_PASS` | `your-password` | DB password |
| `DB_NAME` | `school_portal` | Database name |

### Database (PlanetScale Example)
| Variable | Value |
|----------|-------|
| `DB_HOST` | `aws.connect.psdb.cloud` |
| `DB_USER` | `xxxxxxxxxxxx` |
| `DB_PASS` | `pscale_pw_xxxxxxxxxx` |
| `DB_NAME` | `school_portal` |

---

## Security Checklist

### Before Deploying

- [ ] **Generate strong JWT_SECRET** (32+ chars): `openssl rand -base64 32`
- [ ] **Use HTTPS everywhere** (Vercel provides automatically)
- [ ] **Restrict CORS** to your Vercel domain only
- [ ] **Never commit `.env` files** (add to `.gitignore`)
- [ ] **Use managed database** with SSL/TLS
- [ ] **Enable firewall** on database (allow only backend IP)
- [ ] **Set secure cookies** if using sessions:
  ```javascript
  app.use(session({
    cookie: { secure: true, sameSite: 'lax', httpOnly: true }
  }));
  ```

### Vercel-Specific Security

The `vercel.json` already includes:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

Add these for production:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## Step-by-Step Quick Start

### 1. Database Setup (5 min)
```bash
# Option: PlanetScale (recommended for Vercel)
# 1. Sign up at planetscale.com
# 2. Create database "school-portal"
# 3. Run schema.sql in console
# 4. Get connection details
```

### 2. Backend Deploy to Render (10 min)
```bash
# 1. Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Render Dashboard → New Web Service
#    - Root: student-portal
#    - Build: npm install
#    - Start: npm start
# 3. Add all environment variables
# 4. Deploy → Get URL (e.g., https://school-portal-api.onrender.com)
```

### 3. Update Frontend API URL (2 min)
```javascript
// student-portal/frontend/js/auth.js line 3
const API_BASE_URL = 'https://school-portal-api.onrender.com';
```

### 4. Deploy Frontend to Vercel (3 min)
```bash
cd student-portal
vercel --prod
# Follow prompts
# Add NEXT_PUBLIC_API_URL in Vercel dashboard if needed
```

### 5. Configure CORS (2 min)
```javascript
// backend/server.js - update CORS origins
const allowedOrigins = [
  'https://your-project.vercel.app',
  'https://your-custom-domain.com'
];
```
Re-deploy backend.

### 6. Test Everything (5 min)
- [ ] Login works (admin/teacher/student)
- [ ] All dashboard tabs load data
- [ ] CRUD operations work
- [ ] File uploads work (if using multer)
- [ ] Mobile responsive

---

## Common Issues & Solutions

### Issue: "CORS Error" on API calls
**Solution:** Update backend CORS to include your Vercel domain exactly.

### Issue: "Database connection failed" on Render
**Solution:** 
- Check DB_HOST/DB_PORT/DB_NAME are correct
- Ensure database allows connections from Render IPs
- Use SSL for managed databases

### Issue: "JWT_SECRET not defined"
**Solution:** Generate and add to backend env vars:
```bash
openssl rand -base64 32
```

### Issue: Frontend shows blank page / 404 on refresh
**Solution:** Ensure `vercel.json` has rewrites:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/$1" }]
}
```

### Issue: File uploads fail on Vercel
**Solution:** Vercel has 4.5MB body limit. Use:
- Backend handles uploads (not Vercel)
- Or use signed URLs to S3/Cloudinary

### Issue: "Function timeout" on Vercel
**Solution:** This happens if you try to run Express on Vercel. Don't - use separate backend.

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel (Frontend)** | ✅ Unlimited personal | $20/team |
| **Render (Backend)** | ✅ 750 hrs/mo | $7/mo |
| **PlanetScale (DB)** | ✅ 1 DB, 5GB | $29/mo |
| **Railway (All-in-one)** | ✅ $5 credit | $5-20/mo |
| **Fly.io (Backend)** | ✅ 3 shared VMs | ~$5/mo |

**Recommended Free Stack:** Vercel + Render + PlanetScale = **$0/month**

---

## Custom Domain Setup

### Vercel (Frontend)
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain → Configure DNS (CNAME to `cname.vercel-dns.com`)
3. SSL auto-provisioned

### Render (Backend)
1. Render Dashboard → Service → Settings → Custom Domains
2. Add domain → Configure DNS
3. Update CORS in backend with new domain

---

## CI/CD Pipeline (Optional)

### GitHub Actions for Vercel
```yaml
# .github/workflows/vercel-frontend.yml
name: Deploy Frontend to Vercel
on:
  push:
    branches: [main]
    paths: ['student-portal/frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./student-portal
```

### GitHub Actions for Render
```yaml
# .github/workflows/render-backend.yml
name: Deploy Backend to Render
on:
  push:
    branches: [main]
    paths: ['student-portal/backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Monitoring & Maintenance

### Health Checks
- **Frontend**: Vercel Analytics (free)
- **Backend**: Render health checks / UptimeRobot
- **Database**: PlanetScale insights / Railway metrics

### Logs
- **Vercel**: Dashboard → Functions → Logs
- **Render**: Dashboard → Logs
- **Database**: Provider dashboard

### Backups
- **PlanetScale**: Automatic daily backups
- **Railway**: Manual snapshots
- **Custom**: `mysqldump` via cron

---

## Migration Checklist (From Local to Production)

- [ ] Database schema deployed to production DB
- [ ] Seed data inserted (admin user, etc.)
- [ ] Backend deployed and healthy
- [ ] CORS configured for Vercel domain
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Vercel
- [ ] Custom domains configured (if applicable)
- [ ] SSL verified on all endpoints
- [ ] Test all user roles (admin, teacher, student, parent)
- [ ] Test file uploads
- [ ] Verify email/password auth works
- [ ] Check mobile responsiveness
- [ ] Set up monitoring/alerts

---

## Quick Commands Reference

```bash
# Local development
cd student-portal
npm run dev          # Start with nodemon
npm start            # Production mode

# Database
mysql -u root -p < database/schema.sql

# Vercel
vercel               # Preview deploy
vercel --prod        # Production deploy
vercel env pull      # Pull env vars locally
vercel logs          # View deployment logs

# Render (via CLI)
render deploy --service school-portal

# Database (PlanetScale)
pscale shell school-portal main
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **PlanetScale Docs**: https://planetscale.com/docs
- **Express.js**: https://expressjs.com/
- **MySQL2**: https://github.com/sidorares/node-mysql2

---

## Summary

| Approach | Complexity | Cost | Best For |
|----------|------------|------|----------|
| **Frontend on Vercel + Backend on Render** | Low | Free | **Recommended** |
| **Full-stack on Vercel** | High | Free/Paid | Simple apps, serverless DB |
| **All on Render** | Low | Free | Simpler, single platform |
| **All on Railway** | Low | Free trial | Quick prototypes |

**Start with Option 1** - it's the most reliable, scalable, and cost-effective for this architecture.