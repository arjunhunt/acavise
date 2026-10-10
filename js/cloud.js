/* Cloud sync (Supabase) — same account + progress on any device/browser.
   No-ops when sb-config.js is empty: site keeps working in local-only mode. */
function isCloud(){
  try{ return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase && window.__sb); }
  catch(e){ return false; }
}
let __pushT = null;
function schedulePush(){
  if(!isCloud()) return;
  clearTimeout(__pushT);
  __pushT = setTimeout(()=>{ pushNow().catch(()=>{}); }, 1200);
}
function cloudProfileOf(u){
  return { name:u.name, branch:u.branch, sem:u.sem, targetCgpa:u.targetCgpa,
    currentCgpa:u.currentCgpa, college:u.college, gradingScale:u.gradingScale,
    cutoff:u.cutoff, totalCredits:u.totalCredits, intW:u.intW, endW:u.endW,
    onboarded:u.onboarded, notifExam:u.notifExam, notifAtt:u.notifAtt,
    notifDigest:u.notifDigest, theme:u.theme };
}
async function pushNow(){
  if(!isCloud()) return;
  const me = currentUser();
  if(!me || me.id.indexOf('sb_')!==0) return;
  const uuid = me.id.slice(3);
  const payload = { profile: cloudProfileOf(me), subjects: getAllSubjects(me.id),
    plan: getPlan(me.id), deadlines: getDeadlines(me.id) };
  const { error } = await window.__sb.from('acavise_data')
    .upsert({ user_id: uuid, payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if(!error) DB.write('acavise_sync_'+me.id, Date.now());
}
async function pullCloud(sbUser){
  try{
    const { data, error } = await window.__sb.from('acavise_data')
      .select('payload,updated_at').eq('user_id', sbUser.id).maybeSingle();
    if(error) throw error;
    return data || null;
  }catch(e){ console.warn('cloud pull failed:', e.message); return null; }
}
async function ensureCloudUser(sbUser){
  const row = await pullCloud(sbUser);
  const payload = (row && row.payload) || {};
  const users = getUsers();
  let u = users.find(x=>x.id==='sb_'+sbUser.id);
  const remoteTs = row ? new Date(row.updated_at).getTime() : 0;
  if(!u){
    const p = payload.profile || {};
    u = { id:'sb_'+sbUser.id, email:sbUser.email, pass:'',
      name:p.name || sbUser.email.split('@')[0],
      branch:p.branch || 'Computer Engineering', sem:p.sem || 5,
      targetCgpa:(p.targetCgpa ?? 9), currentCgpa:(p.currentCgpa ?? 8),
      college:p.college || '', gradingScale:p.gradingScale || '10',
      cutoff:(p.cutoff ?? 75), totalCredits:(p.totalCredits ?? 160),
      intW:(p.intW ?? 40), endW:(p.endW ?? 60),
      onboarded:!!p.onboarded,
      notifExam:(p.notifExam ?? true), notifAtt:(p.notifAtt ?? true), notifDigest:(p.notifDigest ?? true),
      theme:p.theme || 'dark', createdAt:Date.now() };
    users.push(u); saveUsers(users);
    if(payload.subjects) DB.write(K.subjects(u.id), payload.subjects);
    if(payload.plan) DB.write(K.plan(u.id), payload.plan);
    if(payload.deadlines) DB.write(K.deadlines(u.id), payload.deadlines);
    seedNewUser(u.id);
    DB.write('acavise_sync_'+u.id, remoteTs || Date.now());
  } else if(row && remoteTs > DB.read('acavise_sync_'+u.id, 0)){
    if(payload.subjects) DB.write(K.subjects(u.id), payload.subjects);
    if(payload.plan) DB.write(K.plan(u.id), payload.plan);
    if(payload.deadlines) DB.write(K.deadlines(u.id), payload.deadlines);
    if(payload.profile){
      const us = getUsers(), i = us.findIndex(x=>x.id===u.id);
      u = Object.assign({}, u, payload.profile); us[i] = u; saveUsers(us);
    }
    DB.write('acavise_sync_'+u.id, remoteTs);
  }
  DB.write(K.session, u.id);
  return u;
}
async function cloudSignup(email, pass, name){
  const { data, error } = await window.__sb.auth.signUp({ email, password: pass });
  if(error) return { error: error.message };
  if(!data.session) return { error: 'Account created — now confirm your email, then log in. (Tip: turn OFF “Confirm email” in Supabase → Authentication for instant login.)' };
  await ensureCloudUser(data.user);
  updateUser({ name: name || currentUser().name });
  await pushNow();
  return { user: currentUser() };
}
async function cloudLogin(email, pass){
  const { data, error } = await window.__sb.auth.signInWithPassword({ email, password: pass });
  if(error) return { error: error.message };
  const u = await ensureCloudUser(data.user);
  return { user: u };
}
