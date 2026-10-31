# Sunrise Model School - Client Portal

A modern, role-driven web application for Sunrise Model School, serving **Guardians**, **Students**, and **Teachers** through a unified UI architecture built with React and Vite.

---

## Key Features

- **Modular Microservice API Routing**: Client services are decoupled into domain-driven endpoint modules (`/auth`, `/communication`, `/academics`, `/billing`, `/grading`) matching the backend microservice architecture.
- **Unified Role System**: Guardians, Students, and Teachers share core layouts, styling, and navigation primitives. Access, navigation tabs, and actions are dynamically controlled via centralized capability flags.
- **Academic Grades & Assessment**:
  - Comprehensive gradebook management for teachers with multi-course tab switching, subject badges, term assessments, and score logging.
  - Transparent academic reports for students and guardians detailing subject marks, term GPA summaries, grading scales, and instructor feedback.
- **Attendance & Roll Call Management**:
  - Interactive daily roll call logging for teachers per class session, supporting real-time status updates (`present`, `absent`, `late`, `excused`) and monthly attendance overview grids.
  - Visual presence tracking for students and guardians featuring attendance percentage rings, historical logs, and absence breakdown records.
- **Curriculum Study Materials & E-Books**:
  - Centralized study materials repository allowing teachers to upload lesson notes, study guides, and multimedia attachments.
  - Integrated digital e-book reader and curriculum syllabus viewer for students and guardians with quick document downloads and category filtering.
- **Announcements & Incident Complaints**:
  - **School Announcements**: Targeted bulletin broadcasts for students, guardians, and teachers with category/severity filtering and a dynamic unread counter badge in the TopBar that decrements reactively when notices are viewed.
  - **Incident Grievances & Follow-Up**: Structured complaint filing system with evidence uploads (`FormData` photo attachments), categorized incident classifications, witness declarations, and end-to-end lifecycle tracking.
- **Payment & Stripe Receipt Workflow**:
  - Unpaid invoices render the pending balance and due date with online settlement capability (`canPay: true`).
  - Paid invoices render the official Stripe receipt detailing transaction history (payment method, date paid, amount paid, and receipt number).
- **Homework Workflow**:
  - Submissions are restricted strictly to students (hidden from guardians).
  - Guardians view a "Submitted" status badge and can inspect student submissions (files, attachments, notes) via the **View Submission** modal.
  - Teachers have full homework creation, review, and deletion controls.
- **Client Route Guards**: Strict route protection via `AuthGuard` and `RoleGuard` ensuring authenticated sessions and preventing cross-role route access.
- **Server State & Data Adapters**: TanStack Query server-state caching layered on top of resilient adapters that insulate views from upstream payload variations.

---

## Modular API Architecture

The application communicates with backend services through clean domain namespaces under `src/services/portal/`:

| Domain | Base Prefix | Service Files | Responsibilities |
|---|---|---|---|
| **Authentication** | `/auth/user` | `account.js` | User login, session verification (`/me`), password changes, profile photo updates |
| **Communication** | `/communication` | `announcements.js`<br>`complaints.js` | School-wide and role-targeted notices, incident reports, grievance follow-ups |
| **Academics (Student/Guardian)** | `/academics/user` | `attendance.js`<br>`courses.js`<br>`homeworks.js`<br>`lessons.js`<br>`routine.js`<br>`students.js` | Course materials, student rosters, personal attendance summaries, class timetable, homework submissions |
| **Academics (Teacher)** | `/academics/teacher` | `teacher/attendance.js`<br>`teacher/classes.js`<br>`teacher/exams.js`<br>`teacher/guardians.js`<br>`teacher/homeworks.js`<br>`teacher/lessons.js` | Roll call management, class rosters, homework assignment creation/deletion, syllabus material uploads, gradebook entries, guardian directory |
| **Billing & Payments** | `/billing/user` | `payments.js` | Fee invoice history, student payment statements, Stripe online checkout |
| **Grading** | `/grading/user` | `grades.js` | Academic marks, term report cards, GPA transcripts |

### Data Adapter Layer
Raw backend responses pass through data adapters (`src/services/portal/adapters/` and `src/services/portal/teacher/adapters/`) before reaching UI components. This ensures:
- Safe fallback values for nullable database fields.
- Normalization of entity identifiers (`id`, `_id`).
- Consistent date/time parsing and formatting.
- Shielding UI components from backend schema modifications.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://oxc.rs/)

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (or pnpm / yarn)
- Backend API server running

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <repository-url>
   cd client
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Set your backend API endpoint in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The client will start at `http://localhost:5173` (or `http://localhost:5174`).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Vite dev server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and optimizes assets into `dist/` for production. |
| `npm run preview` | Locally serves the production `dist/` build for testing. |
| `npm run lint` | Runs Oxlint for fast code analysis. |

---

## Portal Roles & Routes

### 1. Teacher Portal (`/teacher/*`)
| Route | Feature / Description |
|---|---|
| `/teacher` | Dashboard: dynamic greeting, assigned classes count, timetable, quick actions, notices |
| `/teacher/classes` | Class rosters and enrolled student records |
| `/teacher/materials` | Upload, edit, and organize section study materials and notes |
| `/teacher/attendance` | Roll call management and attendance logging per class |
| `/teacher/homeworks` | Create assignments, manage deadlines, evaluate submissions, and delete homeworks |
| `/teacher/grades` | Class gradebook, term marks, and assessment entry |
| `/teacher/guardians` | Directory of linked parents and guardians for contact & communication |
| `/teacher/announcements`| Post notices and review school-wide announcements |
| `/teacher/complaints` | Incident reporting and case follow-up |

### 2. Guardian Portal (`/guardian/*`)
| Route | Feature / Description |
|---|---|
| `/guardian` | Dashboard: dynamic greeting, linked student summaries, timetable, and announcements |
| `/guardian/students` | Linked students roster, academic profiles, and statuses |
| `/guardian/materials` | Course study materials and lesson resources |
| `/guardian/homeworks` | Coursework details, submitted status, and student submission inspection modal |
| `/guardian/grades` | Term assessment results, grade reports, and feedback |
| `/guardian/attendance` | Daily attendance statistics and absence records |
| `/guardian/payments` | Invoice history, due invoices, Stripe receipt generation, and **online payments** (`canPay: true`) |
| `/guardian/complaints` | Submit feedback or formal inquiries to administration |
| `/guardian/announcements`| School notices and bulletin board |

### 3. Student Portal (`/student/*`)
| Route | Feature / Description |
|---|---|
| `/student` | Dashboard: dynamic greeting, enrolled class overview, timetable, and recent notices |
| `/student/materials` | Personal course notes, reading lists, and study resources |
| `/student/homeworks` | Coursework tracker and assignment submissions (file upload & link) |
| `/student/grades` | Personal academic marks, exam scores, and GPA summary |
| `/student/attendance` | Personal presence ring, attendance percentage, and logs |
| `/student/payments` | Fee statement overview and payment history / receipts (read-only, `canPay: false`) |
| `/student/complaints` | File incident reports and track resolution status |
| `/student/announcements`| School bulletins and updates |

### 4. Public Routes
| Route | Description |
|---|---|
| `/` | Landing page with dynamic header (profile dropdown when logged in) |
| `/about` | About Sunrise Model School, history, and mission |
| `/programs` | Academic programs and curriculum overview |
| `/activities` | Co-curricular and sports activities schedule |
| `/contact` | Contact information, inquiries, and admissions |
| `/login` | Unified login with role tabs (Guardian, Student, Teacher) and password reveal toggle |

---

## Project Structure

```text
src/
├── assets/          # Static assets (logos, images, icons)
├── components/      # Reusable UI components (Header, Footer, Navbar, Sidebar, Modals, Tables)
├── data/            # Static fixtures, site copy, and contact data
├── features/
│   ├── landing/     # Public landing page and subpages
│   └── portal/      # Role views, shared pages, and teacher-specific modules
│       ├── components/ # AccountModal, ViewSubmissionModal, Timetable, StatCard
│       ├── config/     # Role capabilities & tab definitions (roles.js)
│       ├── hooks/      # usePortalRole, useTheme, useUnreadAnnouncements, usePortalQueries
│       └── pages/      # Portal views (teacher/, student, guardian)
├── routes/          # Router configuration and guards (AuthGuard, RoleGuard)
├── services/        # Modular API clients, domain endpoints & data adapters
│   └── portal/
│       ├── adapters/   # Normalization adapters for student & guardian payloads
│       └── teacher/    # Teacher-specific services and adapters
└── styles/          # Global CSS tokens (tokens.css), portal styles (portal.css), index.css
```

---

## Role Configuration

All role differences and capabilities are centralized in `src/features/portal/config/roles.js`. Instead of scattering role conditions across UI components, views query capability flags (e.g. `canTakeAttendance`, `canManageMaterials`, `canPay`, `canCreateAnnouncement`) through the `usePortalRole` hook.

---