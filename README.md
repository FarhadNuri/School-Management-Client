<p align="center">
  <h1 align="center"> Sunrise Model School — Client Portal</h1>
</p>

<p align="center">
  <strong>Modern, Role-Driven School Management Portal for Students, Guardians, Teachers, and Staff</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router 7" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

---

## Overview

**Sunrise Model School Portal** is a high-performance, responsive web application engineered to bridge the daily communication and operational gap between schools, students, teachers, and guardians. Powered by **React 19** and **Vite**, the client portal delivers dynamic class routines, real-time daily roll call logging, online coursework submissions, term grading reports, official notice broadcasts, and secure online tuition fee payments.

---

## The Problem

- **Fragmented Communication:** Important notices, fee deadlines, exam dates, and attendance records traditionally travel via paper diaries, phone calls, or unorganized messaging groups. Parents often find out about absences or unpaid fees too late.
- **Disconnected Academic Workflows:** Teachers manage grades, daily roll calls, and homework assignments across disparate notebooks or spreadsheets, creating friction when compiling term progress reports.
- **Unclear Progress Tracking:** Students and guardians lack a single, transparent dashboard to monitor daily schedules, upcoming assignment deadlines, GPA calculations, and teacher remarks.

Sunrise Model School solves this by centralizing all daily academic operations into one unified, role-governed platform.

---

## Features

### Dynamic Class Routine & Dashboard
- Personalized daily class timetables showing subject periods, room allocations, and assigned instructors.
- Live academic stats overview: attendance rate percentage, pending coursework count, and quick alerts.

### Attendance Tracking & Digital Roll Call
- **Teacher Roll Call:** Single-click daily attendance logging (`Present`, `Absent`, `Late`, `Excused`) with "Mark All Present" automation and monthly calendar grids.
- **Guardian & Student Visibility:** Real-time presence tracking, attendance percentage rings, and same-day absence notifications.

### Homework & Coursework Workflow
- **Student Submissions:** Students inspect assigned tasks, upload files, write remarks, and track submission statuses.
- **Teacher Controls:** Create homework with subject tags, file attachments, and due date deadlines; review student submissions with feedback.
- **Guardian Supervision:** Guardians can inspect submitted files and verify student completion status.

### Academic Grades & Transcripts
- Multi-course gradebook for teachers with subject badges, term assessments, and marks logging.
- Transparent report cards for students and guardians detailing subject marks, term GPA, grading scales, and instructor comments.

### Notices & Announcements
- Category-based notices (`Academic`, `General`, `Disciplinary`) with priority badges (`High`, `Medium`, `Low`).
- Reactive unread count indicator in the navigation bar that decrements in real time upon viewing.

### Online Tuition & Fee Payments
- Itemized fee statement invoices for tuition, examinations, and activities.
- Online payment integration with downloadable official transaction receipts.

### Theme & Accessibility
- Seamless dark and light theme toggle with WCAG AA/AAA compliant high-contrast color tokens.
- Fully responsive across mobile, tablet, and desktop viewports with fluid Framer Motion animations.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| **Framework & Core** | React 19, Vite 8 |
| **Routing** | React Router v7 (Data Router, Route Guards) |
| **State & Data Fetching** | TanStack React Query v5 |
| **Animations** | Framer Motion |
| **Icons & Typography** | Lucide React, Phosphor Icons, Geist Variable Font |
| **Styling** | Modern CSS Variables (Design Tokens, Dark/Light Themes) |
| **Linting & Quality** | Oxlint |

---

## Role-Based Access Control

The portal implements strict client-side route protection via `AuthGuard` and `RoleGuard`:

| Feature / Page | Student | Guardian | Teacher | Admin |
| --- | :---: | :---: | :---: | :---: |
| **Personal Dashboard & Routine** | ✅ | ✅ | ✅ | ✅ |
| **Attendance (View Own / Student)** | ✅ | ✅ | ❌ | ✅ |
| **Attendance (Take Class Roll Call)** | ❌ | ❌ | ✅ | ✅ |
| **Homework (Submit Assignment)** | ✅ | ❌ | ❌ | ❌ |
| **Homework (Create & Review)** | ❌ | ❌ | ✅ | ✅ |
| **Homework (View Submission Details)** | ✅ | ✅ | ✅ | ✅ |
| **Gradebook & Report Cards** | ✅ (Own) | ✅ (Child) | ✅ (Manage) | ✅ |
| **Fee Statements & Online Payments** | ✅ | ✅ | ❌ | ✅ |
| **School Announcements** | ✅ | ✅ | ✅ | ✅ |

---

## Modular API Endpoints

The frontend client communicates with backend microservice domains through centralized service modules in `src/services/portal/`:

| Domain | Base Endpoint Prefix | Service Files | Key Responsibilities |
| --- | --- | --- | --- |
| **Authentication** | `/auth/user` | `account.js` | Session verification (`/me`), credentials login, password changes, profile photo uploads |
| **Communication** | `/communication` | `announcements.js`<br>`complaints.js` | School notices broadcast, category/severity filtering, student grievance reports & evidence tracking |
| **Academics (Student & Guardian)** | `/academics/user` | `attendance.js`<br>`courses.js`<br>`homeworks.js`<br>`lessons.js`<br>`routine.js`<br>`students.js` | Personal attendance history, weekly class routines, homework submissions, digital e-book access |
| **Academics (Teacher)** | `/academics/teacher` | `teacher/attendance.js`<br>`teacher/classes.js`<br>`teacher/exams.js`<br>`teacher/guardians.js`<br>`teacher/homeworks.js`<br>`teacher/lessons.js` | Class session roll calls, assigned section rosters, homework assignment creation, syllabus uploads, guardian directory |
| **Billing & Payments** | `/billing/user` | `payments.js` | Outstanding fee invoices, transaction logs, Stripe checkout session redirects |
| **Grading & Transcripts** | `/grading/user` | `grades.js` | Subject assessment marks, semester GPA calculation, term report card generation |

### Data Adapter Layer
Raw responses pass through dedicated adapters (`src/services/portal/adapters/`) before reaching components. This ensures:
- Safe fallback values for optional or nullable database attributes.
- Consistent date, status, and currency normalization across all client views.
- Clean decoupling between API contracts and UI presentation logic.

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm** installed
- Backend API server running (or target staging API endpoint)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/schoolclient.git
cd schoolclient

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

### Development & Production

```bash
# Start local development server
npm run dev

# Run fast code linting
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
src/
├── assets/                  # Static assets and illustrations
├── components/              # Shared UI components (TopBar, Sidebar, Modals)
├── features/
│   ├── auth/                # Login, session checks, and password reset
│   ├── landing/             # Public landing page sections & benefits slider
│   └── portal/              # Role-based dashboard features
│       ├── components/      # Feature-specific widgets (Routine, Gradebook, Cards)
│       ├── hooks/           # TanStack query and unread notifications hooks
│       └── pages/           # Student, Teacher, and Guardian views
├── routes/                  # App routing with AuthGuard and RoleGuard
├── services/
│   └── portal/              # Domain API modules & data transformation adapters
│       ├── academics/       # Routines, homeworks, and curriculum materials
│       ├── attendance/      # Daily roll call and summary endpoints
│       ├── billing/         # Fee invoices and Stripe payment calls
│       └── grading/         # Examination marks and GPA transcripts
└── styles/                  # Global CSS tokens, theme variables, and layout rules
```

---

## Use Cases

| Persona | Primary Workflow |
| --- | --- |
| **Students** | Check daily class routines, track due homework, submit coursework files, review grades, and read school circulars. |
| **Guardians** | Monitor student attendance same-day, review teacher remarks, inspect submitted homework, and pay school tuition fees online. |
| **Teachers** | Conduct daily session roll calls, upload syllabus materials, post homework assignments, and record examination marks. |
| **Administration** | Broadcast emergency notices, manage class sections, and maintain digital student academic records. |

---

## Contributing

1. Fork the project repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to your branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## Author & Support

**Farhad Nuri**
- **GitHub:** [@FarhadNuri](https://github.com/FarhadNuri)
- **LinkedIn:** [Farhad Nuri](https://www.linkedin.com/in/farhad-nuri-ba99a62a5/)
- **Email:** farhadnuri559@gmail.com

---