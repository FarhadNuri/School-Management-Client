export const LIVE = {
  auth: true,
  students: true,
  announcements: true,
  complaints: true,
  payments: true,
  lessons: true,
  homeworks: true,
  exams: false,
  attendance: true,
  timetable: false
};

export const LIVE_TEACHER = {
  classes: true,
  guardians: true,
  lessons: true,
  homeworks: true,
  exams: true,
  attendance: true,
  announcements: true,
  complaints: true,
  dashboard: true
};

// In dev, console.info the list of mock-only resources once at startup (never in UI)
if (import.meta.env.DEV) {
  const mockOnly = Object.entries(LIVE)
    .filter(([, isLive]) => !isLive)
    .map(([resource]) => resource);
  console.info('[Portal Data Sources] Mock-only resources:', mockOnly.join(', '));
}

export default LIVE;

