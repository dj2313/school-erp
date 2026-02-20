# 🏫 School ERP System

A comprehensive Enterprise Resource Planning (ERP) system for schools and colleges. Manage students, staff, fees, attendance, exams, payroll, and more in one integrated platform.

**Live Demo:** https://school-j5764pmty-dhruv-trivedis-projects-930d3765.vercel.app

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👥 Multi-Role Portals
- **SuperAdmin:** Manage all institutions, subscriptions, and global settings
- **Institute Admin:** Full control over school/college operations
- **Teachers:** Mark attendance, manage classes, submit marks
- **Accountants:** Collect fees, generate reports, manage finances
- **HR Manager:** Staff management, payroll, leave tracking
- **Receptionist:** Admission inquiries, gate management
- **Librarian:** Library catalog and management
- **Students:** Access dashboard, academic info (mobile app)

### 📚 Core Modules
- ✅ Student Management (admission, profile, documents)
- ✅ Academic Year & Class Management
- ✅ Attendance Tracking (auto SMS alerts)
- ✅ Fee Management (invoices, payment tracking, reports)
- ✅ Exam Management (marks entry, result cards)
- ✅ Timetable Builder (conflict detection)
- ✅ Payroll Processing (salary slips, deductions)
- ✅ Leave Management (approval workflow)
- ✅ Library Management
- ✅ Transport Management
- ✅ Hostel Management
- ✅ Reports & Analytics
- ✅ Notifications (Email, SMS)

### 🔒 Security
- JWT authentication with refresh tokens
- Role-based access control
- Multi-tenant data isolation
- Password hashing with bcryptjs
- Secure HTTP-only cookies
- Environment variable protection

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React.js 19 (Vite)
- **State Management:** Zustand + TanStack Query
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod
- **UI Components:** shadcn/ui
- **Tables:** TanStack Table v8
- **Charts:** Recharts
- **PDF:** @react-pdf/renderer + jsPDF
- **HTTP:** Axios with interceptors

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT + bcryptjs
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Queue:** Bull (Redis)
- **PDF Generation:** Puppeteer
- **Real-time:** Socket.io
- **Data Export:** xlsx

### Database
- **Primary:** PostgreSQL (Supabase)
- **Cache:** Redis
- **Storage:** Cloudinary

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account (free)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR-USERNAME/school-erp.git
cd school-erp
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Setup Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
# Update VITE_API_URL to your backend URL
```

### 4. Database Setup
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## ⚙️ Installation

### Full Setup Guide

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables:
# - DATABASE_URL (Supabase PostgreSQL)
# - JWT_SECRET and JWT_REFRESH_SECRET
# - CLOUDINARY credentials (optional)
# - SMTP settings for email (optional)
# - MSG91 for SMS (optional)

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

#### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL to point to your backend
# Default: http://localhost:5000/api
```

---

## 🔑 Configuration

### Essential Environment Variables

#### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/school_erp_db

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=School ERP
VITE_APP_VERSION=1.0.0
```

### Optional Services

**Cloudinary (File Uploads):**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Email Service (Nodemailer):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**SMS Service (MSG91):**
```env
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id
```

---

## ▶️ Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/ folder
```

**Backend:**
```bash
cd backend
npm run build  # (if applicable)
npm start
```

---

## 🌐 Deployment

### Frontend - Vercel (Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Vercel auto-detects Vite setup
5. Deploy automatically

**Live:** https://school-j5764pmty-dhruv-trivedis-projects-930d3765.vercel.app

### Backend - Render.com (Free)

1. Push code to GitHub
2. Go to https://render.com
3. Create New Web Service
4. Select your GitHub repo (backend folder)
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables
7. Deploy

### Backend - Railway (Paid)

1. Go to https://railway.app
2. Create Project from GitHub
3. Add environment variables
4. Deploy

---

## 📁 Project Structure

```
school-erp/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, validation, error handling
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.js          # Sample data
│   ├── templates/           # Email templates
│   ├── utils/               # Helper functions
│   ├── .env.example         # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components (by role)
│   │   ├── components/      # Reusable components
│   │   ├── api/             # API layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Utilities
│   │   └── App.jsx
│   ├── .env.example         # Environment template
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind config
│   └── package.json
│
├── documentation/
│   ├── PROJECT_ANALYSIS_REPORT.md
│   ├── TECHNICAL_IMPLEMENTATION_CHECKLIST.md
│   ├── PROJECT_STATUS_SUMMARY.md
│   ├── SCHOOL_ERP_PRD.md
│   └── SUPABASE_*.md        # Supabase guides
│
├── .gitignore               # Git ignore rules
├── README.md                # This file
└── package.json
```

---

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login              # Login
POST /api/auth/refresh            # Refresh token
POST /api/auth/logout             # Logout
GET  /api/auth/me                 # Current user
```

### Students
```bash
GET    /api/students              # List students
POST   /api/students              # Create student
GET    /api/students/:id          # Get student
PUT    /api/students/:id          # Update student
DELETE /api/students/:id          # Delete student
```

### Fees
```bash
GET    /api/fees                  # List fees
POST   /api/fees                  # Create fee structure
GET    /api/fees/:id              # Get fee details
PUT    /api/fees/:id              # Update fee
```

### Attendance
```bash
GET    /api/attendance            # Get attendance
POST   /api/attendance            # Mark attendance
```

### More endpoints...
See [SCHOOL_ERP_PRD.md](SCHOOL_ERP_PRD.md) for complete API reference.

---

## 🔐 Default Credentials

⚠️ **These are for demo/development only. Change immediately in production:**

```
Email: admin@schoolerp.com
Password: Admin@123
```

---

## 🐛 Testing

### Login Flow
1. Go to https://school-j5764pmty-dhruv-trivedis-projects-930d3765.vercel.app (or localhost:5173)
2. Enter credentials above
3. Should redirect to admin dashboard
4. Explore the interface

### Current Status
- ✅ Frontend deployed to Vercel
- ⏳ Backend not yet deployed (login will fail)
- ✏️ Some modules partially complete
- 📊 Project is ~25% complete

See [PROJECT_STATUS_SUMMARY.md](PROJECT_STATUS_SUMMARY.md) for details.

---

## 📖 Documentation

- **[PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md)** - Comprehensive project analysis
- **[TECHNICAL_IMPLEMENTATION_CHECKLIST.md](TECHNICAL_IMPLEMENTATION_CHECKLIST.md)** - What's implemented and what's missing
- **[PROJECT_STATUS_SUMMARY.md](PROJECT_STATUS_SUMMARY.md)** - Current completion status
- **[SCHOOL_ERP_PRD.md](SCHOOL_ERP_PRD.md)** - Product requirements and specifications
- **[SUPABASE_*.md](SUPABASE_SETUP_SUMMARY.md)** - Supabase setup guides

---

## 🚀 Next Steps

### To Complete the MVP (2-3 weeks):

#### Week 1 - Backend Infrastructure
- [ ] Create services layer (Email, SMS, Files, PDF)
- [ ] Add middleware (Error handling, validation, logging)
- [ ] Complete authentication system
- [ ] Deploy backend to Render/Railway

#### Week 2 - Core Module
- [ ] Complete Student management APIs
- [ ] Implement file upload
- [ ] Build student management pages

#### Week 3 - Deployment
- [ ] Test complete flow
- [ ] Deploy and monitor
- [ ] Gather feedback

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Standards
- Use ES6+ syntax
- Follow existing code style
- Add comments for complex logic
- Test before submitting PR

---

## 🐛 Known Issues

- Bundle size is large (1.2MB gzipped) - needs code splitting
- Some pages are incomplete stubs
- Payment integration not yet implemented
- Real-time features (Socket.io) configured but not used
- Backend not deployed yet

See [TECHNICAL_IMPLEMENTATION_CHECKLIST.md](TECHNICAL_IMPLEMENTATION_CHECKLIST.md) for complete list.

---

## 🆘 Troubleshooting

### Login fails with "Cannot reach API"
- **Cause:** Backend not running or not deployed
- **Fix:** Deploy backend to Render/Railway or run locally on port 5000

### Build error: "Module not found"
- **Cause:** Missing dependencies
- **Fix:** Run `npm install` in both frontend and backend folders

### Database connection error
- **Cause:** DATABASE_URL not set or invalid
- **Fix:** Check `.env` file has correct Supabase URL

### Port already in use
- **Cause:** Another app using port 5000 (backend) or 5173 (frontend)
- **Fix:** Kill process or use different port

---

## 📊 Project Stats

- **Frontend Components:** 40+
- **Backend API Routes:** 15+
- **Database Models:** 25+
- **Lines of Code:** 15,000+
- **Tech Stack Components:** 25+
- **Project Completion:** ~25%
- **Estimated Effort to MVP:** 6-8 weeks

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Support

- 📧 **Email:** support@schoolerp.com
- 📱 **WhatsApp:** [Contact details]
- 💬 **Discord:** [Community link]
- 🐙 **GitHub Issues:** https://github.com/YOUR-USERNAME/school-erp/issues

---

## 🙏 Acknowledgments

- Built with React, Express, and Prisma
- Hosted on Vercel (frontend) and Render/Railway (backend)
- Database powered by Supabase
- UI components from shadcn/ui
- Icons from Lucide React

---

## 🗺️ Roadmap

### Phase 1: MVP (Current - 8 weeks)
- Complete core modules
- Basic security implementation
- Single institution support

### Phase 2: Advanced (Weeks 9-16)
- Multi-tenant improvements
- Advanced reporting
- Mobile app integration

### Phase 3: Enterprise (Weeks 17+)
- Custom workflows
- API marketplace
- White-label support

---

**Last Updated:** February 20, 2026  
**Status:** 🟡 In Development  
**Version:** 0.1.0 Beta

---

**Ready to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Questions?** Check the [FAQ](FAQ.md) or open an issue on GitHub.
