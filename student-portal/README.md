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
