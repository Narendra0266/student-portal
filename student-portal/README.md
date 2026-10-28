# Modern Group of Education - Student Portal

A complete, production-ready Student Portal Web Application built for **Modern Group of Education, Kuchaman City, Rajasthan**. This application manages student academic records, schedules, fee ledgers, and notices using a Node.js + Express backend, MySQL database, and responsive frontend dashboards.

---

## 🗂️ Project Structure

```
student-portal/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── routes/                # Route definitions
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── admin.js
│   │   ├── attendance.js
│   │   ├── results.js
│   │   ├── fees.js
│   │   ├── notices.js
│   │   └── assignments.js
│   ├── controllers/           # API request controllers (one per route)
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── admin.js
│   │   ├── attendance.js
│   │   ├── results.js
│   │   ├── fees.js
│   │   ├── notices.js
│   │   └── assignments.js
│   ├── middleware/
│   │   └── auth.js            # JWT auth verification
│   └── .env                   # Environment configurations
├── frontend/                  # Web app static pages
│   ├── index.html             # Login gate
│   ├── student.html           # Student portal dashboard
│   ├── teacher.html           # Teacher portal dashboard
│   ├── admin.html             # Administrative console
│   ├── css/
│   │   └── style.css          # Glassmorphic and flip-card styling
│   └── js/
│       ├── auth.js            # Session guard and theme toggles
│       ├── student.js         # Student operations & Chart rendering
│       ├── teacher.js         # Attendance marking & grades recording
│       └── admin.js           # CRUD controls & administrative stats
└── database/
    └── schema.sql             # Database definition and seeds
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed:
- **Node.js** (v16.x or higher)
- **npm** (v8.x or higher)
- **MySQL Server** (v8.x or higher)

### 1. Install Dependencies
Navigate to the project directory and install the Node modules:
```bash
cd student-portal
npm install
```

### 2. Configure Database
1. Launch your MySQL command line client or a UI tool (like phpMyAdmin, DBeaver, or Workbench).
2. Execute the `database/schema.sql` script to create the database and seed it with mock credentials:
```bash
# Log in to MySQL server and run
mysql -u root -p < database/schema.sql
```

### 3. Setup Environment Variables
Verify or edit the `backend/.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password_here
DB_NAME=school_portal
DB_PORT=3306
JWT_SECRET=modern_group_secret_key_2026
PORT=5000
```

### 4. Launch the Server
Start the development server using:
```bash
npm run dev
```
For production launch, use:
```bash
npm start
```
The application will boot up at **`http://localhost:5000`**.

---

## 🔑 Demo Access Credentials

The database seeds include pre-configured accounts (passwords are hashed with bcrypt in DB):

| Role | Email | Password | Dashboard Features |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@modern.edu` | `admin123` | Global Stats, CRUD for Students/Teachers/Notices/Timetable/Fees |
| **Teacher** | `teacher@modern.edu` | `teacher123` | Class Roster, Bulk Attendance marking, Student Gradesheet upload, Post Homework |
| **Student** | `student@modern.edu` | `student123` | 10 Tabs (Profile, Attendance, Results, Fees, Timetable, Notices, Homework submission, Library, Transport, Hostel) |

---

## 🎨 Design Highlights
- **Premium Themes**: Implements curated Navy (`#1a2e5a`) and Gold (`#c9a227`) color aesthetics.
- **Glassmorphism**: Backdrop blur components that adapt gracefully.
- **Light/Dark Mode**: High contrast dark theme option available on every page.
- **Interactive SVG & Canvas Charts**: Displays responsive bar/doughnut graphs (Chart.js) for student analysis.
- **3D Flip Card ID**: Visually stunning student profile presentation.
- **Light-Dismiss Overlay**: Declarative native `<dialog>` modals with backdrop click dismissals.

---

## 🚀 Deployment to Vercel

### Option A: Frontend Only (Recommended)
This is the easiest approach and works best for student portals:

1. **Deploy the Frontend to Vercel**
   ```bash
   cd student-portal
   vercel --prod
   ```

2. **Deploy Backend Separately**
   The Express backend requires MySQL and persistent connections. Deploy to:
   - **Render.com** (recommended)
   - **Railway.app** 
   - **Fly.io**
   - **AWS Beanstalk** or **Azure App Service**

   The existing `render.yaml` file can be adapted for your backend deployment.

### Option B: Full-Stack on Vercel
For advanced setups, convert to Vercel serverless functions:

1. **Structure for Serverless**
   ```
   student-portal/
   ├── api/                 # Vercel API routes
   │   ├── auth.js
   │   ├── students.js
   │   └── ... (all your routes)
   ├── frontend/           # Static files
   └── vercel.json
   ```

2. **Use External Database**
   - **PlanetScale** (MySQL-compatible)
   - **MongoDB Atlas** (if you switch to MongoDB)
   - **Supabase** (PostgreSQL)
   - **Railway** (MySQL/Rails)

### Environment Variables for Vercel
```env
# For frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api

# For backend (if using serverless)
DB_HOST=your_database_host
DB_USER=your_user
DB_PASS=your_password
DB_NAME=school_portal
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### Database Connection Tips
- Vercel Functions have cold starts - consider connection pooling
- Use connection strings instead of individual env vars
- For MySQL, Vercel doesn't support persistent connections
- Use an external database service (PlanetScale, Supabase, Railway, etc.)

### Important Limitations
- ❌ Cannot run MySQL directly on Vercel
- ✅ Can serve static HTML/CSS/JS files
- ✅ Can run serverless API functions
- ✅ Custom domain support
- ✅ SSL/HTTPS included
- ✅ Global CDN

### What's Already Set Up
- ✅ Static frontend in `frontend/` directory
- ✅ `vercel.json` configuration
- ✅ Production optimization headers
- ✅ Rewrites for client-side routing (if you add React/Vue)

## 🔗 Multi-Service Architecture
For production, consider this pattern:
- **Frontend**: Vercel (static) - Fast, global CDN
- **API**: Render.com/Railway/Fly.io - Persistent MySQL
- **Database**: External MySQL (PlanetScale, Railway, etc.) - Managed

This gives you the best of both worlds: Vercel's frontend speed and a reliable backend with database persistence.
