# Sunrise Model School - Client Portal

A modern, role-driven web application for Sunrise Model School, serving **Guardians**, **Students**, and **Teachers** through a unified UI architecture built with React and Vite.

---

## Features

- **Unified Role Architecture**: Guardians, Students, and Teachers share core layouts, styling, and navigation components. Access, tabs, and permissions are dynamically controlled via centralized role configurations.
- **Teacher Portal**: Manage assigned classes and rosters, take attendance roll call, upload study materials, create and evaluate homework, delete assignments, update gradebook marks, and browse parent/guardian contact info.
- **Guardian Portal**: Monitor linked children, track attendance and grades, view study materials, inspect student homework submissions (`ViewSubmissionModal`), and settle fee invoices online (`canPay: true`).
- **Student Portal**: Access personalized timetables, download coursework and study materials, submit homework files and links, track grades and attendance, and file complaints.
- **Payments & Stripe Receipts**:
  - Before payment, view and download the pending invoice with amount due.
  - After payment, view and download the official Stripe receipt detailing payment history (payment method, date paid, amount paid, and receipt number).
- **Homework Workflow**:
  - Submissions are restricted strictly to students (hidden from guardians).
  - Guardians see a "Submitted" status badge and can open the **View Submission** modal to inspect submitted attachments and student notes.
  - Teachers have full homework deletion controls with confirmation.
- **Role & Route Guards**: Strict client-side route protection (`AuthGuard`, `RoleGuard`) ensuring authenticated sessions and preventing cross-role route access.
- **Fast Data Synchronization**: Server-state management powered by TanStack Query with modular API services and data adapters.

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
├── services/        # API clients, teacher/student/guardian endpoints & adapters
└── styles/          # Global CSS tokens (tokens.css), portal styles (portal.css), index.css
```

---

## Role Configuration

All role differences and capabilities are centralized in `src/features/portal/config/roles.js`. Instead of scattering role conditions across UI components, views query capability flags (e.g. `canTakeAttendance`, `canManageMaterials`, `canPay`, `canCreateAnnouncement`) through the `usePortalRole` hook.
