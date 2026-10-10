import { getSB, type SbUser } from "./supabase";
import {
  DB, K, getUsers, saveUsers, currentUser, updateUser, seedNewUser,
  getAllSubjects, getPlan, getDeadlines, logoutLocal, setPushHook,
  type User,
} from "./store";

export function isCloud(): boolean {
  return !!getSB();
}

let pushT: ReturnType<typeof setTimeout> | null = null;
export function schedulePush() {
  if (!getSB()) return;
  if (pushT) clearTimeout(pushT);
  pushT = setTimeout(() => {
    pushNow().catch(() => {});
  }, 1200);
}
setPushHook(schedulePush);

function cloudProfileOf(u: User) {
  return {
    name: u.name, branch: u.branch, sem: u.sem, targetCgpa: u.targetCgpa,
    currentCgpa: u.currentCgpa, college: u.college, gradingScale: u.gradingScale,
    cutoff: u.cutoff, totalCredits: u.totalCredits, intW: u.intW, endW: u.endW,
    onboarded: u.onboarded, notifExam: u.notifExam, notifAtt: u.notifAtt,
    notifDigest: u.notifDigest, theme: u.theme,
  };
}

export async function pushNow(): Promise<void> {
  const sb = getSB();
  if (!sb) return;
  const me = currentUser();
  if (!me || me.id.indexOf("sb_") !== 0) return;
  const uuid = me.id.slice(3);
  const payload = {
    profile: cloudProfileOf(me),
    subjects: getAllSubjects(me.id),
    plan: getPlan(me.id),
    deadlines: getDeadlines(me.id),
  };
  const { error } = await sb
    .from("acavise_data")
    .upsert({ user_id: uuid, payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (!error) DB.write("acavise_sync_" + me.id, Date.now());
}

async function pullCloud(sbUser: SbUser) {
  const sb = getSB();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("acavise_data")
      .select("payload,updated_at")
      .eq("user_id", sbUser.id)
      .maybeSingle();
    if (error) throw error;
    return (data as { payload: Record<string, never>; updated_at: string } | null) || null;
  } catch (e) {
    console.warn("cloud pull failed:", (e as Error).message);
    return null;
  }
}

export async function ensureCloudUser(sbUser: SbUser): Promise<User> {
  const row = await pullCloud(sbUser);
  const payload = (row?.payload || {}) as {
    profile?: Partial<User>;
    subjects?: Record<string, import("./store").Subject[]>;
    plan?: import("./store").PlanBlock[];
    deadlines?: import("./store").Deadline[];
  };
  const users = getUsers();
  let u = users.find((x) => x.id === "sb_" + sbUser.id);
  const remoteTs = row ? new Date(row.updated_at).getTime() : 0;
  if (!u) {
    const p = payload.profile || {};
    u = {
      id: "sb_" + sbUser.id,
      email: sbUser.email || "",
      pass: "",
      name: p.name || (sbUser.email || "student").split("@")[0],
      branch: p.branch || "Computer Engineering",
      sem: p.sem || 5,
      targetCgpa: p.targetCgpa ?? 9,
      currentCgpa: p.currentCgpa ?? 8,
      college: p.college || "",
      gradingScale: p.gradingScale || "10",
      cutoff: p.cutoff ?? 75,
      totalCredits: p.totalCredits ?? 160,
      intW: p.intW ?? 40,
      endW: p.endW ?? 60,
      onboarded: !!p.onboarded,
      notifExam: p.notifExam ?? true,
      notifAtt: p.notifAtt ?? true,
      notifDigest: p.notifDigest ?? true,
      theme: p.theme || "dark",
      createdAt: Date.now(),
    };
    users.push(u);
    saveUsers(users);
    if (payload.subjects) DB.write(K.subjects(u.id), payload.subjects);
    if (payload.plan) DB.write(K.plan(u.id), payload.plan);
    if (payload.deadlines) DB.write(K.deadlines(u.id), payload.deadlines);
    seedNewUser(u.id);
    DB.write("acavise_sync_" + u.id, remoteTs || Date.now());
  } else if (row && remoteTs > DB.read<number>("acavise_sync_" + u.id, 0)) {
    if (payload.subjects) DB.write(K.subjects(u.id), payload.subjects);
    if (payload.plan) DB.write(K.plan(u.id), payload.plan);
    if (payload.deadlines) DB.write(K.deadlines(u.id), payload.deadlines);
    if (payload.profile) {
      const us = getUsers();
      const i = us.findIndex((x) => x.id === u!.id);
      u = { ...u, ...payload.profile };
      us[i] = u;
      saveUsers(us);
    }
    DB.write("acavise_sync_" + u.id, remoteTs);
  }
  DB.write(K.session, u.id);
  return u;
}

export async function cloudSignup(
  email: string,
  pass: string,
  name: string,
): Promise<{ user?: User; error?: string }> {
  const sb = getSB();
  if (!sb) return { error: "Cloud not configured." };
  const { data, error } = await sb.auth.signUp({ email, password: pass });
  if (error) return { error: error.message };
  if (!data.session || !data.user)
    return { error: "Account created — confirm your email, then log in." };
  await ensureCloudUser(data.user);
  updateUser({ name: name || currentUser()?.name || "Student" });
  await pushNow();
  return { user: currentUser() || undefined };
}

export async function cloudLogin(
  email: string,
  pass: string,
): Promise<{ user?: User; error?: string }> {
  const sb = getSB();
  if (!sb) return { error: "Cloud not configured." };
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) return { error: error.message };
  const u = await ensureCloudUser(data.user);
  return { user: u };
}

export async function signOutEverywhere(): Promise<void> {
  try {
    await pushNow();
  } catch {
    /* keep signing out */
  }
  try {
    getSB()?.auth.signOut();
  } catch {
    /* local-only */
  }
  logoutLocal();
}
