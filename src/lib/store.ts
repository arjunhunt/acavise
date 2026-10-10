/* Local persistence — key names identical to v1 so no progress is lost on upgrade. */

export interface Assessment {
  type: string;
  max: number;
  obtained: number;
  weight: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  faculty: string;
  targetGrade: string;
  score: number;
  attendance: number;
  trend: number;
  assessments: Assessment[];
}

export interface PlanBlock {
  id: string;
  day: string;
  subjectCode: string;
  task: string;
  durationMin: number;
  priority: "High" | "Medium" | "Low";
  timeSlot: string;
  done: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  type: string;
  subjectCode: string;
  date: string;
}

export interface User {
  id: string;
  email: string;
  pass: string;
  name: string;
  branch: string;
  sem: number;
  targetCgpa: number;
  currentCgpa: number;
  college: string;
  gradingScale: string;
  cutoff: number;
  totalCredits: number;
  intW: number;
  endW: number;
  onboarded: boolean;
  notifExam: boolean;
  notifAtt: boolean;
  notifDigest: boolean;
  theme: string;
  createdAt: number;
}

export const DB = {
  read<T>(k: string, fb: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fb;
    } catch {
      return fb;
    }
  },
  write(k: string, v: unknown) {
    localStorage.setItem(k, JSON.stringify(v));
  },
  del(k: string) {
    localStorage.removeItem(k);
  },
};

export const K = {
  users: "acavise_users",
  session: "acavise_session",
  subjects: (uid: string) => `acavise_user_subjects_${uid}`,
  plan: (uid: string) => `acavise_study_plan_${uid}`,
  deadlines: (uid: string) => `acavise_deadlines_${uid}`,
  settings: (uid: string) => `acavise_demo_settings_${uid}`,
};

/** Cloud layer registers a hook here; store stays dependency-free. */
let pushHook: (() => void) | null = null;
export function setPushHook(fn: (() => void) | null) {
  pushHook = fn;
}
function changed() {
  try {
    pushHook?.();
  } catch {
    /* local-only */
  }
}

export const uid = () => "u" + Math.random().toString(36).slice(2, 10);

export function getUsers(): User[] {
  return DB.read<User[]>(K.users, []);
}
export function saveUsers(u: User[]) {
  DB.write(K.users, u);
}

export function currentUser(): User | null {
  const sid = DB.read<string | null>(K.session, null);
  if (!sid) return null;
  return getUsers().find((u) => u.id === sid) || null;
}

export function updateUser(patch: Partial<User>): User | null {
  const users = getUsers();
  const me = currentUser();
  if (!me) return null;
  const i = users.findIndex((u) => u.id === me.id);
  users[i] = { ...users[i], ...patch };
  saveUsers(users);
  DB.write(K.settings(me.id), users[i]);
  changed();
  return users[i];
}

export function signupLocal(
  email: string,
  pass: string,
  name: string,
): { user?: User; error?: string } {
  email = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((u) => u.email === email)) return { error: "Email already registered. Try logging in." };
  const u: User = {
    id: uid(), email, pass: btoa(pass), name: name || email.split("@")[0],
    branch: "Computer Engineering", sem: 5, targetCgpa: 9.0, currentCgpa: 8.2,
    college: "", gradingScale: "10", cutoff: 75, totalCredits: 160,
    intW: 40, endW: 60, onboarded: false,
    notifExam: true, notifAtt: true, notifDigest: true,
    theme: "system", createdAt: Date.now(),
  };
  users.push(u);
  saveUsers(users);
  DB.write(K.session, u.id);
  seedNewUser(u.id);
  return { user: u };
}

export function loginLocal(email: string, pass: string): { user?: User; error?: string } {
  email = email.trim().toLowerCase();
  const u = getUsers().find((u) => u.email === email && u.pass === btoa(pass));
  if (!u) return { error: "Invalid email or password." };
  DB.write(K.session, u.id);
  return { user: u };
}

export function demoLogin(): User {
  const users = getUsers();
  let d = users.find((u) => u.email === "demo@acavise.app");
  if (!d) {
    d = {
      id: "demo01", email: "demo@acavise.app", pass: btoa("demo123"), name: "Demo Student",
      branch: "Computer Engineering", sem: 5, targetCgpa: 8.9, currentCgpa: 8.2,
      college: "Demo Institute of Technology", gradingScale: "10", cutoff: 75,
      totalCredits: 160, intW: 40, endW: 60, onboarded: true,
      notifExam: true, notifAtt: true, notifDigest: true,
      theme: "dark", createdAt: Date.now(),
    };
    users.push(d);
    saveUsers(users);
    seedDemo(d.id);
  }
  DB.write(K.session, d.id);
  return d;
}

export function logoutLocal() {
  DB.del(K.session);
}

export function getSubjects(uidv: string, sem: number): Subject[] {
  const all = DB.read<Record<string, Subject[]>>(K.subjects(uidv), {});
  return all[String(sem)] || [];
}

export function getAllSubjects(uidv: string): Record<string, Subject[]> {
  return DB.read<Record<string, Subject[]>>(K.subjects(uidv), {});
}

export function saveSubject(uidv: string, sem: number, sub: Subject): Subject {
  const all = DB.read<Record<string, Subject[]>>(K.subjects(uidv), {});
  const k = String(sem);
  all[k] = all[k] || [];
  sub.id = sub.id || uid();
  const i = all[k].findIndex((s) => s.id === sub.id);
  if (i >= 0) all[k][i] = sub;
  else all[k].push(sub);
  DB.write(K.subjects(uidv), all);
  changed();
  return sub;
}

export function deleteSubject(uidv: string, sem: number, id: string) {
  const all = DB.read<Record<string, Subject[]>>(K.subjects(uidv), {});
  all[String(sem)] = (all[String(sem)] || []).filter((s) => s.id !== id);
  DB.write(K.subjects(uidv), all);
  changed();
}

export function getPlan(uidv: string): PlanBlock[] {
  return DB.read<PlanBlock[]>(K.plan(uidv), []);
}
export function savePlan(uidv: string, plan: PlanBlock[]) {
  DB.write(K.plan(uidv), plan);
  changed();
}

export function getDeadlines(uidv: string): Deadline[] {
  return DB.read<Deadline[]>(K.deadlines(uidv), []);
}
export function saveDeadlines(uidv: string, d: Deadline[]) {
  DB.write(K.deadlines(uidv), d);
  changed();
}

export function seedNewUser(idv: string) {
  if (DB.read(K.subjects(idv), null as unknown) !== null) {
    if (DB.read(K.subjects(idv), null) !== null) return;
  }
  DB.write(K.subjects(idv), {});
  DB.write(K.plan(idv), []);
  const t = Date.now();
  const iso = (n: number) => new Date(t + n * 864e5).toISOString().slice(0, 10);
  DB.write(K.deadlines(idv), [
    { id: uid(), title: "Midterm Exam", type: "Midterm", subjectCode: "CS501", date: iso(6) },
    { id: uid(), title: "Lab Assignment 3", type: "Assignment", subjectCode: "CS502", date: iso(3) },
  ]);
}

export function seedDemo(idv: string) {
  const t = Date.now();
  const d = (n: number) => new Date(t + n * 864e5).toISOString().slice(0, 10);
  DB.write(K.subjects(idv), {
    "5": [
      { id: "s1", name: "Analysis of Algorithms", code: "CS501", credits: 4, faculty: "Dr. Sharma", targetGrade: "A+", score: 62, attendance: 72, trend: -2, assessments: [{ type: "Internal Assessment 1", max: 20, obtained: 12, weight: 20 }, { type: "Midterm Examination", max: 30, obtained: 18, weight: 30 }, { type: "Lab / Project", max: 20, obtained: 13, weight: 20 }] },
      { id: "s2", name: "Database Management Systems", code: "CS502", credits: 3, faculty: "Prof. Iyer", targetGrade: "O", score: 78, attendance: 84, trend: 3, assessments: [{ type: "Internal Assessment 1", max: 20, obtained: 16, weight: 20 }, { type: "Midterm Examination", max: 30, obtained: 23, weight: 30 }] },
      { id: "s3", name: "Operating Systems", code: "CS503", credits: 4, faculty: "Dr. Khan", targetGrade: "A", score: 71, attendance: 76, trend: 1, assessments: [{ type: "Internal Assessment 1", max: 20, obtained: 14, weight: 20 }, { type: "Midterm Examination", max: 30, obtained: 21, weight: 30 }] },
      { id: "s4", name: "Computer Networks", code: "CS504", credits: 3, faculty: "Prof. Rao", targetGrade: "A+", score: 85, attendance: 88, trend: 0, assessments: [{ type: "Internal Assessment 1", max: 20, obtained: 17, weight: 20 }, { type: "Midterm Examination", max: 30, obtained: 26, weight: 30 }] },
      { id: "s5", name: "Machine Learning", code: "CS505", credits: 3, faculty: "Dr. Mehta", targetGrade: "A", score: 58, attendance: 68, trend: -4, assessments: [{ type: "Internal Assessment 1", max: 20, obtained: 11, weight: 20 }, { type: "Midterm Examination", max: 30, obtained: 16, weight: 30 }] },
    ],
  });
  DB.write(K.plan(idv), [
    { id: uid(), day: "Monday", subjectCode: "CS501", task: "Revise Dynamic Programming + Graphs", durationMin: 90, priority: "High", timeSlot: "06:00 PM – 07:30 PM", done: true },
    { id: uid(), day: "Monday", subjectCode: "CS505", task: "Linear regression problem set", durationMin: 60, priority: "High", timeSlot: "08:00 PM – 09:00 PM", done: true },
    { id: uid(), day: "Tuesday", subjectCode: "CS502", task: "SQL joins + normalization", durationMin: 60, priority: "Medium", timeSlot: "05:00 PM – 06:00 PM", done: false },
    { id: uid(), day: "Wednesday", subjectCode: "CS503", task: "CPU scheduling numericals", durationMin: 45, priority: "Medium", timeSlot: "06:30 PM – 07:15 PM", done: false },
    { id: uid(), day: "Thursday", subjectCode: "CS501", task: "Midterm past paper (2024)", durationMin: 90, priority: "High", timeSlot: "06:00 PM – 07:30 PM", done: false },
    { id: uid(), day: "Friday", subjectCode: "CS505", task: "Gradient descent notes + quiz", durationMin: 60, priority: "High", timeSlot: "07:00 PM – 08:00 PM", done: false },
    { id: uid(), day: "Saturday", subjectCode: "CS504", task: "TCP/IP revision + diagrams", durationMin: 45, priority: "Low", timeSlot: "10:00 AM – 10:45 AM", done: false },
  ]);
  DB.write(K.deadlines(idv), [
    { id: uid(), title: "DBMS Midterm", type: "Midterm", subjectCode: "CS502", date: d(5) },
    { id: uid(), title: "AOA Assignment 4", type: "Assignment", subjectCode: "CS501", date: d(3) },
    { id: uid(), title: "OS Lab Practical", type: "Lab", subjectCode: "CS503", date: d(9) },
    { id: uid(), title: "ML Quiz 2", type: "Quiz", subjectCode: "CS505", date: d(2) },
  ]);
}
