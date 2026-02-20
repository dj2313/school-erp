# 🏫 School / College ERP System — Product Requirements Document (PRD)
> **Version:** 1.0 | **Stack:** React.js + Node.js (Express) + PostgreSQL/MySQL | **Target IDEs:** Cursor, Windsurf, VS Code + Copilot

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Setup (PostgreSQL & MySQL)](#3-database-setup)
4. [System Architecture](#4-system-architecture)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Portal: SuperAdmin](#8-portal-superadmin)
9. [Portal: Institute Admin](#9-portal-institute-admin)
10. [Portal: Teacher](#10-portal-teacher)
11. [Portal: Accountant](#11-portal-accountant)
12. [Portal: HR Manager](#12-portal-hr-manager)
13. [Portal: Receptionist](#13-portal-receptionist)
14. [Authentication System](#14-authentication-system)
15. [Notifications System](#15-notifications-system)
16. [File Management](#16-file-management)
17. [React Frontend Structure](#17-react-frontend-structure)
18. [Environment Variables](#18-environment-variables)
19. [Development Phases](#19-development-phases)

---

## 1. Project Overview

Build a **multi-tenant School/College ERP Web Application** with the following portals:
- SuperAdmin (manages all institutes on the platform)
- Institute Admin (manages one specific school/college)
- Teacher (attendance, assignments, exams, marks)
- Accountant (fees, payments, reports)
- HR Manager (staff, payroll, leave)
- Receptionist (admissions, gate management)

**Out of scope for web (handled via mobile app):** Student Portal, Parent Portal

---

## 2. Tech Stack

### Frontend
```
Framework     : React.js (Vite)
Routing       : React Router v6
State Mgmt    : Zustand (global) + TanStack Query (server state)
UI Library    : shadcn/ui + Tailwind CSS
Forms         : React Hook Form + Zod (validation)
Tables        : TanStack Table v8
Charts        : Recharts
HTTP Client   : Axios (with interceptors)
PDF Gen       : @react-pdf/renderer OR jsPDF
Date Handling : date-fns
Icons         : Lucide React
Notifications : React Hot Toast
Modals        : Headless UI
```

### Backend
```
Runtime       : Node.js v18+
Framework     : Express.js
ORM           : Prisma ORM (works with both PostgreSQL & MySQL)
Auth          : JWT (access token 15min) + Refresh Token (7 days, httpOnly cookie)
Password Hash : bcryptjs
Validation    : Zod or Joi
File Upload   : Multer + Cloudinary (or AWS S3)
Email         : Nodemailer (SMTP)
SMS           : MSG91 / Fast2SMS API
Queue         : Bull (Redis-based, for background jobs)
Excel Import  : xlsx (npm package)
PDF Server    : Puppeteer (server-side PDF)
Real-time     : Socket.io
```

### Database
```
Primary DB    : PostgreSQL 15+ OR MySQL 8+
ORM           : Prisma (schema-first, auto migrations)
Caching       : Redis (sessions, OTP, queue)
File Storage  : Cloudinary (free tier) or AWS S3
```

### DevOps
```
Frontend Host : Vercel / Netlify
Backend Host  : Railway / Render / DigitalOcean
DB Host       : Supabase (PostgreSQL) OR PlanetScale (MySQL) OR Neon (PostgreSQL)
```

---

## 3. Database Setup

### Option A: PostgreSQL Setup

#### Install PostgreSQL (Ubuntu/Mac/Windows)
```bash
# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql

# Mac (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Windows: Download installer from https://www.postgresql.org/download/windows/
```

#### Create Database
```sql
-- Inside psql shell
CREATE USER erp_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE school_erp_db OWNER erp_user;
GRANT ALL PRIVILEGES ON DATABASE school_erp_db TO erp_user;
\q
```

#### Prisma Setup for PostgreSQL
```bash
npm install prisma @prisma/client
npx prisma init
```

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

In `.env`:
```
DATABASE_URL="postgresql://erp_user:your_strong_password@localhost:5432/school_erp_db"
```

#### Cloud PostgreSQL (Supabase - Free)
```
1. Go to https://supabase.com
2. New Project → set password
3. Settings → Database → Copy Connection String
4. Paste into DATABASE_URL in .env
```

---

### Option B: MySQL Setup

#### Install MySQL
```bash
# Ubuntu
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql -u root -p

# Mac
brew install mysql
brew services start mysql

# Windows: Download MySQL Installer from https://dev.mysql.com/downloads/installer/
```

#### Create Database
```sql
-- Inside mysql shell
CREATE DATABASE school_erp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON school_erp_db.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Prisma Setup for MySQL
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

In `.env`:
```
DATABASE_URL="mysql://erp_user:your_strong_password@localhost:3306/school_erp_db"
```

#### Cloud MySQL (PlanetScale - Free)
```
1. Go to https://planetscale.com
2. Create database → Get connection string
3. Paste into DATABASE_URL
NOTE: PlanetScale doesn't support foreign keys directly — use @relation but disable FK enforcement
```

---

### Prisma Commands (Common)
```bash
# Generate client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Push schema without migration (dev only)
npx prisma db push

# Open Prisma Studio (GUI for DB)
npx prisma studio

# Seed the database
npx prisma db seed

# Reset DB (drops everything)
npx prisma migrate reset
```

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                  │
│   SuperAdmin  │  Admin  │  Teacher  │  Accountant  │ HR │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS (REST API)
┌───────────────────────────▼─────────────────────────────┐
│               BACKEND (Express.js / Node.js)            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Auth MW     │  │ Role Guard   │  │ Tenant Guard   │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │            REST API Routes                        │   │
│  │  /auth  /students  /staff  /fees  /attendance    │   │
│  │  /exams  /reports  /notifications  /settings     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────┐   ┌──────────────────────────┐    │
│  │  Prisma ORM      │   │   Bull Queue (Redis)      │    │
│  └────────┬─────────┘   └──────────────────────────┘    │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│         PostgreSQL / MySQL Database                     │
└─────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Strategy
Every request includes `institution_id`. Data is isolated by institution using a **shared database, shared schema** model — all tables have an `institution_id` foreign key.

---

## 5. User Roles & Permissions

| Role | Code | Access Level |
|---|---|---|
| Super Admin | `SUPERADMIN` | All institutions, platform config |
| Institute Admin | `ADMIN` | Full access to one institution |
| Teacher | `TEACHER` | Classes assigned to them |
| Accountant | `ACCOUNTANT` | Fees, finance, reports |
| HR Manager | `HR` | Staff, payroll, leave |
| Receptionist | `RECEPTIONIST` | Admission, gate, inquiry |
| Librarian | `LIBRARIAN` | Library module only |
| Transport Manager | `TRANSPORT` | Transport module only |

### Permission Matrix (Key Modules)

| Module | SUPERADMIN | ADMIN | TEACHER | ACCOUNTANT | HR |
|---|---|---|---|---|---|
| Add Institution | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add Student | ✅ | ✅ | ❌ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| Collect Fees | ✅ | ✅ | ❌ | ✅ | ❌ |
| Add Staff | ✅ | ✅ | ❌ | ❌ | ✅ |
| Process Payroll | ✅ | ✅ | ❌ | ✅ | ✅ |
| View Reports | ✅ | ✅ | Limited | Limited | Limited |

---

## 6. Database Schema

### Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// INSTITUTIONS (Multi-tenant root)
// ─────────────────────────────────────────
model Institution {
  id            Int       @id @default(autoincrement())
  name          String
  code          String    @unique
  address       String?
  city          String?
  state         String?
  phone         String?
  email         String?
  logo_url      String?
  website       String?
  type          String    @default("school") // school | college | coaching
  is_active     Boolean   @default(true)
  subscription  String    @default("basic") // basic | pro | enterprise
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  users         User[]
  students      Student[]
  staff         Staff[]
  classes       Class[]
  fee_structures FeeStructure[]
  fee_invoices  FeeInvoice[]
  attendance    Attendance[]
  exams         Exam[]
  notifications Notification[]
  academic_years AcademicYear[]
}

// ─────────────────────────────────────────
// USERS (All portal users)
// ─────────────────────────────────────────
model User {
  id              Int       @id @default(autoincrement())
  institution_id  Int?      // null = SuperAdmin
  name            String
  email           String    @unique
  phone           String?
  password_hash   String
  role            Role      @default(TEACHER)
  avatar_url      String?
  is_active       Boolean   @default(true)
  last_login      DateTime?
  refresh_token   String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  institution     Institution? @relation(fields: [institution_id], references: [id])
  staff           Staff?

  @@index([institution_id])
}

enum Role {
  SUPERADMIN
  ADMIN
  TEACHER
  ACCOUNTANT
  HR
  RECEPTIONIST
  LIBRARIAN
  TRANSPORT
}

// ─────────────────────────────────────────
// ACADEMIC YEAR
// ─────────────────────────────────────────
model AcademicYear {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  name            String    // e.g., "2024-25"
  start_date      DateTime
  end_date        DateTime
  is_current      Boolean   @default(false)

  institution     Institution @relation(fields: [institution_id], references: [id])
  classes         Class[]
  fee_invoices    FeeInvoice[]
  exams           Exam[]
}

// ─────────────────────────────────────────
// CLASSES & SECTIONS
// ─────────────────────────────────────────
model Class {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  academic_year_id Int
  name            String    // "Class 10", "Sem 1"
  section         String?   // "A", "B", "C"
  capacity        Int       @default(40)

  institution     Institution  @relation(fields: [institution_id], references: [id])
  academic_year   AcademicYear @relation(fields: [academic_year_id], references: [id])
  students        Student[]
  teacher_assignments TeacherAssignment[]
  subjects        ClassSubject[]
  timetable       Timetable[]
  attendance      Attendance[]

  @@index([institution_id])
}

// ─────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────
model Student {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  class_id        Int?
  admission_no    String    @unique
  roll_no         String?
  first_name      String
  last_name       String
  dob             DateTime?
  gender          String?
  blood_group     String?
  photo_url       String?
  address         String?
  phone           String?
  email           String?

  // Parent/Guardian Info
  father_name     String?
  father_phone    String?
  father_email    String?
  mother_name     String?
  mother_phone    String?
  guardian_name   String?
  guardian_phone  String?

  // Academic
  admission_date  DateTime  @default(now())
  is_active       Boolean   @default(true)
  category        String?   // General / OBC / SC / ST

  institution     Institution @relation(fields: [institution_id], references: [id])
  class           Class?      @relation(fields: [class_id], references: [id])
  attendance      Attendance[]
  fee_invoices    FeeInvoice[]
  exam_results    ExamResult[]
  documents       Document[]

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@index([institution_id])
  @@index([admission_no])
}

// ─────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────
model Staff {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  user_id         Int       @unique
  employee_code   String    @unique
  first_name      String
  last_name       String
  dob             DateTime?
  gender          String?
  phone           String
  email           String
  designation     String
  department      String?
  qualification   String?
  joining_date    DateTime
  salary          Float
  bank_account    String?
  bank_ifsc       String?
  address         String?
  photo_url       String?
  is_active       Boolean   @default(true)

  institution     Institution @relation(fields: [institution_id], references: [id])
  user            User        @relation(fields: [user_id], references: [id])
  attendance      StaffAttendance[]
  leaves          Leave[]
  payslips        Payslip[]
  teacher_assignments TeacherAssignment[]

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
}

// ─────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────
model Subject {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  name            String
  code            String
  type            String    @default("theory") // theory | practical | language

  class_subjects  ClassSubject[]
  timetable       Timetable[]
}

model ClassSubject {
  id          Int     @id @default(autoincrement())
  class_id    Int
  subject_id  Int
  class       Class   @relation(fields: [class_id], references: [id])
  subject     Subject @relation(fields: [subject_id], references: [id])
}

// Teacher assigned to class-subject
model TeacherAssignment {
  id          Int     @id @default(autoincrement())
  class_id    Int
  staff_id    Int
  subject_id  Int
  class       Class   @relation(fields: [class_id], references: [id])
  staff       Staff   @relation(fields: [staff_id], references: [id])
}

// ─────────────────────────────────────────
// ATTENDANCE (Students)
// ─────────────────────────────────────────
model Attendance {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  class_id        Int
  student_id      Int
  date            DateTime  @db.Date
  status          AttendanceStatus @default(PRESENT)
  marked_by       Int?      // staff_id
  remarks         String?

  institution     Institution @relation(fields: [institution_id], references: [id])
  class           Class       @relation(fields: [class_id], references: [id])
  student         Student     @relation(fields: [student_id], references: [id])

  @@unique([student_id, date])
  @@index([class_id, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  HOLIDAY
  LEAVE
}

// ─────────────────────────────────────────
// STAFF ATTENDANCE
// ─────────────────────────────────────────
model StaffAttendance {
  id          Int       @id @default(autoincrement())
  staff_id    Int
  date        DateTime  @db.Date
  punch_in    DateTime?
  punch_out   DateTime?
  status      AttendanceStatus @default(PRESENT)
  remarks     String?

  staff       Staff     @relation(fields: [staff_id], references: [id])
  @@unique([staff_id, date])
}

// ─────────────────────────────────────────
// FEE STRUCTURES
// ─────────────────────────────────────────
model FeeStructure {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  name            String    // "Annual Fee 2024-25"
  class_id        Int?
  academic_year   String
  total_amount    Float
  components      Json      // [{name: "Tuition", amount: 5000}, {name: "Library", amount: 500}]
  due_day         Int?      // day of month fees are due
  late_fee_per_day Float    @default(0)
  is_active       Boolean   @default(true)

  institution     Institution @relation(fields: [institution_id], references: [id])
  invoices        FeeInvoice[]
}

// ─────────────────────────────────────────
// FEE INVOICES (Per student per term)
// ─────────────────────────────────────────
model FeeInvoice {
  id                Int       @id @default(autoincrement())
  institution_id    Int
  student_id        Int
  fee_structure_id  Int
  academic_year_id  Int
  invoice_no        String    @unique
  amount            Float     // base amount
  concession        Float     @default(0)
  late_fee          Float     @default(0)
  total_amount      Float     // amount - concession + late_fee
  paid_amount       Float     @default(0)
  balance           Float
  due_date          DateTime
  status            FeeStatus @default(UNPAID)

  institution       Institution  @relation(fields: [institution_id], references: [id])
  student           Student      @relation(fields: [student_id], references: [id])
  fee_structure     FeeStructure @relation(fields: [fee_structure_id], references: [id])
  academic_year     AcademicYear @relation(fields: [academic_year_id], references: [id])
  payments          FeePayment[]

  created_at        DateTime  @default(now())
}

enum FeeStatus {
  UNPAID
  PARTIAL
  PAID
  OVERDUE
  WAIVED
}

// ─────────────────────────────────────────
// FEE PAYMENTS (Each transaction)
// ─────────────────────────────────────────
model FeePayment {
  id              Int       @id @default(autoincrement())
  invoice_id      Int
  receipt_no      String    @unique
  amount          Float
  payment_mode    PaymentMode @default(CASH)
  transaction_id  String?   // for online payments
  cheque_no       String?
  bank_name       String?
  payment_date    DateTime  @default(now())
  collected_by    Int?      // staff_id
  notes           String?

  invoice         FeeInvoice @relation(fields: [invoice_id], references: [id])
}

enum PaymentMode {
  CASH
  CHEQUE
  ONLINE
  BANK_TRANSFER
  UPI
  DEMAND_DRAFT
}

// ─────────────────────────────────────────
// EXAMS & RESULTS
// ─────────────────────────────────────────
model Exam {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  academic_year_id Int
  name            String    // "Unit Test 1", "Half Yearly"
  start_date      DateTime
  end_date        DateTime
  type            String    @default("written") // written | online | practical

  institution     Institution  @relation(fields: [institution_id], references: [id])
  academic_year   AcademicYear @relation(fields: [academic_year_id], references: [id])
  results         ExamResult[]
}

model ExamResult {
  id              Int       @id @default(autoincrement())
  exam_id         Int
  student_id      Int
  subject_id      Int
  max_marks       Float
  obtained_marks  Float
  grade           String?
  remarks         String?

  exam            Exam    @relation(fields: [exam_id], references: [id])
  student         Student @relation(fields: [student_id], references: [id])
}

// ─────────────────────────────────────────
// LEAVE MANAGEMENT (Staff)
// ─────────────────────────────────────────
model Leave {
  id              Int       @id @default(autoincrement())
  staff_id        Int
  leave_type      String    // Casual | Medical | Earned | Maternity
  from_date       DateTime
  to_date         DateTime
  total_days      Float
  reason          String
  status          LeaveStatus @default(PENDING)
  approved_by     Int?
  approved_at     DateTime?
  remarks         String?
  created_at      DateTime  @default(now())

  staff           Staff     @relation(fields: [staff_id], references: [id])
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

// ─────────────────────────────────────────
// PAYROLL
// ─────────────────────────────────────────
model Payslip {
  id              Int       @id @default(autoincrement())
  staff_id        Int
  month           Int
  year            Int
  basic_salary    Float
  allowances      Json      // [{name: "HRA", amount: 2000}]
  deductions      Json      // [{name: "PF", amount: 1800}, {name: "TDS", amount: 500}]
  gross_salary    Float
  net_salary      Float
  working_days    Int
  present_days    Int
  leaves_taken    Int
  payment_date    DateTime?
  payment_mode    String    @default("bank_transfer")
  is_paid         Boolean   @default(false)

  staff           Staff     @relation(fields: [staff_id], references: [id])

  @@unique([staff_id, month, year])
}

// ─────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────
model Timetable {
  id          Int     @id @default(autoincrement())
  class_id    Int
  subject_id  Int
  staff_id    Int?
  day         Int     // 0=Mon, 1=Tue, ... 5=Sat
  period_no   Int
  start_time  String  // "09:00"
  end_time    String  // "09:45"

  class       Class   @relation(fields: [class_id], references: [id])
  subject     Subject @relation(fields: [subject_id], references: [id])
}

// ─────────────────────────────────────────
// NOTICES & ANNOUNCEMENTS
// ─────────────────────────────────────────
model Notice {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  title           String
  content         String    @db.Text
  target_roles    Json      // ["TEACHER", "STUDENT"]
  class_ids       Json?     // specific classes, null = all
  is_published    Boolean   @default(false)
  publish_date    DateTime  @default(now())
  expiry_date     DateTime?
  created_by      Int
  created_at      DateTime  @default(now())
}

// ─────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────
model Document {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  student_id      Int?
  staff_id        Int?
  name            String
  type            String    // aadhaar | certificate | marksheet | etc.
  file_url        String
  uploaded_by     Int
  created_at      DateTime  @default(now())

  student         Student?  @relation(fields: [student_id], references: [id])
}

// ─────────────────────────────────────────
// NOTIFICATIONS LOG
// ─────────────────────────────────────────
model Notification {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  type            String    // sms | whatsapp | email | push
  recipient       String    // phone or email
  message         String    @db.Text
  status          String    @default("pending") // pending | sent | failed
  sent_at         DateTime?
  created_at      DateTime  @default(now())

  institution     Institution @relation(fields: [institution_id], references: [id])
}

// ─────────────────────────────────────────
// ADMISSION INQUIRY
// ─────────────────────────────────────────
model Inquiry {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  student_name    String
  parent_name     String
  phone           String
  email           String?
  class_interested String?
  source          String?   // walk-in | website | referral
  status          String    @default("new") // new | followup | admitted | rejected
  notes           String?
  assigned_to     Int?
  created_at      DateTime  @default(now())
}

// ─────────────────────────────────────────
// HOSTEL
// ─────────────────────────────────────────
model HostelRoom {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  room_no         String
  floor           String?
  capacity        Int
  type            String    // single | double | dormitory
  monthly_fee     Float

  allocations     HostelAllocation[]
}

model HostelAllocation {
  id              Int       @id @default(autoincrement())
  room_id         Int
  student_id      Int
  from_date       DateTime
  to_date         DateTime?
  is_active       Boolean   @default(true)

  room            HostelRoom @relation(fields: [room_id], references: [id])
}

// ─────────────────────────────────────────
// TRANSPORT
// ─────────────────────────────────────────
model Vehicle {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  vehicle_no      String    @unique
  model           String?
  capacity        Int
  driver_name     String?
  driver_phone    String?
  route_id        Int?

  route           TransportRoute? @relation(fields: [route_id], references: [id])
}

model TransportRoute {
  id              Int       @id @default(autoincrement())
  institution_id  Int
  name            String    // "Route A - North"
  stops           Json      // [{name: "Bus Stand", time: "07:30", fee: 800}]

  vehicles        Vehicle[]
  student_transport StudentTransport[]
}

model StudentTransport {
  id              Int       @id @default(autoincrement())
  student_id      Int
  route_id        Int
  stop_name       String
  monthly_fee     Float

  route           TransportRoute @relation(fields: [route_id], references: [id])
}
```

---

## 7. API Endpoints

### Auth Routes
```
POST   /api/auth/login              # Email + password login
POST   /api/auth/refresh            # Refresh JWT token
POST   /api/auth/logout             # Invalidate refresh token
POST   /api/auth/forgot-password    # Send reset email
POST   /api/auth/reset-password     # Reset with token
GET    /api/auth/me                 # Get current user profile
PUT    /api/auth/change-password    # Change password
```

### SuperAdmin Routes
```
GET    /api/superadmin/dashboard            # Platform stats
GET    /api/superadmin/institutions         # List all institutions
POST   /api/superadmin/institutions         # Create institution
PUT    /api/superadmin/institutions/:id     # Update institution
DELETE /api/superadmin/institutions/:id     # Delete institution
POST   /api/superadmin/institutions/:id/admin  # Assign admin user
GET    /api/superadmin/subscriptions        # Subscription management
GET    /api/superadmin/logs                 # System audit logs
```

### Institution/Admin Routes
```
GET    /api/admin/dashboard                 # Institution stats
GET    /api/admin/settings                  # Institution settings
PUT    /api/admin/settings                  # Update settings

# Students
GET    /api/students                        # List students (with filters)
POST   /api/students                        # Add student
GET    /api/students/:id                    # Student profile
PUT    /api/students/:id                    # Update student
DELETE /api/students/:id                    # Soft delete student
POST   /api/students/bulk-import            # CSV import
GET    /api/students/:id/attendance         # Student attendance history
GET    /api/students/:id/fees               # Student fee history
GET    /api/students/:id/results            # Student exam results

# Classes
GET    /api/classes                         # List classes
POST   /api/classes                         # Create class
PUT    /api/classes/:id                     # Update class
DELETE /api/classes/:id                     # Delete class
GET    /api/classes/:id/students            # Students in class
GET    /api/classes/:id/timetable           # Class timetable

# Attendance
GET    /api/attendance?class_id=&date=      # Get attendance
POST   /api/attendance                      # Mark attendance (bulk)
PUT    /api/attendance/:id                  # Update single record
GET    /api/attendance/report?month=&year=  # Attendance report

# Fees
GET    /api/fees/structures                 # List fee structures
POST   /api/fees/structures                 # Create fee structure
GET    /api/fees/invoices                   # List invoices
POST   /api/fees/invoices                   # Create invoice
POST   /api/fees/invoices/generate-bulk     # Generate for all students
GET    /api/fees/invoices/:id               # Invoice details
POST   /api/fees/collect                    # Collect payment
GET    /api/fees/receipt/:payment_id        # Download receipt PDF
GET    /api/fees/pending                    # Pending dues list
GET    /api/fees/report                     # Finance report

# Staff
GET    /api/staff                           # List staff
POST   /api/staff                           # Add staff
GET    /api/staff/:id                       # Staff profile
PUT    /api/staff/:id                       # Update staff
GET    /api/staff/:id/attendance            # Attendance history

# Staff Attendance
GET    /api/staff-attendance?date=          # Get staff attendance
POST   /api/staff-attendance                # Mark staff attendance

# Leave
GET    /api/leaves                          # List leave requests
POST   /api/leaves                          # Apply leave
PUT    /api/leaves/:id/approve              # Approve/reject leave

# Payroll
GET    /api/payroll?month=&year=            # List payslips
POST   /api/payroll/generate               # Generate monthly payroll
GET    /api/payroll/:id                     # Payslip details
GET    /api/payroll/:id/download           # Download payslip PDF

# Exams
GET    /api/exams                           # List exams
POST   /api/exams                           # Create exam
POST   /api/exams/:id/results              # Enter results (bulk)
GET    /api/exams/:id/results              # View results
GET    /api/exams/:id/report               # Generate report card

# Notices
GET    /api/notices                         # List notices
POST   /api/notices                         # Create notice
PUT    /api/notices/:id                     # Update notice
DELETE /api/notices/:id                     # Delete notice

# Subjects & Timetable
GET    /api/subjects                        # List subjects
POST   /api/subjects                        # Add subject
POST   /api/timetable                       # Set timetable

# Reports
GET    /api/reports/attendance-summary      # Monthly attendance summary
GET    /api/reports/fee-collection          # Fee collection report
GET    /api/reports/student-strength        # Class-wise strength
GET    /api/reports/staff-payroll           # Payroll summary

# Documents
POST   /api/documents/upload               # Upload document
GET    /api/documents/:entity/:id          # Get documents
```

---

## 8. Portal: SuperAdmin

### Pages & Components

#### Dashboard (`/superadmin/dashboard`)
```
Components:
  - StatCard: Total Institutions, Total Students (all), Revenue, Active Users
  - InstitutionGrowthChart: Monthly new institutions (Line chart)
  - RevenueChart: Monthly revenue (Bar chart)
  - RecentInstitutions: Last 10 added institutions table
  - ActiveSubscriptions: Pie chart (basic/pro/enterprise)
```

#### Institutions (`/superadmin/institutions`)
```
Components:
  - InstitutionTable: Columns [Name, Code, City, Type, Subscription, Status, Actions]
    - Filters: by type, state, subscription, status
    - Search by name/code
    - Pagination
  - AddInstitutionModal: Form to create new institution
  - InstitutionDetailDrawer: View/edit full details
  - AssignAdminModal: Create admin user for institution

State/API:
  GET /api/superadmin/institutions?page=&search=&type=&status=
  POST /api/superadmin/institutions
  PUT /api/superadmin/institutions/:id
  POST /api/superadmin/institutions/:id/admin
```

#### Subscriptions (`/superadmin/subscriptions`)
```
Components:
  - SubscriptionPlanCards: Define plan features
  - InstitutionSubscriptionTable: Institution + plan + expiry
  - RenewModal: Extend subscription
```

#### Settings (`/superadmin/settings`)
```
  - SMS Provider Config (API key, sender ID)
  - WhatsApp Config
  - Email SMTP Config
  - Payment Gateway Config
  - Global Announcement
```

---

## 9. Portal: Institute Admin

### Pages & Components

#### Dashboard (`/admin/dashboard`)
```
Stats Row:
  - Total Students | Total Staff | Today's Student Attendance % | Fee Collection Today

Charts:
  - Student Attendance (last 30 days line chart)
  - Fee Collection (this month vs last month bar chart)
  - Gender Ratio (pie chart)

Quick Actions:
  - Mark Attendance | Collect Fee | Add Student | Add Notice

Recent Activity:
  - Recent fee payments table
  - Recent admissions table
```

#### Student Management (`/admin/students`)
```
StudentListPage:
  - SearchBar (by name, admission no)
  - Filters (class, section, status, category)
  - DataTable with columns: [Photo, Name, Admission No, Class, Parent Phone, Status, Actions]
  - BulkActions: [Export CSV, Send SMS, Delete]
  - AddStudentButton → AddStudentModal/Page

StudentDetailPage (`/admin/students/:id`):
  Tabs:
    1. Profile — personal info, edit
    2. Attendance — month-wise calendar heatmap
    3. Fees — invoice list, payment history
    4. Exam Results — subject-wise marks table
    5. Documents — uploaded files
    6. Timeline — activity log

AddStudentPage (`/admin/students/new`):
  Multi-step form:
    Step 1: Personal Info (name, dob, gender, photo upload)
    Step 2: Parent/Guardian Info
    Step 3: Class Assignment + Roll No
    Step 4: Document Upload (optional)
    Step 5: Review & Submit
```

#### Attendance (`/admin/attendance`)
```
AttendanceMarkingPage:
  - Select Class dropdown
  - Select Date (default: today)
  - Student list with Present/Absent/Late toggle buttons
  - Bulk Mark All Present button
  - Submit → POST /api/attendance
  - Auto SMS to absent parents on submit

AttendanceReportPage:
  - Month + Year selector
  - Class filter
  - Table: Student | Total Days | Present | Absent | %
  - Export to Excel
  - Per-student detail drill-down
```

#### Fee Management (`/admin/fees`)
```
FeeOverviewPage:
  Stats: Total Collected | Total Pending | Overdue Students | Today's Collection

FeeStructurePage (`/admin/fees/structures`):
  - List fee structures per class
  - Form: Name, Class, Components (dynamic add/remove), Due Day, Late Fee

FeeInvoicesPage (`/admin/fees/invoices`):
  - Table: Student | Class | Invoice No | Amount | Paid | Balance | Due Date | Status
  - Filters: status (paid/unpaid/overdue), class, month
  - BulkGenerate: generate invoices for all students of a class

FeeCollectionPage (`/admin/fees/collect`):
  - Search student by name/admission no
  - Show pending invoices with amounts
  - Payment form: Amount, Mode, Transaction ID/Cheque no
  - Generate & print receipt on success

FeeReportPage:
  - Daily / Monthly collection summary
  - Pending dues report
  - Export to Excel/PDF
```

#### Timetable (`/admin/timetable`)
```
TimetablePage:
  - Class selector
  - 6-day × 8-period grid (drag and drop or dropdown)
  - Each cell: Subject + Teacher
  - Save → POST /api/timetable (replaces entire class timetable)
```

#### Exam & Results (`/admin/exams`)
```
ExamListPage:
  - Create exam (name, dates, type)
  - Assign to class

ResultEntryPage:
  - Select Exam + Class + Subject
  - Table: Student | Max Marks | Obtained | Grade
  - Bulk entry (inline editable table)

ReportCardPage:
  - Select Student + Exam
  - Preview report card (styled PDF template)
  - Download PDF
```

---

## 10. Portal: Teacher

### Pages

#### My Dashboard (`/teacher/dashboard`)
```
- Today's timetable (period-wise)
- Quick attendance marking shortcut
- Pending homework to review
- Upcoming exams
```

#### Attendance (`/teacher/attendance`)
```
- Select from my assigned classes
- Date defaults to today
- Same marking UI as admin
- Submit → notification to absent parents
```

#### My Classes (`/teacher/classes`)
```
- List of classes assigned
- Click → class detail: student list, attendance history, timetable
```

#### Homework (`/teacher/homework`)
```
- Create homework: Class, Subject, Description, Due Date, Attachment
- List submitted homework per student
```

#### Study Material (`/teacher/materials`)
```
- Upload PDF/Video for a class+subject
- Students can view via mobile app
```

#### Marks Entry (`/teacher/marks`)
```
- Assigned exams list
- Inline marks entry per subject
```

---

## 11. Portal: Accountant

### Pages

#### Dashboard (`/accountant/dashboard`)
```
- Today's collection amount
- Pending dues count
- Overdue students list (quick action: send reminder)
- Monthly collection bar chart
```

#### Collect Fee (`/accountant/collect`)
```
- Same as admin fee collection UI
```

#### Pending Dues (`/accountant/pending`)
```
- Table: Student | Class | Invoice | Balance | Days Overdue
- Select multiple → Send SMS reminder
- Apply late fee button
```

#### Fee Reports (`/accountant/reports`)
```
- Date-range based reports
- Class-wise collection
- Mode-wise (cash/online/cheque)
- Export to Excel
```

#### Expense (`/accountant/expense`)
```
- Log expenses with category and receipt upload
- Monthly expense report
```

---

## 12. Portal: HR Manager

### Pages

#### Staff List (`/hr/staff`)
```
- Table with all staff
- Add/Edit staff
- View profile, documents
```

#### Attendance (`/hr/attendance`)
```
- Daily attendance for all staff
- Monthly report
- Leave balance per staff
```

#### Leave Management (`/hr/leave`)
```
- Pending leave requests list
- Approve / Reject with remarks
- Leave balance summary per staff
```

#### Payroll (`/hr/payroll`)
```
PayrollGeneratePage:
  - Select Month + Year
  - Auto-calculate based on attendance: (salary / working_days) × present_days
  - Manual override allowed
  - Preview → Approve → Mark as Paid

PayslipPage:
  - View/download individual payslip PDF
  - Includes: Basic + Allowances − Deductions = Net
```

---

## 13. Portal: Receptionist

### Pages

#### Admission Inquiry (`/reception/inquiries`)
```
- Log new inquiry: student name, parent phone, class interested, source
- Status update: follow-up → admitted / rejected
- Convert to student: pre-fill student form from inquiry
```

#### Gate Management (`/reception/gate`)
```
- Log visitor: name, phone, purpose, whom to meet
- Issue gate pass
- Log student exit/entry (for early departure)
```

---

## 14. Authentication System

### Backend Implementation

#### File: `middleware/auth.middleware.js`
```javascript
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, institution_id: true, is_active: true }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

#### File: `controllers/auth.controller.js`
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.is_active) return res.status(403).json({ message: 'Account is disabled' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refresh_token: refreshToken,
        last_login: new Date()
      }
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, refresh_token: token }
    });

    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
```

### Frontend Auth (React)

#### File: `src/store/authStore.js` (Zustand)
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(persist(
  (set) => ({
    user: null,
    accessToken: null,
    setAuth: (user, accessToken) => set({ user, accessToken }),
    logout: () => set({ user: null, accessToken: null }),
  }),
  { name: 'auth-storage' }
));

export default useAuthStore;
```

#### File: `src/api/axios.js`
```javascript
import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) return Promise.reject(error);
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true });
        useAuthStore.getState().setAuth(useAuthStore.getState().user, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### File: `src/routes/ProtectedRoute.jsx`
```jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
```

---

## 15. Notifications System

### SMS Integration (MSG91)
```javascript
// services/sms.service.js
const axios = require('axios');

exports.sendSMS = async (phone, message) => {
  try {
    await axios.post('https://api.msg91.com/api/v5/flow/', {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: '0',
      mobiles: `91${phone}`,
      var1: message,
    }, {
      headers: { authkey: process.env.MSG91_AUTH_KEY }
    });
  } catch (err) {
    console.error('SMS failed:', err.message);
  }
};

// Auto SMS on absence
exports.sendAbsenceAlert = async (student, date) => {
  const msg = `Dear Parent, ${student.first_name} was absent on ${date}. Contact school for details.`;
  await exports.sendSMS(student.father_phone || student.guardian_phone, msg);
};
```

---

## 16. File Management

### Upload Setup (Multer + Cloudinary)
```bash
npm install multer cloudinary multer-storage-cloudinary
```

```javascript
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'school-erp', allowed_formats: ['jpg', 'png', 'pdf'] },
});

module.exports = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
```

---

## 17. React Frontend Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js
│   │   ├── auth.api.js
│   │   ├── students.api.js
│   │   ├── fees.api.js
│   │   ├── attendance.api.js
│   │   ├── staff.api.js
│   │   ├── exams.api.js
│   │   └── reports.api.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── DataTable.jsx       # TanStack Table wrapper
│   │   │   ├── Modal.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── charts/
│   │   │   ├── LineChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   └── PieChart.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       # Sidebar + Header + Content
│   │   │   ├── Sidebar.jsx         # Role-based menu items
│   │   │   ├── Header.jsx          # User avatar, notifications
│   │   │   └── MobileNav.jsx
│   │   └── forms/
│   │       ├── StudentForm.jsx
│   │       ├── StaffForm.jsx
│   │       └── FeeForm.jsx
│   ├── hooks/
│   │   ├── useStudents.js          # TanStack Query hooks
│   │   ├── useAttendance.js
│   │   ├── useFees.js
│   │   └── useStaff.js
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── superadmin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Institutions.jsx
│   │   │   └── Settings.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── students/
│   │   │   │   ├── StudentList.jsx
│   │   │   │   ├── StudentDetail.jsx
│   │   │   │   └── AddStudent.jsx
│   │   │   ├── attendance/
│   │   │   │   ├── MarkAttendance.jsx
│   │   │   │   └── AttendanceReport.jsx
│   │   │   ├── fees/
│   │   │   │   ├── FeeOverview.jsx
│   │   │   │   ├── FeeStructure.jsx
│   │   │   │   ├── FeeInvoices.jsx
│   │   │   │   ├── CollectFee.jsx
│   │   │   │   └── FeeReport.jsx
│   │   │   ├── staff/
│   │   │   ├── exams/
│   │   │   ├── timetable/
│   │   │   └── notices/
│   │   ├── teacher/
│   │   ├── accountant/
│   │   ├── hr/
│   │   └── reception/
│   ├── routes/
│   │   ├── index.jsx               # All routes
│   │   └── ProtectedRoute.jsx
│   ├── store/
│   │   ├── authStore.js            # Zustand
│   │   └── uiStore.js              # sidebar open/close etc.
│   ├── utils/
│   │   ├── formatters.js           # date, currency formatters
│   │   ├── validators.js           # Zod schemas
│   │   ├── pdfGenerator.js         # Receipt / report card PDF
│   │   └── excelExport.js          # Export to Excel
│   ├── App.jsx
│   └── main.jsx
├── .env
├── vite.config.js
└── tailwind.config.js
```

### Sidebar Menu Config (Role-Based)
```javascript
// src/config/sidebarMenu.js
export const menus = {
  SUPERADMIN: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Institutions', path: '/superadmin/institutions', icon: 'Building2' },
    { label: 'Subscriptions', path: '/superadmin/subscriptions', icon: 'CreditCard' },
    { label: 'Settings', path: '/superadmin/settings', icon: 'Settings' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Students', path: '/admin/students', icon: 'Users' },
    { label: 'Staff', path: '/admin/staff', icon: 'UserCheck' },
    { label: 'Attendance', path: '/admin/attendance', icon: 'CalendarCheck' },
    { label: 'Fees', path: '/admin/fees', icon: 'IndianRupee' },
    { label: 'Exams', path: '/admin/exams', icon: 'ClipboardList' },
    { label: 'Timetable', path: '/admin/timetable', icon: 'Clock' },
    { label: 'Notices', path: '/admin/notices', icon: 'Bell' },
    { label: 'Reports', path: '/admin/reports', icon: 'BarChart2' },
  ],
  TEACHER: [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { label: 'Attendance', path: '/teacher/attendance', icon: 'CalendarCheck' },
    { label: 'My Classes', path: '/teacher/classes', icon: 'BookOpen' },
    { label: 'Homework', path: '/teacher/homework', icon: 'FileText' },
    { label: 'Mark Entry', path: '/teacher/marks', icon: 'PenLine' },
  ],
  ACCOUNTANT: [
    { label: 'Dashboard', path: '/accountant/dashboard', icon: 'LayoutDashboard' },
    { label: 'Collect Fee', path: '/accountant/collect', icon: 'Wallet' },
    { label: 'Pending Dues', path: '/accountant/pending', icon: 'AlertCircle' },
    { label: 'Fee Reports', path: '/accountant/reports', icon: 'BarChart2' },
    { label: 'Expenses', path: '/accountant/expenses', icon: 'Receipt' },
  ],
  HR: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: 'LayoutDashboard' },
    { label: 'Staff', path: '/hr/staff', icon: 'Users' },
    { label: 'Attendance', path: '/hr/attendance', icon: 'CalendarCheck' },
    { label: 'Leave', path: '/hr/leave', icon: 'CalendarX' },
    { label: 'Payroll', path: '/hr/payroll', icon: 'IndianRupee' },
  ],
};
```

---

## 18. Environment Variables

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://erp_user:password@localhost:5432/school_erp_db"
# OR for MySQL:
# DATABASE_URL="mysql://erp_user:password@localhost:3306/school_erp_db"

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# Cloudinary (File uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS (MSG91)
MSG91_AUTH_KEY=your_msg91_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=SCHOOL

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# Redis (for Bull queue)
REDIS_URL=redis://localhost:6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=School ERP
VITE_APP_VERSION=1.0.0
```

---

## 19. Development Phases

### Phase 1 — Foundation (Week 1-2)
```
✅ Project setup (React + Vite + Tailwind + shadcn)
✅ Backend setup (Express + Prisma + PostgreSQL/MySQL)
✅ Database schema creation (npx prisma migrate dev)
✅ Authentication system (login, JWT, refresh, protected routes)
✅ Role-based sidebar + layout
✅ SuperAdmin: Institution CRUD
✅ Admin: Class + Section management
```

### Phase 2 — Core Modules (Week 3-5)
```
✅ Student Management (add, edit, list, bulk import CSV)
✅ Staff Management
✅ Attendance (mark, report, SMS on absence)
✅ Fee Structure setup
✅ Fee Invoice generation
✅ Fee Collection + Receipt PDF
```

### Phase 3 — Academic (Week 6-7)
```
✅ Timetable management
✅ Exam creation
✅ Marks entry
✅ Report card generation (PDF)
✅ Homework & Study material upload
```

### Phase 4 — HR & Finance (Week 8-9)
```
✅ Leave management (apply + approve)
✅ Payroll generation
✅ Payslip PDF download
✅ Expense tracking
✅ Finance reports
```

### Phase 5 — Advanced & Polish (Week 10-12)
```
✅ Hostel management
✅ Transport management
✅ Notice & Announcement system
✅ Dashboard charts + analytics
✅ Notification logs
✅ Gate management
✅ Document upload system
✅ Mobile-responsive UI
✅ Role & permission fine-tuning
```

---

## Quick Setup Commands

```bash
# ── BACKEND ──────────────────────────────
mkdir school-erp-backend && cd school-erp-backend
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cookie-parser cors multer cloudinary multer-storage-cloudinary axios zod nodemailer bull ioredis socket.io xlsx
npm install -D nodemon
npx prisma init
# Paste schema above into prisma/schema.prisma
# Set DATABASE_URL in .env
npx prisma migrate dev --name init
npx prisma generate

# ── FRONTEND ──────────────────────────────
npm create vite@latest school-erp-frontend -- --template react
cd school-erp-frontend
npm install
npm install react-router-dom zustand @tanstack/react-query @tanstack/react-table axios react-hook-form zod @hookform/resolvers recharts lucide-react react-hot-toast date-fns jspdf @react-pdf/renderer
npx shadcn@latest init
npm install -D tailwindcss postcss autoprefixer
```

---

*This PRD covers the complete School/College ERP system. Each section is self-contained and can be handed directly to your IDE's AI assistant (Cursor, Windsurf, Copilot) for code generation. Start from Phase 1 and build incrementally.*
