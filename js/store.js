/* AcaVise store: users, session, subjects, planner, deadlines — localStorage scoped per user */
const DB = {
  read(k, fb){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } },
  write(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
  del(k){ localStorage.removeItem(k); }
};
const K = {
  users:'acavise_users', session:'acavise_session',
  subjects:(uid)=>`acavise_user_subjects_${uid}`,
  plan:(uid)=>`acavise_study_plan_${uid}`,
  deadlines:(uid)=>`acavise_deadlines_${uid}`,
  settings:(uid)=>`acavise_demo_settings_${uid}`,
};
const uid = ()=> 'u' + Math.random().toString(36).slice(2,10);
function getUsers(){ return DB.read(K.users, []); }
function saveUsers(u){ DB.write(K.users, u); }
function currentUser(){
  const sid = DB.read(K.session, null);
  if(!sid) return null;
  return getUsers().find(u=>u.id===sid) || null;
}
function updateUser(patch){
  const users = getUsers(); const me = currentUser(); if(!me) return null;
  const i = users.findIndex(u=>u.id===me.id);
  users[i] = {...users[i], ...patch};
  saveUsers(users);
  DB.write(K.settings(me.id), users[i]);
  return users[i];
}
function signup(email, pass, name){
  email = email.trim().toLowerCase();
  const users = getUsers();
  if(users.some(u=>u.email===email)) return {error:'Email already registered. Try logging in.'};
  const u = { id:uid(), email, pass:btoa(pass), name:name||email.split('@')[0], branch:'Computer Engineering',
    sem:5, targetCgpa:9.0, currentCgpa:8.2, college:'', gradingScale:'10', cutoff:75,
    totalCredits:160, intW:40, endW:60, onboarded:false,
    notifExam:true, notifAtt:true, notifDigest:true, theme:'system', createdAt:Date.now() };
  users.push(u); saveUsers(users);
  DB.write(K.session, u.id);
  seedNewUser(u.id, true);
  return {user:u};
}
function login(email, pass){
  email = email.trim().toLowerCase();
  const u = getUsers().find(u=>u.email===email && u.pass===btoa(pass));
  if(!u) return {error:'Invalid email or password.'};
  DB.write(K.session, u.id);
  return {user:u};
}
function demoLogin(){
  let users = getUsers();
  let d = users.find(u=>u.email==='demo@acavise.app');
  if(!d){
    d = { id:'demo01', email:'demo@acavise.app', pass:btoa('demo123'), name:'Demo Student',
      branch:'Computer Engineering', sem:5, targetCgpa:8.9, currentCgpa:8.2, college:'Demo Institute of Technology',
      gradingScale:'10', cutoff:75, totalCredits:160, intW:40, endW:60, onboarded:true,
      notifExam:true, notifAtt:true, notifDigest:true, theme:'dark', createdAt:Date.now() };
    users.push(d); saveUsers(users);
    seedDemo(d.id);
  }
  DB.write(K.session, d.id);
  return d;
}
function logout(){ DB.del(K.session); location.hash = '#/'; }
function getSubjects(uidv, sem){
  const all = DB.read(K.subjects(uidv), {});
  return all[String(sem)] || [];
}
function getAllSubjects(uidv){ return DB.read(K.subjects(uidv), {}); }
function saveSubject(uidv, sem, sub){
  const all = DB.read(K.subjects(uidv), {});
  const k = String(sem);
  all[k] = all[k] || [];
  sub.id = sub.id || uid();
  const i = all[k].findIndex(s=>s.id===sub.id);
  if(i>=0) all[k][i]=sub; else all[k].push(sub);
  DB.write(K.subjects(uidv), all);
  return sub;
}
function deleteSubject(uidv, sem, id){
  const all = DB.read(K.subjects(uidv), {});
  all[String(sem)] = (all[String(sem)]||[]).filter(s=>s.id!==id);
  DB.write(K.subjects(uidv), all);
}
function getPlan(uidv){ return DB.read(K.plan(uidv), []); }
function savePlan(uidv, plan){ DB.write(K.plan(uidv), plan); }
function getDeadlines(uidv){ return DB.read(K.deadlines(uidv), []); }
function saveDeadlines(uidv, d){ DB.write(K.deadlines(uidv), d); }

function seedNewUser(idv, blank){
  if(DB.read(K.subjects(idv), null)) return;
  DB.write(K.subjects(idv), {});
  DB.write(K.plan(idv), []);
  const t = Date.now();
  DB.write(K.deadlines(idv), [
    {id:uid(), title:'Midterm Exam', type:'Midterm', subjectCode:'CS501', date:new Date(t+6*864e5).toISOString().slice(0,10)},
    {id:uid(), title:'Lab Assignment 3', type:'Assignment', subjectCode:'CS502', date:new Date(t+3*864e5).toISOString().slice(0,10)},
  ]);
}
function seedDemo(idv){
  const t = Date.now(); const d = (n)=> new Date(t+n*864e5).toISOString().slice(0,10);
  DB.write(K.subjects(idv), { "5":[
    {id:'s1', name:'Analysis of Algorithms', code:'CS501', credits:4, faculty:'Dr. Sharma', targetGrade:'A+', score:62, attendance:72, trend:-2, assessments:[{type:'Internal Assessment 1',max:20,obtained:12,weight:20},{type:'Midterm Examination',max:30,obtained:18,weight:30},{type:'Lab / Project',max:20,obtained:13,weight:20}]},
    {id:'s2', name:'Database Management Systems', code:'CS502', credits:3, faculty:'Prof. Iyer', targetGrade:'O', score:78, attendance:84, trend:3, assessments:[{type:'Internal Assessment 1',max:20,obtained:16,weight:20},{type:'Midterm Examination',max:30,obtained:23,weight:30}]},
    {id:'s3', name:'Operating Systems', code:'CS503', credits:4, faculty:'Dr. Khan', targetGrade:'A', score:71, attendance:76, trend:1, assessments:[{type:'Internal Assessment 1',max:20,obtained:14,weight:20},{type:'Midterm Examination',max:30,obtained:21,weight:30}]},
    {id:'s4', name:'Computer Networks', code:'CS504', credits:3, faculty:'Prof. Rao', targetGrade:'A+', score:85, attendance:88, trend:0, assessments:[{type:'Internal Assessment 1',max:20,obtained:17,weight:20},{type:'Midterm Examination',max:30,obtained:26,weight:30}]},
    {id:'s5', name:'Machine Learning', code:'CS505', credits:3, faculty:'Dr. Mehta', targetGrade:'A', score:58, attendance:68, trend:-4, assessments:[{type:'Internal Assessment 1',max:20,obtained:11,weight:20},{type:'Midterm Examination',max:30,obtained:16,weight:30}]},
  ]});
  DB.write(K.plan(idv), [
    {id:uid(), day:'Monday', subjectCode:'CS501', task:'Revise Dynamic Programming + Graphs', durationMin:90, priority:'High', timeSlot:'06:00 PM – 07:30 PM', done:true},
    {id:uid(), day:'Monday', subjectCode:'CS505', task:'Linear regression problem set', durationMin:60, priority:'High', timeSlot:'08:00 PM – 09:00 PM', done:true},
    {id:uid(), day:'Tuesday', subjectCode:'CS502', task:'SQL joins + normalization', durationMin:60, priority:'Medium', timeSlot:'05:00 PM – 06:00 PM', done:false},
    {id:uid(), day:'Wednesday', subjectCode:'CS503', task:'CPU scheduling numericals', durationMin:45, priority:'Medium', timeSlot:'06:30 PM – 07:15 PM', done:false},
    {id:uid(), day:'Thursday', subjectCode:'CS501', task:'Midterm past paper (2024)', durationMin:90, priority:'High', timeSlot:'06:00 PM – 07:30 PM', done:false},
    {id:uid(), day:'Friday', subjectCode:'CS505', task:'Gradient descent notes + quiz', durationMin:60, priority:'High', timeSlot:'07:00 PM – 08:00 PM', done:false},
    {id:uid(), day:'Saturday', subjectCode:'CS504', task:'TCP/IP revision + diagrams', durationMin:45, priority:'Low', timeSlot:'10:00 AM – 10:45 AM', done:false},
  ]);
  DB.write(K.deadlines(idv), [
    {id:uid(), title:'DBMS Midterm', type:'Midterm', subjectCode:'CS502', date:d(5)},
    {id:uid(), title:'AOA Assignment 4', type:'Assignment', subjectCode:'CS501', date:d(3)},
    {id:uid(), title:'OS Lab Practical', type:'Lab', subjectCode:'CS503', date:d(9)},
    {id:uid(), title:'ML Quiz 2', type:'Quiz', subjectCode:'CS505', date:d(2)},
  ]);
}
