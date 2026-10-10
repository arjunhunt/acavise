/* Pages part 2: targets, priority, planner, AI, settings */
function pageTargets(){
  const u = currentUser();
  const subs = getSubjects(u.id, u.sem);
  const req = requiredSGPA(u.targetCgpa, u.currentCgpa, u.sem, u.totalCredits);
  const fe = feasibility(req);
  const proj = endtermProjection(req);
  const comp = completedCredits(u.sem), rem = u.totalCredits - comp;
  return `<div class="page-head"><div><span class="pill blue">REVERSE CALCULATOR</span><h1 style="margin-top:10px">Target Marks & CGPA Simulator</h1>
  <p>Exact scores needed to graduate with your goal. Edit the target — everything recalculates live.</p></div></div>
  <div class="grid g3 stagger">
    <div class="card hover"><div class="muted">🎯 Target graduation CGPA</div><div class="stat-num" id="t-req" style="color:var(--acc2)">${req>10?'—':req.toFixed(2)}</div>
      <div class="field"><label>Adjust target (0–10)</label><input id="tg-inp" type="range" min="6" max="10" step="0.05" value="${u.targetCgpa}" style="width:100%;accent-color:#6366f1" oninput="liveTarget(this.value)"></div>
      <div style="display:flex;gap:8px;align-items:center"><input id="tg-num" type="number" step="0.05" min="0" max="10" value="${u.targetCgpa}" class="inp" onchange="liveTarget(this.value)"></div></div>
    <div class="card hover"><div class="muted">📍 Current standing</div><div class="stat-num">${Number(u.currentCgpa).toFixed(2)}</div>
      <div style="font-size:13px;color:var(--muted)">${comp} credits done • ${rem} remaining of ${u.totalCredits}<br>Sem ${u.sem} • ${u.gradingScale}-point scale</div>
      <div class="field"><label>Update current CGPA</label><input id="cg-inp" type="number" step="0.01" min="0" max="10" value="${u.currentCgpa}" class="inp" onchange="updateUser({currentCgpa:Number(this.value)});rerender()"></div></div>
    <div class="card hover" style="border-color:var(--${fe.cls==='green'?'ok':fe.cls==='amber'?'warn':fe.cls==='orange'?'orange':'crit'})"><div class="muted">📈 Required future SGPA</div>
      <div class="stat-num">${req>10?'∞':req.toFixed(2)}</div><span class="pill ${fe.cls}">${fe.label}</span>
      <p class="muted" style="margin-top:8px">≈ <b style="color:var(--text)">${proj}%</b> average across upcoming final exams.</p>
      <div class="formula-box">(${u.targetCgpa}×${u.totalCredits} − ${u.currentCgpa}×${comp}) / ${rem} = ${req.toFixed(2)}</div></div>
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card"><h3>📊 Feasibility scale</h3>
      ${[[8.5,'Highly Achievable','green','≤ 8.50 — steady pace holds.'],[9.3,'Challenging','amber','8.51–9.30 — needs focused korrekt.'],[10,'Near-Perfection','orange','9.31–10.00 — topper-level consistency.'],[99,'Infeasible','rose','> 10.00 — revise target or add credits.']].map(f=>`
      <div class="sub-row"><span class="pill ${f[2]}">${f[1]}</span><span class="muted" style="font-size:12.5px">${f[3]}</span><b style="margin-left:auto;font-family:var(--mono);color:${req<=f[0]?'var(--ok)':'var(--muted)'}">${req<=f[0]?'◀ YOU':''}</b></div>`).join('')}</div>
    <div class="card"><h3>🎓 Course-by-course target matrix</h3><p class="muted">Min endterm score for each target grade (${u.intW}/${u.endW} weighting).</p>
      <div style="overflow-x:auto"><table class="tbl"><tr><th>Course</th><th>Internal</th><th>Target</th><th>Needs in finals</th><th>Verdict</th></tr>
      ${subs.map(s=>{const need=requiredEndterm(s,u);const ok=need<=100;return `<tr><td><b>${s.code}</b><br><span style="color:var(--muted);font-size:12px">${s.name}</span></td><td>${s.score}% (${s.credits}cr)</td><td>${s.targetGrade}</td>
      <td><b style="color:${need>100?'var(--crit)':need>85?'var(--warn)':'var(--ok)'}">${need>100?'∞ impossible':need+'%'}</b></td>
      <td><span class="pill ${ok?'green':'rose'}">${ok?'On track':'Recalibrate'}</span></td></tr>`;}).join('')||'<tr><td colspan="5" style="color:var(--muted)">Add subjects to build the matrix.</td></tr>'}</table></div></div>
  </div>`;
}
function liveTarget(v){
  v = Math.min(10,Math.max(0,Number(v)||0));
  document.getElementById('tg-num').value = v; document.getElementById('tg-inp').value = v;
  updateUser({targetCgpa:v});
  clearTimeout(window.__tgt);
  window.__tgt = setTimeout(()=>rerender(true), 450);
}

/* ---- PRIORITY ---- */
function pagePriority(){
  const u = currentUser();
  const subs = getSubjects(u.id, u.sem);
  const ranked = subs.map(s=>({...s, ps:priorityScore(s), urg:urgencyOf(s)})).sort((a,b)=>b.ps-a.ps);
  return `<div class="page-head"><div><span class="pill blue">ROI RANKING ENGINE</span><h1 style="margin-top:10px">Study Priority Engine</h1>
  <p>Ranked by return-on-investment: <span style="font-family:var(--mono)">Priority = Deficit + Credits×2</span>. Stop deciding — start executing Rank #1.</p></div>
  <div style="display:flex;gap:10px"><button class="btn small ghost" onclick="exportBrief()">⬇ Export brief (.txt)</button><button class="btn small" onclick="location.hash='#/planner'">→ Push to planner</button></div></div>
  ${ranked.length?`<div class="grid" style="gap:12px">`+ranked.map((s,i)=>`
    <div class="card hover anim-in" style="animation-delay:${i*0.07}s;border-left:4px solid ${s.urg.cls==='rose'?'var(--crit)':s.urg.cls==='amber'?'var(--warn)':'var(--ok)'}">
      <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
        <div style="font-family:var(--mono);font-size:13px;color:var(--muted)">RANK<br><span style="font-size:30px;font-weight:800;color:var(--text)">#${i+1}</span></div>
        <div style="flex:1;min-width:220px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><h3>${s.code} — ${s.name}</h3><span class="pill ${s.urg.cls}">${s.urg.label}</span><span class="pill blue">${s.credits} Credits — Wt ${Math.round(s.credits/Math.max(1,ranked.reduce((a,x)=>a+x.credits,0))*100)}%</span></div>
          <p style="font-size:13.5px;margin-top:7px"><b>Diagnosis:</b> ${diagnosis(s)}</p>
          <p style="font-size:13.5px;color:var(--muted)"><b style="color:var(--acc2)">Action:</b> ${studyAction(s)}</p>
          <div class="bar ${s.urg.cls}"><i style="width:${s.ps}%"></i></div></div>
        <div style="text-align:center;min-width:90px"><div style="font-family:var(--mono);font-size:30px;font-weight:800">${s.ps}</div><div class="muted" style="font-size:11px">PRIORITY / 100</div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">Score ${s.score}% • Att ${s.attendance}%</div></div>
      </div></div>`).join('')+`</div>`
  :`<div class="card"><p class="muted">No subjects to rank. <span class="link" onclick="location.hash='#/academics'">Add courses first →</span></p></div>`}
  <div class="card" style="margin-top:14px"><h3>🧮 How the score works</h3><div class="formula-box">Deficit = max(0, 100 − Score) • Priority = min(100, max(10, Deficit + Credits×2)) • High &lt;65% • Medium 65–80% • Low ≥80%</div></div>`;
}
function exportBrief(){
  const u = currentUser();
  const subs = getSubjects(u.id,u.sem).map(s=>({...s,ps:priorityScore(s)})).sort((a,b)=>b.ps-a.ps);
  const txt = `AcaVise Study Brief — ${u.name} (Sem ${u.sem}) — ${new Date().toLocaleString()}\nCGPA ${u.currentCgpa} → Target ${u.targetCgpa} | Required SGPA ${requiredSGPA(u.targetCgpa,u.currentCgpa,u.sem,u.totalCredits)}\n\n` +
    subs.map((s,i)=>`#${i+1} ${s.code} ${s.name} — Priority ${s.ps}/100 (${urgencyOf(s).label})\n   Score ${s.score}% | Att ${s.attendance}% | ${s.credits}cr\n   Why: ${diagnosis(s)}\n   Do: ${studyAction(s)}\n`).join('\n');
  const b = new Blob([txt],{type:'text/plain'}); const aEl = document.createElement('a');
  aEl.href = URL.createObjectURL(b); aEl.download = 'acavise-study-brief.txt'; aEl.click();
  toast('📄 Study brief downloaded');
}

/* ---- PLANNER ---- */
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function pagePlanner(){
  const u = currentUser();
  const plan = getPlan(u.id);
  const doneMin = plan.filter(p=>p.done).reduce((a,p)=>a+Number(p.durationMin||0),0);
  const totMin = plan.reduce((a,p)=>a+Number(p.durationMin||0),0);
  const pct = totMin? Math.round(doneMin/totMin*100):0;
  const today = new Date().toLocaleDateString('en-US',{weekday:'long'});
  const streak = calcStreak(plan);
  const hrs = (m)=> (m/60).toFixed(1)+'h';
  return `<div class="page-head"><div><span class="pill blue">EXECUTION BOARD</span><h1 style="margin-top:10px">Smart Weekly Planner</h1>
  <p>Priorities → calendar blocks. Check off sessions; hours and streak update live. 🔥 <b class="streak">${streak}-day streak</b></p></div>
  <button class="btn" onclick="openAddBlock()">＋ Add study block</button></div>
  <div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>${hrs(doneMin)} completed of ${hrs(totMin)} scheduled</b><b>${pct}%</b></div><div class="bar ${pct>=70?'green':pct>=35?'amber':'rose'}"><i style="width:${pct}%"></i></div></div>
  <div class="week-grid stagger">${DAYS.map(d=>{
    const blocks = plan.filter(p=>p.day===d);
    const dm = blocks.filter(p=>p.done).reduce((a,p)=>a+Number(p.durationMin),0);
    return `<div class="day-col ${d===today?'today':''}"><h4>${d.toUpperCase()}${d===today?' • TODAY':''} — ${dm}m</h4>
    ${blocks.map(b=>`<div class="task ${b.done?'done':''}"><div class="t-top"><input type="checkbox" ${b.done?'checked':''} onchange="toggleBlock('${b.id}')"><b>${b.subjectCode}</b><span class="dot" style="background:${b.priority==='High'?'var(--crit)':b.priority==='Medium'?'var(--warn)':'var(--ok)'}"></span><span style="margin-left:auto;color:var(--muted);font-size:11px">${b.durationMin}m</span></div>
    <div style="margin-top:5px">${b.task}</div><div style="color:var(--muted);font-size:11px;margin-top:3px">🕗 ${b.timeSlot} • ${b.priority}</div>
    <button class="btn small danger" style="margin-top:6px;padding:4px 9px;font-size:11px" onclick="delBlock('${b.id}')">Delete</button></div>`).join('')||'<div style="font-size:12px;color:var(--muted)">No blocks — rest or add one.</div>'}</div>`;}).join('')}</div>`;
}
function calcStreak(plan){
  if(!plan.some(p=>p.done)) return 0;
  const daysDone = new Set(plan.filter(p=>p.done).map(()=> 'done'));
  return Math.min(12, 1 + Math.floor(plan.filter(p=>p.done).length/2));
}
function openAddBlock(){
  const u = currentUser();
  const subs = getSubjects(u.id,u.sem);
  openModal(`<h3>＋ New study block</h3><p class="muted">Linked to your enrolled subjects.</p>
  <div class="form-row"><div class="field"><label>Day</label><select id="nb-day" class="inp">${DAYS.map(d=>`<option>${d}</option>`).join('')}</select></div>
  <div class="field"><label>Subject</label><select id="nb-sub" class="inp">${subs.map(s=>`<option value="${s.code}">${s.code} — ${s.name}</option>`).join('')||'<option value="GEN">GEN — General</option>'}</select></div></div>
  <div class="field"><label>Task / topic</label><input id="nb-task" class="inp" placeholder="Review Dynamic Programming Graphs"></div>
  <div class="form-row"><div class="field"><label>Duration</label><select id="nb-dur" class="inp"><option value="30">30 min</option><option value="45" selected>45 min</option><option value="60">60 min</option><option value="90">90 min</option><option value="120">120 min</option></select></div>
  <div class="field"><label>Priority</label><select id="nb-pri" class="inp"><option>High</option><option selected>Medium</option><option>Low</option></select></div></div>
  <div class="field"><label>Time slot</label><input id="nb-slot" class="inp" placeholder="08:00 PM – 09:30 PM" value="06:00 PM – 07:00 PM"></div>
  <div style="display:flex;gap:10px;margin-top:14px"><button class="btn ghost" style="flex:1" onclick="closeModal()">Cancel</button><button class="btn" style="flex:2" onclick="saveBlock()">Schedule block</button></div>`);
}
function saveBlock(){
  const u=currentUser(); const plan=getPlan(u.id);
  plan.push({id:uid(), day:document.getElementById('nb-day').value, subjectCode:document.getElementById('nb-sub').value, task:document.getElementById('nb-task').value.trim()||'Study session', durationMin:Number(document.getElementById('nb-dur').value), priority:document.getElementById('nb-pri').value, timeSlot:document.getElementById('nb-slot').value, done:false});
  savePlan(u.id,plan); closeModal(); toast('📅 Block scheduled'); rerender();
}
function toggleBlock(id){ const u=currentUser(); const plan=getPlan(u.id); const b=plan.find(p=>p.id===id); b.done=!b.done; savePlan(u.id,plan); if(b.done) toast('✅ Nice — session complete'); rerender(true); }
function delBlock(id){ const u=currentUser(); savePlan(u.id, getPlan(u.id).filter(p=>p.id!==id)); rerender(); }

/* ---- AI ASSISTANT ---- */
function pageAI(q){
  const u = currentUser();
  const subs = getSubjects(u.id,u.sem);
  const ranked = [...subs].sort((a,b)=>priorityScore(b)-priorityScore(a));
  const top = ranked[0];
  const pills = [`What should I study today?`, top?`What do I need in ${top.name} for an ${top.targetGrade||'A'}?`:null, `How does my attendance look?`, `Explain the Target CGPA formula.`].filter(Boolean);
  return `<div class="page-head"><div><span class="pill blue">GROUNDED IN SEM ${u.sem}</span><h1 style="margin-top:10px">✨ AI Academic Assistant</h1>
  <p>Knows your ${subs.length} subjects, scores, attendance, target ${Number(u.targetCgpa).toFixed(2)} and #1 priority${top?` (<b>${top.code}</b>)`:''}. Rule-based engine — instant, offline, explainable.</p></div></div>
  <div class="card"><div class="chat-box" id="chat"></div>
    <div style="margin:12px 0">${pills.map(p=>`<span class="prompt-chip" onclick="aiAsk('${p.replace(/'/g,"\\'")}')">${p}</span>`).join('')}</div>
    <div class="chat-input-row"><input id="ai-inp" class="inp" placeholder="Ask anything — e.g. 'What do I need in CS501 for an A?' " onkeydown="if(event.key==='Enter')aiSend()"><button class="btn" onclick="aiSend()">Send ➤</button></div></div>
  <div class="card" style="margin-top:14px"><h3>🧠 What the assistant sees</h3><p class="muted">${subs.map(s=>`${s.code} ${s.score}%/${s.attendance}%`).join(' • ')||'No subjects yet.'} | CGPA ${u.currentCgpa} → ${u.targetCgpa} | Cutoff ${u.cutoff}% | ${u.intW}/${u.endW}</p></div>`;
}
function aiInit(prefill){
  const box = document.getElementById('ai-inp');
  pushMsg('bot', `Hey **${currentUser().name.split(' ')[0]}** 👋 — I'm your AcaVise advisor. Ask me what to study, what you need for any grade, or how attendance looks. Try a pill below 👇`);
  if(prefill){ setTimeout(()=>aiAsk(prefill), 500); }
}
function pushMsg(who, text){
  const c = document.getElementById('chat'); if(!c) return;
  const d = document.createElement('div'); d.className='msg '+who; d.innerHTML = md(text);
  c.appendChild(d); c.scrollTop = c.scrollHeight; return d;
}
function aiSend(){ const i=document.getElementById('ai-inp'); const v=i.value.trim(); if(!v) return; i.value=''; aiAsk(v); }
function aiAsk(q){
  pushMsg('user', q);
  const t = document.createElement('div'); t.className='msg bot'; t.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  document.getElementById('chat').appendChild(t);
  setTimeout(()=>{ t.innerHTML = md(brain(q)); document.getElementById('chat').scrollTop = 1e6; }, 650);
}
function brain(qraw){
  const u = currentUser();
  const subs = getSubjects(u.id,u.sem);
  const q = qraw.toLowerCase();
  const ranked = [...subs].sort((a,b)=>priorityScore(b)-priorityScore(a));
  const top = ranked[0];
  const req = requiredSGPA(u.targetCgpa,u.currentCgpa,u.sem,u.totalCredits);
  const att = attendanceOf(subs);
  const hit = subs.find(s=>q.includes(s.code.toLowerCase())||q.includes(s.name.toLowerCase()));
  if(/(today|study|focus|priority|first)/.test(q)){
    if(!top) return `Add subjects in **Academics** first, then I'll rank them.`;
    return `### ⚡ Today's battle plan\n- Start with **${top.code} — ${top.name}** (Priority **${priorityScore(top)}/100**, ${urgencyOf(top).label} urgency).\n- Why: ${diagnosis(top)}\n- Do: ${studyAction(top)}\n- Next: **${ranked[1]?ranked[1].code+' ('+priorityScore(ranked[1])+'/100)':'—'}** after a 10-min break.\n- Recommended block: \`60–90 min\` on ${top.code} at your peak hour. Check it off in **Planner** 🔥`;
  }
  if(hit || /(need|require|grade|marks|a\+|\bo\b|a\b)/.test(q)){
    const s = hit || top;
    if(!s) return `Tell me a subject code (e.g. CS501) after adding courses.`;
    const need = requiredEndterm(s,u);
    return `### 🎯 ${s.code} — path to **${s.targetGrade}**\n- Current internal: **${s.score}%** (${s.credits} credits), attendance **${s.attendance}%**.\n- Grade threshold: **~${GRADE_PCT[s.targetGrade]||70}%** overall with your **${u.intW}/${u.endW}** weighting.\n- You need **${need>100?'over 100% — recalibrate target or boost internals':need+'% in the endterm'}**.\n- ${need>100?'Talk to faculty about re-evaluation / extra internals, and shift focus to high-credit winnable subjects.':need>85?'Tough but doable — 2 past papers + daily 45-min blocks.':'Very achievable — hold steady with revision.'}`;
  }
  if(/(attend)/.test(q)){
    const low = subs.filter(s=>s.attendance<u.cutoff);
    return `### 🛡️ Attendance report — **${att}%** weighted (cutoff ${u.cutoff}%)\n- Status: **${attTag(att,u.cutoff).label}**\n${low.length?low.map(s=>`- ⚠️ **${s.code}**: ${s.attendance}% — attend the next 3 classes straight.`).join('\n'):'- ✅ Every subject is above cutoff. Keep it there.'}\n- Formula: \`Σ(Att × Credits)/ΣCredits\``;
  }
  if(/(target|cgpa|formula|sgpa|feasib)/.test(q)){
    const fe = feasibility(req);
    return `### 📐 Target CGPA formula\n- \`Required SGPA = (Target×Total − Current×Completed)/Remaining\`\n- Yours: \`(${u.targetCgpa}×${u.totalCredits} − ${u.currentCgpa}×${completedCredits(u.sem)})/${u.totalCredits-completedCredits(u.sem)} = ${req}\`\n- Verdict: **${fe.label}** — needs ~**${endtermProjection(req)}%** in finals.\n- Tip: raise winnable high-credit subjects first; they move SGPA fastest.`;
  }
  if(/(plan|schedule|week|tomorrow)/.test(q)) return `Open **Weekly Planner** and add a block: pick the day, choose **${top?top.code:'your top subject'}**, set 45–90 min, High priority. Checking it off grows your 🔥 streak.`;
  if(/(hello|hi|hey)/.test(q)) return `Hello! 👋 I see **${subs.length} subjects**, CGPA **${u.currentCgpa} → ${u.targetCgpa}**, attendance **${att}%**. Ask me **"What should I study today?"** to begin.`;
  return `### Here's your snapshot\n- **Top focus:** ${top?`**${top.code}** (${priorityScore(top)}/100) — ${studyAction(top)}`:'add subjects first'}\n- **Required SGPA:** ${req} (${feasibility(req).label})\n- **Attendance:** ${att}% (${attTag(att,u.cutoff).label})\n- Try: \`What do I need in ${top?top.code:'CS501'} for an A?\` or \`How does my attendance look?\``;
}

/* ---- SETTINGS ---- */
function pageSettings(){
  const u = currentUser();
  return `<div class="page-head"><div><span class="pill blue">CONTROL CENTER</span> ${isCloud()?'<span class="pill green">☁️ Cloud sync ON</span>':'<span class="pill amber">📱 This-browser storage</span>'}<h1 style="margin-top:10px">Settings, Rules & Theme</h1><p>University rules drive every formula. Changes apply instantly everywhere.</p></div>
  <button class="btn danger small" onclick="if(confirm('Sign out?')){logout()}">Sign out</button></div>
  <div class="grid g2">
    <div class="card"><h3>👤 Academic profile</h3>
      <div class="field"><label>Full name</label><input id="s-name" class="inp" value="${u.name}"></div>
      <div class="field"><label>Email</label><input class="inp" value="${u.email}" disabled></div>
      <div class="field"><label>College</label><input id="s-college" class="inp" value="${u.college||''}" placeholder="Your institute"></div>
      <div class="form-row"><div class="field"><label>Branch</label><select id="s-branch" class="inp">${['Computer Engineering','Information Technology','Electronics','Mechanical','Electrical','Civil'].map(b=>`<option ${b===u.branch?'selected':''}>${b}</option>`).join('')}</select></div>
      <div class="field"><label>Semester</label><select id="s-sem" class="inp">${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s==u.sem?'selected':''}>${s}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="field"><label>Current CGPA</label><input id="s-cgpa" type="number" step="0.01" class="inp" value="${u.currentCgpa}"></div>
      <div class="field"><label>Target CGPA</label><input id="s-tcgpa" type="number" step="0.01" class="inp" value="${u.targetCgpa}"></div></div>
      <button class="btn" style="margin-top:14px" onclick="saveProfile()">💾 Save profile</button></div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card"><h3>🏛️ University academic rules</h3>
        <div class="form-row"><div class="field"><label>Grading scale</label><select id="s-scale" class="inp"><option value="10" ${u.gradingScale==='10'?'selected':''}>10-point (IN/EU)</option><option value="4" ${u.gradingScale==='4'?'selected':''}>4-point (US)</option></select></div>
        <div class="field"><label>Attendance cutoff</label><select id="s-cut" class="inp">${[75,80,85].map(c=>`<option ${c==u.cutoff?'selected':''}>${c}%</option>`).join('')}</select></div></div>
        <div class="form-row"><div class="field"><label>Total degree credits</label><select id="s-tot" class="inp">${[120,130,140,160,180].map(c=>`<option ${c==u.totalCredits?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Internal / Endterm weight</label><select id="s-w" class="inp"><option value="50-50" ${u.intW==50?'selected':''}>50 – 50</option><option value="40-60" ${u.intW==40?'selected':''}>40 – 60</option><option value="30-70" ${u.intW==30?'selected':''}>30 – 70</option></select></div></div>
        <button class="btn ghost" style="margin-top:14px" onclick="saveRules()">Apply rules</button></div>
      <div class="card"><h3>🔔 Notification preferences</h3>
        ${[['notifExam','Exam & assessment countdowns (7-day)'],['notifAtt','Attendance shortfall warnings'],['notifDigest','Weekly performance digest']].map(n=>`
        <label style="display:flex;gap:10px;align-items:center;padding:9px 0;font-size:14px;font-weight:600;cursor:pointer"><input type="checkbox" id="s-${n[0]}" ${u[n[0]]?'checked':''} style="width:18px;height:18px;accent-color:#6366f1"> ${n[1]}</label>`).join('')}
        <button class="btn ghost" style="margin-top:10px" onclick="saveNotifs()">Save preferences</button></div>
      <div class="card"><h3>🎨 Appearance</h3><div class="tabs">
        ${['Light','Dark','System'].map(t=>`<button class="tab ${(u.theme||'dark').toLowerCase()===t.toLowerCase()?'on':''}" onclick="setTheme('${t.toLowerCase()}')">${t==='Light'?'☀️':t==='Dark'?'🌙':'💻'} ${t}</button>`).join('')}</div>
        <p class="muted">System follows your OS preference automatically.</p>
        <div class="card" style="margin-top:12px;background:rgba(251,113,133,.07)"><h3>🗑️ Danger zone</h3><p class="muted">Clears all subjects, planner and deadlines for this account.</p><button class="btn small danger" style="margin-top:8px" onclick="wipe()">Reset all my data</button></div></div>
    </div></div>`;
}
function saveProfile(){ updateUser({name:document.getElementById('s-name').value.trim(), college:document.getElementById('s-college').value.trim(), branch:document.getElementById('s-branch').value, sem:Number(document.getElementById('s-sem').value), currentCgpa:Number(document.getElementById('s-cgpa').value)||0, targetCgpa:Number(document.getElementById('s-tcgpa').value)||9}); toast('✅ Profile saved'); rerender(); }
function saveRules(){ const w=document.getElementById('s-w').value.split('-'); updateUser({gradingScale:document.getElementById('s-scale').value, cutoff:Number(document.getElementById('s-cut').value), totalCredits:Number(document.getElementById('s-tot').value), intW:Number(w[0]), endW:Number(w[1])}); toast('🏛️ Rules applied everywhere'); rerender(); }
function saveNotifs(){ updateUser({notifExam:document.getElementById('s-notifExam').checked, notifAtt:document.getElementById('s-notifAtt').checked, notifDigest:document.getElementById('s-notifDigest').checked}); toast('🔔 Preferences saved'); }
function setTheme(t){ updateUser({theme:t}); DB.write('acavise_theme',t); applyTheme(); toast(`🎨 ${t} theme on`); rerender(); }
function wipe(){ if(!confirm('Delete ALL subjects + planner + deadlines?')) return; const u=currentUser(); DB.write(K.subjects(u.id),{}); DB.write(K.plan(u.id),[]); DB.write(K.deadlines(u.id),[]); toast('Data reset','warn'); rerender(); }
