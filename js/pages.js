/* Pages part 1: landing, auth, onboarding, dashboard, academics */
function pageLanding(){
  return `<nav class="landing-nav"><div class="brand" style="cursor:default"><img src="logo.png" class="brand-logo" alt="AcaVise"></div>
    <div class="links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#math">Math engine</a></div>
    <div style="margin-left:auto;display:flex;gap:10px"><button class="btn small ghost" onclick="location.hash='#/login'">Log in</button><button class="btn small" onclick="location.hash='#/signup'">Get started</button></div></nav>
  <header class="hero">
    <span class="hero-badge"><span class="live"></span> Academic Visibility & Progress Simulator • Live</span>
    <h1>Know exactly <span class="grad-text">where you stand,</span> what you need, and what to do today.</h1>
    <p class="sub">AcaVise turns scattered internal marks, attendance and credits into <b style="color:var(--text)">real-time SGPA/CGPA, reverse-calculated target scores, ranked study priorities</b> and a concrete weekly plan — plus an AI assistant that knows your semester.</p>
    <div class="hero-cta"><button class="btn" onclick="location.hash='#/signup'">🚀 Start free — no email wait</button><button class="btn ghost" onclick="doDemo()">⚡ Instant Demo Mode</button></div>
    <div class="hero-stats">
      <div class="float-chip">📊 Live SGPA<small>weighted by credits</small></div>
      <div class="float-chip" style="animation-delay:-1.6s">🎯 Required SGPA<small>reverse calculator</small></div>
      <div class="float-chip" style="animation-delay:-3.2s">⚡ Priority 1–100<small>credit × deficit</small></div>
      <div class="float-chip" style="animation-delay:-2.1s">🔥 Streak + planner<small>Mon–Sun blocks</small></div>
    </div></header>
  <section class="q-section" id="how"><span class="sec-tag">THE 4 CORE QUESTIONS</span>
    <h2>Every student asks these. AcaVise answers all four.</h2>
    <div class="q-grid stagger">
      ${[['01','“Where do I stand right now?”','Real-time SGPA/CGPA, weighted attendance, internal tracking.','#/signup','📊','Dashboard'],
         ['02','“What do I need for my target?”','Reverse math: exact SGPA + endterm % for your graduation goal.','#/signup','🎯','Targets'],
         ['03','“What should I focus on first?”','Priority score 1–100 from deficit × credits × attendance risk.','#/signup','⚡','Priorities'],
         ['04','“What should I do today?”','Daily time blocks linked to high-yield subjects & deadlines.','#/signup','📅','Planner']]
        .map(q=>`<div class="card hover q-card reveal" onclick="location.hash='${q[3]}'"><div class="q-num">${q[0]}</div><h3 style="margin:8px 0">${q[1]}</h3><p class="muted">${q[2]}</p><div class="go">${q[4]} Open ${q[5]} →</div></div>`).join('')}
    </div></section>
  <section class="q-section" id="features"><span class="sec-tag">FEATURE SHOWCASE</span>
    <h2>Five tools, one academic command center.</h2>
    <div class="feat-grid stagger">
      ${[['📊','Academic Dashboard','CGPA gap, SGPA estimate, attendance health (Safe / Warning / Critical), next deadline countdown, trend badges.'],
         ['📚','Academics Manager','Sem 1–8 tabs, credit sums, add-subject modal, assessment inspector (internals, midsem, labs, endterm).'],
         ['🎯','Target Simulator','Required future SGPA, feasibility tiers (Achievable → Infeasible), endterm % projection, per-course grade matrix.'],
         ['⚡','Priority Engine','Rank #1→N with diagnosis + prescriptive action + impact factor. Export study brief as .txt'],
         ['📅','Smart Planner','Mon–Sun board, hours vs scheduled bar, streak counter, add-block modal, check-off execution.'],
         ['✨','AI Assistant','Grounded in your subjects, scores, attendance & targets. Prompt pills, deep-links (?q=), markdown answers.']]
        .map(f=>`<div class="card hover reveal"><div class="feat-ico">${f[0]}</div><h3>${f[1]}</h3><p class="muted" style="margin-top:6px">${f[2]}</p></div>`).join('')}
    </div></section>
  <section class="q-section" id="math"><span class="sec-tag">TRANSPARENT MATH ENGINE</span>
    <h2>No black box. Every number is explainable.</h2>
    <div class="grid g2" style="margin-top:18px">
      <div class="card reveal"><h3>📐 Weighted SGPA</h3><div class="formula-box">SGPA = Σ (Score/10 × Credits) / Σ Credits</div><p class="muted">Same credit-weighting your university uses.</p></div>
      <div class="card reveal"><h3>🎯 Required future SGPA</h3><div class="formula-box">Req = (Target×Total − Current×Completed) / Remaining<br>Completed = (Sem−1)×20</div><p class="muted">Reverse-engineers your graduation goal.</p></div>
      <div class="card reveal"><h3>⚡ Priority score (1–100)</h3><div class="formula-box">Deficit = max(0, 100 − Score)<br>Priority = min(100, max(10, Deficit + Credits×2))<br>High: &lt;65% • Med: 65–80% • Low: ≥80%</div></div>
      <div class="card reveal"><h3>🛡️ Weighted attendance</h3><div class="formula-box">Attendance = Σ (Att × Credits) / Σ Credits<br>Cutoffs: 75% / 80% / 85%</div><p class="muted">Credit-weighted, with Safe / Warning / Critical tags.</p></div>
    </div></section>
  <div class="cta-band reveal"><h2 style="font-size:clamp(24px,4vw,40px);letter-spacing:-.03em">Stop guessing. Start simulating.</h2>
    <p style="opacity:.85;margin:10px 0 22px">Onboarding takes 30 seconds. Demo mode takes 1 click.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><button class="btn" style="background:#fff;color:#1e1b4b" onclick="location.hash='#/signup'">Create account</button><button class="btn ghost" style="border-color:rgba(255,255,255,.4);color:#fff" onclick="doDemo()">Try demo</button></div></div>
  <footer class="site">© 2026 AcaVise • Academic Visibility & Progress Simulator • All data stays in your browser (localStorage) • Built with the full 13-module spec</footer>`;
}
function doDemo(){ demoLogin(); applyTheme(); location.hash = '#/dashboard'; toast('Welcome to Demo Mode — explore freely'); }

/* ---- AUTH ---- */
function pageSignup(){
  return `<div class="auth-wrap"><div class="card auth-card"><div class="brand" style="margin-bottom:14px"><img src="logo.png" class="brand-logo lg" alt="AcaVise"></div>
  <h1>Start your visibility.</h1><p class="muted">University email + password. No verification wait.</p>
  <div class="field"><label>Full name</label><input id="su-name" class="inp" placeholder="e.g. Arjun Singh"></div>
  <div class="field"><label>University / student email</label><input id="su-email" class="inp" placeholder="you@college.edu"></div>
  <div class="form-row"><div class="field"><label>Password (min 6)</label><input id="su-p1" type="password" class="inp" placeholder="••••••"></div>
  <div class="field"><label>Confirm password</label><input id="su-p2" type="password" class="inp" placeholder="••••••"></div></div>
  <div style="display:flex;gap:10px;margin-top:18px"><button class="btn" style="flex:1" onclick="actSignup()">Create account →</button></div>
  <button class="btn ghost" style="width:100%;margin-top:10px" onclick="doDemo()">⚡ Enter via Instant Demo Mode</button>
  <p class="muted" style="margin-top:14px;text-align:center">Have an account? <span class="link" onclick="location.hash='#/login'">Log in</span> • <span class="link" onclick="location.hash='#/'">← Home</span></p></div></div>`;
}
function pageLogin(){
  return `<div class="auth-wrap"><div class="card auth-card"><div class="brand" style="margin-bottom:14px"><img src="logo.png" class="brand-logo lg" alt="AcaVise"></div>
  <h1>Log in anywhere.</h1><p class="muted">Phone, laptop, tablet — same credentials.</p>
  <div class="field"><label>Email</label><input id="li-email" class="inp" placeholder="you@college.edu"></div>
  <div class="field"><label>Password</label><input id="li-pass" type="password" class="inp" placeholder="••••••"></div>
  <div style="display:flex;gap:10px;margin-top:18px"><button class="btn" style="flex:1" onclick="actLogin()">Log in →</button></div>
  <button class="btn ghost" style="width:100%;margin-top:10px" onclick="doDemo()">⚡ Instant Demo Mode</button>
  <p class="muted" style="margin-top:14px;text-align:center">New here? <span class="link" onclick="location.hash='#/signup'">Sign up</span> • <span class="link" onclick="location.hash='#/'">← Home</span></p></div></div>`;
}
function actSignup(){
  const n=document.getElementById('su-name').value.trim(), e=document.getElementById('su-email').value.trim();
  const p1=document.getElementById('su-p1').value, p2=document.getElementById('su-p2').value;
  if(!n) return toast('Enter your name','err');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return toast('Enter a valid email','err');
  if(p1.length<6) return toast('Password needs 6+ characters','err');
  if(p1!==p2) return toast('Passwords do not match','err');
  const r = signup(e,p1,n);
  if(r.error) return toast(r.error,'err');
  toast('Account created — complete your profile'); location.hash='#/onboarding';
}
function actLogin(){
  const e=document.getElementById('li-email').value, p=document.getElementById('li-pass').value;
  const r = login(e,p);
  if(r.error) return toast(r.error,'err');
  applyTheme();
  location.hash = r.user.onboarded ? '#/dashboard' : '#/onboarding';
  toast(`Welcome back, ${r.user.name.split(' ')[0]}`);
}
function pageOnboarding(){
  const u = currentUser();
  const guess = u.email.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return `<div class="auth-wrap"><div class="card auth-card" style="max-width:520px">
  <div class="brand"><img src="logo.png" class="brand-logo lg" alt="AcaVise"></div>
  <h1 style="margin-top:12px">Set your baseline.</h1><p class="muted">This powers every simulation.</p>
  <div class="steps"><span class="on"></span><span class="on"></span><span></span></div>
  <div class="field"><label>Full name</label><input id="ob-name" class="inp" value="${u.name||guess}"></div>
  <div class="form-row"><div class="field"><label>Major / department</label><select id="ob-branch" class="inp">${['Computer Engineering','Information Technology','Electronics','Mechanical','Electrical','Civil'].map(b=>`<option ${b===u.branch?'selected':''}>${b}</option>`).join('')}</select></div>
  <div class="field"><label>Current semester</label><select id="ob-sem" class="inp">${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s==u.sem?'selected':''}>Semester ${s}</option>`).join('')}</select></div></div>
  <div class="form-row"><div class="field"><label>Current CGPA</label><input id="ob-cgpa" type="number" step="0.01" min="0" max="10" class="inp" value="${u.currentCgpa??8}"></div>
  <div class="field"><label>Target graduation CGPA</label><input id="ob-tcgpa" type="number" step="0.01" min="0" max="10" class="inp" value="${u.targetCgpa??9}"></div></div>
  <button class="btn" style="width:100%;margin-top:18px" onclick="actOnboard()">Launch my dashboard →</button></div></div>`;
}
function actOnboard(){
  const name=document.getElementById('ob-name').value.trim()||'Student';
  updateUser({name, branch:document.getElementById('ob-branch').value, sem:Number(document.getElementById('ob-sem').value),
    currentCgpa:Number(document.getElementById('ob-cgpa').value)||0, targetCgpa:Number(document.getElementById('ob-tcgpa').value)||9, onboarded:true});
  toast('Profile saved — welcome aboard'); location.hash='#/dashboard';
}

/* ---- DASHBOARD ---- */
function pageDashboard(){
  const u = currentUser();
  const subs = getSubjects(u.id, u.sem);
  const sg = sgpaOf(subs), att = attendanceOf(subs), tag = attTag(att, u.cutoff);
  const gap = (u.targetCgpa - u.currentCgpa);
  const credits = subs.reduce((a,s)=>a+Number(s.credits||0),0);
  const dls = getDeadlines(u.id).map(d=>({...d, days:daysUntil(d.date)})).filter(d=>d.days>=0).sort((a,b)=>a.days-b.days);
  const next = dls[0];
  const ranked = [...subs].sort((a,b)=>priorityScore(b)-priorityScore(a));
  const worst = ranked[ranked.length-1] || ranked[0];
  const aiQ = worst ? `How can I improve ${worst.name} (${worst.code})?` : 'What should I study today?';
  return `<div class="page-head"><div><span class="pill blue">SEMESTER ${u.sem} • ${u.branch.toUpperCase()}</span>
    <h1 style="margin-top:10px">Hey ${u.name.split(' ')[0]}, here's your academic health. 👋</h1>
    <p>Live synthesis of SGPA, attendance, deadlines and focus — updated every time you edit a subject.</p></div>
    <div style="display:flex;gap:10px"><button class="btn small ghost" onclick="location.hash='#/academics'">＋ Add course</button><button class="btn small" onclick="location.hash='#/targets'">🎯 Simulate target</button></div></div>
  <div class="grid g4 stagger">
    <div class="card hover"><div class="muted">Current CGPA</div><div class="stat-num" id="c-cgpa">0</div>
      <div style="font-size:13px;color:var(--muted)">Target ${Number(u.targetCgpa).toFixed(2)} • Gap <b style="color:${gap>0?'var(--warn)':'var(--ok)'}">${gap>0?'+':''}${gap.toFixed(2)}</b></div><div class="bar"><i id="b-cgpa" style="width:0%"></i></div></div>
    <div class="card hover"><div class="muted">Semester SGPA (est.)</div><div class="stat-num" id="c-sgpa">0</div>
      <div style="font-size:13px;color:var(--muted)">${credits} credits across ${subs.length} subjects</div><div class="bar green"><i id="b-sgpa" style="width:0%"></i></div></div>
    <div class="card hover"><div class="muted">Attendance health</div><div class="stat-num" id="c-att">0</div>
      <div><span class="pill ${tag.cls}">${tag.label}</span> <span style="font-size:12px;color:var(--muted)">cutoff ${u.cutoff}%</span></div><div class="bar ${tag.cls}"><i id="b-att" style="width:0%"></i></div></div>
    <div class="card hover"><div class="muted">Next critical deadline</div>
      ${next?`<div class="stat-num">${next.days===0?'Today':next.days+'d'}</div><div style="font-size:13px"><b>${next.title}</b><br><span style="color:var(--muted)">${next.subjectCode} • ${next.date}</span></div>`
      :`<div class="stat-num">—</div><div class="muted">No upcoming deadlines. Add one in Academics.</div>`}</div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>📘 Subject performance</h3><span class="link" onclick="location.hash='#/academics'">Manage →</span></div>
      ${subs.length?subs.map(s=>{const st=standingOf(s);return `<div class="sub-row"><div class="avatar" style="width:34px;height:34px;font-size:11px">${s.code.slice(0,2)}</div>
        <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px">${s.code} • ${s.name}</div>
        <div style="font-size:12px;color:var(--muted)">${s.credits} cr • ${s.faculty||'—'} • Target ${s.targetGrade||'A'} • <b style="color:var(--text)">${s.score}%</b> ${s.trend?`<span style="color:${s.trend>0?'var(--ok)':'var(--crit)'}">${s.trend>0?'▲ +'+s.trend:'▼ '+s.trend}%</span>`:'<span style="color:var(--muted)">● stable</span>'}</div></div>
        <span class="pill ${st.cls}">${st.label}</span></div>`;}).join('')
      :`<p class="muted" style="margin-top:10px">No courses yet for Sem ${u.sem}. <span class="link" onclick="location.hash='#/academics'">Add your first subject →</span></p>`}</div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,.16),rgba(34,211,238,.08))"><h3>✨ Ask AcaVise</h3>
        <p class="muted">One-click prompts grounded in your lowest-scoring course${worst?` (<b>${worst.code}</b>)`:''}:</p>
        <div>${[`What should I study today?`, worst?`What do I need in ${worst.name} for an ${worst.targetGrade||'A'}?`:null, `How does my attendance look?`].filter(Boolean).map(p=>`<span class="prompt-chip" onclick="askGo('${p.replace(/'/g,"\\'")}')">${p}</span>`).join('')}</div></div>
      <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>⚡ Priority focus — top 3</h3><span class="link" onclick="location.hash='#/priority'">All →</span></div>
        ${ranked.slice(0,3).map((s,i)=>{const ur=urgencyOf(s);return `<div class="sub-row"><b style="font-family:var(--mono);color:var(--muted)">#${i+1}</b>
          <div style="flex:1"><b style="font-size:13.5px">${s.code}</b> <span class="pill ${ur.cls}">${ur.label}</span><div style="font-size:12.5px;color:var(--muted)">${studyAction(s)}</div></div>
          <b style="font-family:var(--mono)">${priorityScore(s)}</b></div>`;}).join('') || '<p class="muted">Add subjects to generate priorities.</p>'}</div>
      <div class="card"><h3>🗓️ Upcoming deadlines</h3><div class="timeline" style="margin-top:10px">
        ${dls.slice(0,5).map(d=>`<div class="t-item"><b style="font-size:13.5px">${d.title}</b> <span class="pill ${d.days<=3?'rose':d.days<=7?'amber':'green'}">${d.days===0?'Today':'In '+d.days+'d'}</span><div style="font-size:12.5px;color:var(--muted)">${d.subjectCode} • ${d.type} • ${d.date}</div></div>`).join('') || '<p class="muted">Nothing scheduled.</p>'}</div></div>
    </div>
  </div>`;
}
function askGo(q){ location.hash = '#/ai-assistant?q='+encodeURIComponent(q); }
function dashAnimate(u, subs, att, sg){
  const cg = document.getElementById('c-cgpa'), s2=document.getElementById('c-sgpa'), a=document.getElementById('c-att');
  if(cg){ countUp(cg, Number(u.currentCgpa)||0, 2); countUp(s2, sg, 2); countUp(a, att, 1, '%');
    requestAnimationFrame(()=>{ document.getElementById('b-cgpa').style.width=Math.min(100,(u.currentCgpa/10)*100)+'%';
      document.getElementById('b-sgpa').style.width=Math.min(100,(sg/10)*100)+'%'; document.getElementById('b-att').style.width=Math.min(100,att)+'%'; }); }
}

/* ---- ACADEMICS ---- */
function pageAcademics(){
  const u = currentUser();
  const sem = u.sem;
  const subs = getSubjects(u.id, sem);
  const sg = sgpaOf(subs), att = attendanceOf(subs);
  const credits = subs.reduce((a,s)=>a+Number(s.credits||0),0);
  return `<div class="page-head"><div><span class="pill blue">COURSE REGISTRY</span><h1 style="margin-top:10px">Academics & Course Manager</h1>
    <p>Track current, past and future curriculum. Click any subject for its assessment inspector.</p></div>
    <button class="btn" onclick="openAddSubject()">＋ Add subject</button></div>
  <div class="tabs">${[1,2,3,4,5,6,7,8].map(s=>{const st=s<sem?'Completed':s===sem?'In Progress':'Upcoming';return `<button class="tab ${s===sem?'on':''}" onclick="switchSem(${s})">Sem ${s} • ${st}</button>`;}).join('')}</div>
  <div class="grid g4 stagger">
    <div class="card"><div class="muted">Registered credits</div><div class="stat-num">${credits}</div></div>
    <div class="card"><div class="muted">Semester SGPA</div><div class="stat-num">${sg||'—'}</div></div>
    <div class="card"><div class="muted">Avg attendance</div><div class="stat-num">${att||'—'}${att?'%':''}</div></div>
    <div class="card"><div class="muted">Term status</div><div style="margin-top:8px"><span class="pill ${sem===u.sem?'cyan':'blue'}">${sem<u.sem?'Completed':sem===u.sem?'In Progress':'Upcoming'}</span></div></div>
  </div>
  <div class="card" style="margin-top:14px"><h3>📚 Sem ${sem} subjects (${subs.length})</h3>
    ${subs.length?`<div style="overflow-x:auto"><table class="tbl"><tr><th>Code</th><th>Subject</th><th>Credits</th><th>Faculty</th><th>Score</th><th>Att.</th><th>Target</th><th>Standing</th><th></th></tr>
    ${subs.map(s=>{const st=standingOf(s);return `<tr><td style="font-family:var(--mono)"><b>${s.code}</b></td><td><b>${s.name}</b></td><td>${s.credits}</td><td>${s.faculty||'—'}</td><td><b>${s.score}%</b></td><td>${s.attendance}%</td><td>${s.targetGrade||'A'}</td><td><span class="pill ${st.cls}">${st.label}</span></td>
    <td style="white-space:nowrap"><button class="btn small ghost" onclick="openInspector('${s.id}')">Inspect</button> <button class="btn small danger" onclick="delSub('${s.id}')">✕</button></td></tr>`;}).join('')}</table></div>`
    :`<p class="muted" style="margin-top:10px">No subjects in Sem ${sem} yet. Click <b>Add subject</b> to register your first course.</p>`}
    <div class="card" style="margin-top:14px;background:rgba(99,102,241,.07)"><h3>🗓️ Assessment milestones</h3><div id="dl-list">${deadlineListHTML()}</div>
      <div class="form-row"><div class="field"><label>Title</label><input id="dl-title" class="inp" placeholder="e.g. DBMS Midterm"></div>
      <div class="field"><label>Type</label><select id="dl-type" class="inp"><option>Midterm</option><option>Quiz</option><option>Assignment</option><option>Lab</option><option>Final</option></select></div></div>
      <div class="form-row"><div class="field"><label>Subject code</label><input id="dl-code" class="inp" placeholder="CS501"></div>
      <div class="field"><label>Date</label><input id="dl-date" type="date" class="inp"></div></div>
      <button class="btn small" style="margin-top:12px" onclick="addDeadline()">＋ Add milestone</button></div></div>`;
}
function deadlineListHTML(){
  const u = currentUser();
  const dls = getDeadlines(u.id).slice().sort((a,b)=>a.date.localeCompare(b.date));
  if(!dls.length) return '<p class="muted">No milestones yet.</p>';
  return dls.map(d=>{const days=daysUntil(d.date);return `<div class="sub-row"><div style="flex:1"><b>${d.title}</b> <span class="pill ${days<0?'blue':days<=3?'rose':days<=7?'amber':'green'}">${days<0?'Done':days===0?'Today':'In '+days+'d'}</span><div style="font-size:12px;color:var(--muted)">${d.subjectCode} • ${d.type} • ${d.date}</div></div><button class="btn small danger" onclick="delDeadline('${d.id}')">✕</button></div>`;}).join('');
}
function openAddSubject(){
  openModal(`<h3>＋ Add enrolled subject</h3><p class="muted">Registers a course in Semester ${currentUser().sem}.</p>
  <div class="form-row"><div class="field"><label>Course name *</label><input id="ns-name" class="inp" placeholder="Analysis of Algorithms"></div>
  <div class="field"><label>Course code *</label><input id="ns-code" class="inp" placeholder="CS501"></div></div>
  <div class="form-row"><div class="field"><label>Credits (1–6)</label><input id="ns-cr" type="number" min="1" max="6" value="3" class="inp"></div>
  <div class="field"><label>Target grade</label><select id="ns-grade" class="inp">${Object.keys(GRADE_PCT).map(g=>`<option>${g}</option>`).join('')}</select></div></div>
  <div class="form-row"><div class="field"><label>Faculty</label><input id="ns-fac" class="inp" placeholder="Dr. Sharma"></div>
  <div class="field"><label>Current score %</label><input id="ns-score" type="number" min="0" max="100" value="70" class="inp"></div></div>
  <div class="field"><label>Attendance %</label><input id="ns-att" type="number" min="0" max="100" value="80" class="inp"></div>
  <div style="display:flex;gap:10px;margin-top:16px"><button class="btn ghost" style="flex:1" onclick="closeModal()">Cancel</button><button class="btn" style="flex:2" onclick="saveNewSubject()">Save subject</button></div>`);
}
function saveNewSubject(){
  const u = currentUser();
  const name=document.getElementById('ns-name').value.trim(), code=document.getElementById('ns-code').value.trim().toUpperCase();
  if(!name||!code) return toast('Name and code are required','err');
  saveSubject(u.id, u.sem, {name, code, credits:Number(document.getElementById('ns-cr').value)||3,
    targetGrade:document.getElementById('ns-grade').value, faculty:document.getElementById('ns-fac').value.trim(),
    score:Number(document.getElementById('ns-score').value)||0, attendance:Number(document.getElementById('ns-att').value)||0, trend:0, assessments:[]});
  closeModal(); toast(`✅ ${code} registered`); rerender();
}
function delSub(id){ const u=currentUser(); deleteSubject(u.id,u.sem,id); toast('Subject removed','warn'); rerender(); }
function openInspector(id){
  const u = currentUser();
  const s = getSubjects(u.id,u.sem).find(x=>x.id===id);
  if(!s) return;
  const tot = s.assessments.reduce((a,x)=>a+Number(x.weight||0),0);
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center"><h3>🔍 ${s.code} — inspector</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
  <p class="muted">${s.name} • ${s.credits} credits • Score ${s.score}% • Target ${s.targetGrade}</p>
  <div class="bar" style="margin:12px 0"><i style="width:${s.score}%"></i></div>
  <h4 style="margin-top:8px">Assessments (${s.assessments.length})</h4>
  ${s.assessments.map((a,i)=>`<div class="sub-row"><div style="flex:1"><b>${a.type}</b><div style="font-size:12px;color:var(--muted)">${a.obtained}/${a.max} • weight ${a.weight}% • <b>${Math.round(a.obtained/a.max*100)}%</b></div></div><button class="btn small danger" onclick="delAssess('${s.id}',${i})">✕</button></div>`).join('')||'<p class="muted">No assessments yet — add internals / midsem below.</p>'}
  <div class="form-row"><div class="field"><label>Type</label><select id="as-type" class="inp"><option>Internal Assessment 1</option><option>Internal Assessment 2</option><option>Midterm Examination</option><option>Lab / Project</option><option>Quiz</option><option>End-Sem Projection</option></select></div>
  <div class="field"><label>Weight %</label><input id="as-w" type="number" value="20" class="inp"></div></div>
  <div class="form-row"><div class="field"><label>Max marks</label><input id="as-max" type="number" value="20" class="inp"></div>
  <div class="field"><label>Obtained</label><input id="as-obt" type="number" value="14" class="inp"></div></div>
  <div style="display:flex;gap:10px;margin-top:14px"><button class="btn ghost" style="flex:1" onclick="closeModal()">Done</button><button class="btn" style="flex:2" onclick="addAssess('${s.id}')">＋ Add assessment</button></div>
  <p class="muted" style="margin-top:10px">Total weightage: ${tot}% (internal ${u.intW} / endterm ${u.endW} in Settings)</p>`);
}
function addAssess(sid){
  const u=currentUser();
  const s=getSubjects(u.id,u.sem).find(x=>x.id===sid);
  s.assessments.push({type:document.getElementById('as-type').value, weight:Number(document.getElementById('as-w').value)||0, max:Number(document.getElementById('as-max').value)||20, obtained:Number(document.getElementById('as-obt').value)||0});
  const avg = s.assessments.length? Math.round(s.assessments.reduce((a,x)=>a+(x.obtained/x.max*100),0)/s.assessments.length) : s.score;
  s.score = Math.min(100,avg); s.trend = 1;
  saveSubject(u.id,u.sem,s); openInspector(sid); rerender(true);
}
function delAssess(sid,i){ const u=currentUser(); const s=getSubjects(u.id,u.sem).find(x=>x.id===sid); s.assessments.splice(i,1); saveSubject(u.id,u.sem,s); openInspector(sid); rerender(true); }
function addDeadline(){
  const u=currentUser();
  const t=document.getElementById('dl-title').value.trim(), d=document.getElementById('dl-date').value;
  if(!t||!d) return toast('Title and date required','err');
  const arr=getDeadlines(u.id);
  arr.push({id:uid(), title:t, type:document.getElementById('dl-type').value, subjectCode:document.getElementById('dl-code').value.trim().toUpperCase()||'GEN', date:d});
  saveDeadlines(u.id,arr); toast('📌 Milestone added'); rerender();
}
function delDeadline(id){ const u=currentUser(); saveDeadlines(u.id, getDeadlines(u.id).filter(d=>d.id!==id)); rerender(); }
