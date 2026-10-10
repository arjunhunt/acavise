/* UI helpers: toast, modal, theme, shell */
function toast(msg, type='ok'){
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.innerHTML = `<span>${type==='ok'?'✅':type==='warn'?'⚠️':'⛔'}</span><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(8px)'; setTimeout(()=>el.remove(),300); }, 3200);
}
function openModal(html){
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
function closeModal(){ document.getElementById('modal-backdrop').classList.add('hidden'); }
document.addEventListener('click', e=>{
  if(e.target.id==='modal-backdrop') closeModal();
  if(e.target.closest('[data-close-notif]')) document.getElementById('notif-backdrop').classList.add('hidden');
  if(e.target.id==='notif-backdrop') document.getElementById('notif-backdrop').classList.add('hidden');
  if(e.target.id==='cmdk-backdrop') document.getElementById('cmdk-backdrop').classList.add('hidden');
});
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); }
  if(e.key==='Escape'){ closeModal(); document.getElementById('cmdk-backdrop').classList.add('hidden'); document.getElementById('notif-backdrop').classList.add('hidden'); const dd=document.getElementById('profile-dd'); if(dd) dd.remove(); }
});
function applyTheme(){
  const u = currentUser();
  const pref = u?.theme || DB.read('acavise_theme','dark');
  let eff = pref;
  if(pref==='system') eff = matchMedia('(prefers-color-scheme: light)').matches ? 'light':'dark';
  document.documentElement.dataset.theme = eff;
}
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', applyTheme);
function countUp(el, to, dec=0, suffix=''){
  const from = 0, t0 = performance.now(), dur = 900;
  function f(t){ const p = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-p,3);
    el.textContent = (from+(to-from)*e).toFixed(dec)+suffix;
    if(p<1) requestAnimationFrame(f); }
  requestAnimationFrame(f);
}
function observeReveals(){
  document.querySelectorAll('.reveal:not(.vis)').forEach(el=>{
    new IntersectionObserver((es,o)=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('vis'); o.disconnect(); } }),{threshold:.12}).observe(el);
  });
}
const NAV = [
  {r:'dashboard', icon:'📊', label:'Dashboard'},
  {r:'academics', icon:'📚', label:'Academics'},
  {r:'targets', icon:'🎯', label:'Target Marks'},
  {r:'priority', icon:'⚡', label:'Study Priorities'},
  {r:'planner', icon:'📅', label:'Weekly Planner'},
  {r:'ai-assistant', icon:'✨', label:'AI Assistant'},
  {r:'settings', icon:'⚙️', label:'Settings'},
];
function shell(active, inner){
  const u = currentUser();
  const subs = getSubjects(u.id, u.sem);
  const sg = sgpaOf(subs);
  const pct = Math.min(100, Math.max(0, ((u.currentCgpa||0)/ (u.targetCgpa||10))*100));
  const notifs = buildNotifications(u, subs, getDeadlines(u.id));
  const initials = (u.name||'S').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return `<div class="app-shell">
  <aside class="sidebar">
    <div class="brand" onclick="location.hash='#/dashboard'"><img src="logo.png" class="brand-logo" alt="AcaVise"></div>
    <nav class="nav">${NAV.map(n=>`<a href="#/${n.r}" class="${active===n.r?'active':''}"><span class="ico">${n.icon}</span>${n.label}</a>`).join('')}</nav>
    <div class="status-card"><div style="font-weight:800">Sem ${u.sem} • ${u.branch.split(' ')[0]}</div>
      <div class="row"><span>SGPA</span><b>${sg||'—'}</b></div>
      <div class="row"><span>Target</span><b>${Number(u.targetCgpa).toFixed(2)}</b></div>
      <div class="mini-bar"><i style="width:${pct}%"></i></div></div>
    <div class="profile-chip" onclick="location.hash='#/settings'"><div class="avatar">${initials}</div><div style="min-width:0"><div style="font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div><div style="font-size:11.5px;color:var(--muted)">${u.email}</div></div></div>
  </aside>
  <div class="main">
    <div class="topbar">
      <select onchange="switchSem(this.value)" title="Global semester switcher">${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s==u.sem?'selected':''}>Sem ${s}</option>`).join('')}</select>
      <div class="search-trigger" onclick="openSearch()">🔍 Search subjects, pages… <kbd>Ctrl K</kbd></div>
      <button class="icon-btn" onclick="openNotifs()" title="Notifications">🔔${notifs.length?`<span class="badge-dot">${notifs.length}</span>`:''}</button>
      <div class="profile-menu-wrap"><button class="icon-btn" onclick="toggleProfile(event)" title="Profile">👤</button><div id="pm-anchor"></div></div>
    </div>
    <div class="content anim-in">${inner}</div>
  </div>
  <nav class="mobile-nav"><div class="mn-in">
    <a href="#/dashboard" class="${active==='dashboard'?'active':''}">📊<span>Home</span></a>
    <a href="#/academics" class="${active==='academics'?'active':''}">📚<span>Courses</span></a>
    <a href="#/priority" class="${active==='priority'?'active':''}">⚡<span>Focus</span></a>
    <a href="#/planner" class="${active==='planner'?'active':''}">📅<span>Plan</span></a>
    <a href="#/settings" class="${active==='settings'?'active':''}">☰<span>Menu</span></a>
  </div></nav>
  </div>`;
}
function switchSem(v){ const u=updateUser({sem:Number(v)}); toast(`Switched to Semester ${v}`); rerender(); }
function toggleProfile(e){
  e.stopPropagation();
  const old = document.getElementById('profile-dd'); if(old){ old.remove(); return; }
  const u = currentUser();
  const pct = Math.min(100,((u.currentCgpa||0)/(u.targetCgpa||10))*100);
  const d = document.createElement('div');
  d.id='profile-dd'; d.className='dropdown';
  d.innerHTML = `<div style="font-weight:800">${u.name}</div><div style="font-size:12.5px;color:var(--muted)">${u.email}</div>
    <div style="font-size:12px;margin-top:10px;color:var(--muted)">Graduation target</div>
    <div style="font-weight:800">${Number(u.currentCgpa).toFixed(2)} / ${Number(u.targetCgpa).toFixed(2)} CGPA</div>
    <div class="mini-bar"><i style="width:${pct}%"></i></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn small ghost" onclick="location.hash='#/settings'">Settings</button><button class="btn small danger" onclick="logout();location.hash='#/'">Sign out</button></div>`;
  document.getElementById('pm-anchor').appendChild(d);
  setTimeout(()=>document.addEventListener('click',()=>d.remove(),{once:true}),10);
}
function openNotifs(){
  const u = currentUser();
  const subs = getSubjects(u.id, u.sem);
  const n = buildNotifications(u, subs, getDeadlines(u.id));
  document.getElementById('notif-sub').textContent = n.length ? `${n.length} active alert(s)` : 'All clear — nice work';
  document.getElementById('notif-list').innerHTML = n.length ? n.map(x=>`<div class="notif"><b>${x.icon} ${x.title}</b><div style="color:var(--muted);margin-top:4px">${x.desc}</div></div>`).join('')
    : `<div class="notif">🎉 No warnings. Attendance is safe and no deadlines within 7 days.</div>`;
  document.getElementById('notif-backdrop').classList.remove('hidden');
}
function openSearch(){
  document.getElementById('cmdk-backdrop').classList.remove('hidden');
  const inp = document.getElementById('cmdk-input'); inp.value=''; renderSearch('');
  setTimeout(()=>inp.focus(),30);
  inp.oninput = ()=>renderSearch(inp.value);
}
function renderSearch(q){
  const u = currentUser(); q = (q||'').toLowerCase();
  let items = [];
  if(u){
    const all = getAllSubjects(u.id);
    Object.keys(all).forEach(sem=>all[sem].forEach(s=>{
      if(!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
        items.push({icon:'📘', label:`${s.code} — ${s.name}`, sub:`Sem ${sem} • ${s.score}%`, go:`#/academics`});
    }));
    getDeadlines(u.id).forEach(d=>{
      if(!q || d.title.toLowerCase().includes(q)) items.push({icon:'🗓️', label:d.title, sub:`${d.date} • ${d.subjectCode}`, go:'#/dashboard'});
    });
  }
  NAV.forEach(n=>{ if(!q || n.label.toLowerCase().includes(q)) items.push({icon:n.icon, label:n.label, sub:'Page', go:'#/'+n.r}); });
  items = items.slice(0,12);
  document.getElementById('cmdk-results').innerHTML = items.length
    ? items.map(i=>`<div class="cmdk-item" onclick="location.hash='${i.go}';document.getElementById('cmdk-backdrop').classList.add('hidden')"><span>${i.icon}</span><b>${i.label}</b><small>${i.sub}</small></div>`).join('')
    : `<div style="padding:20px;color:var(--muted);font-size:14px">No matches for “${q}”.</div>`;
}
