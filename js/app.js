/* Router + boot */
function rerender(silent){
  route();
  if(!silent) window.scrollTo({top:0});
}
function route(){
  applyTheme();
  const app = document.getElementById('app');
  const raw = (location.hash || '#/').replace('#','');
  const [_, path, qs] = raw.match(/^\/([^?]*)(\?.*)?$/) || [null,'',''];
  const query = Object.fromEntries(new URLSearchParams(qs||''));
  const me = currentUser();

  // public
  if(!me){
    if(path==='signup') app.innerHTML = pageSignup();
    else if(path==='login') app.innerHTML = pageLogin();
    else app.innerHTML = pageLanding();
    observeReveals(); initReveal(); return;
  }
  if(!me.onboarded && path!=='onboarding'){ location.hash = '#/onboarding'; return; }

  let inner = '', active = path, after = null;
  if(path===''||path==='dashboard'){ const subs=getSubjects(me.id,me.sem); inner = shell('dashboard', pageDashboard()); after=()=>dashAnimate(me,subs,attendanceOf(subs),sgpaOf(subs)); }
  else if(path==='academics') inner = shell('academics', pageAcademics());
  else if(path==='targets') inner = shell('targets', pageTargets());
  else if(path==='priority') inner = shell('priority', pagePriority());
  else if(path==='planner') inner = shell('planner', pagePlanner());
  else if(path==='ai-assistant'){ inner = shell('ai-assistant', pageAI(query.q)); after=()=>aiInit(query.q); }
  else if(path==='settings') inner = shell('settings', pageSettings());
  else if(path==='onboarding') { app.innerHTML = pageOnboarding(); return; }
  else inner = shell('dashboard', pageDashboard());
  app.innerHTML = inner;
  observeReveals();
  if(after) after();
}
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  const o = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); o.unobserve(e.target);} }),{threshold:.1});
  els.forEach(el=>o.observe(el));
}
async function boot(){
  if(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase){
    try{
      window.__sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      document.getElementById('app').innerHTML = `<div class="auth-wrap"><div class="card auth-card" style="text-align:center"><img src="logo.png" class="brand-logo lg" style="margin:0 auto" alt="AcaVise"><h1 style="margin-top:12px">Signing you in…</h1><p class="muted">Syncing your academic cloud ☁️</p></div></div>`;
      const { data } = await window.__sb.auth.getSession();
      if(data && data.session){ try{ await ensureCloudUser(data.session.user); }catch(e){ console.warn(e); } }
    }catch(e){ console.warn('cloud boot failed, local mode', e); }
  }
  applyTheme(); route(); initReveal();
}
window.addEventListener('hashchange', route);
window.addEventListener('load', ()=>{
  if(!localStorage.getItem('acavise_theme')) localStorage.setItem('acavise_theme','dark');
  boot();
});
