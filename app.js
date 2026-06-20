/* ─────────────────────────────────────────────
   EL MECHTEL — APP.JS
   SPA router + state machine + vues principales
   ───────────────────────────────────────────── */

// ── GLOBAL STATE ──
const STATE = {
  view: 'home',
  currentNursery: null,
  // filtres onglet Plants
  pCat: '', pAgree: true, pQuery: '', pSort: 'rating', pRegion: '',
  // filtres onglet Pépinières
  nCat: '', nSort: 'rating',
  // données persistées
  leads: [],
  // devis groupé en cours (une seule pépinière)
  quote: { nid:null, items:[] },
};
const QUOTA = 12;

// ── INIT (le landing gère l'affichage ; l'app s'initialise en arrière-plan) ──
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderView('home');
  bindSidebar();
});

// ── STORAGE ──
function loadFromStorage(){
  try{ const s=JSON.parse(localStorage.getItem('mechtel_state')||'{}'); STATE.leads = s.leads||[]; }catch(e){}
}
function saveToStorage(){
  try{ localStorage.setItem('mechtel_state', JSON.stringify({leads:STATE.leads})); }catch(e){}
}
function addLead(l){ l.overQuota = STATE.leads.length>=QUOTA; STATE.leads.unshift(l); saveToStorage(); if(STATE.view==='espace') renderEspace(); }
function resetLeads(){ STATE.leads=[]; saveToStorage(); if(STATE.view==='espace') renderEspace(); toast('Contacts réinitialisés.'); }

// ── SIDEBAR ──
function bindSidebar(){
  $$('.nav-item').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const view=btn.dataset.view, cat=btn.dataset.cat;
      if(view==='category'&&cat!==undefined) navigateTo('produits', cat);
      else if(view) navigateTo(view);
    });
  });
}

// ── ROUTER ──
function navigateTo(view, param=null){
  STATE.view = view;
  if(view==='produits'){ STATE.pCat = param || ''; }
  if(view==='pepiniere'){ STATE.currentNursery = param; }
  // sidebar active state
  $$('.nav-item').forEach(b=>b.classList.remove('active'));
  if(view==='produits' && param){ $(`[data-cat="${param}"]`)?.classList.add('active'); }
  else if(view==='produits'){ $('[data-view="produits"]')?.classList.add('active'); }
  else if(view==='pepiniere'){ $('[data-view="pepinieres"]')?.classList.add('active'); }
  else { $(`[data-view="${view}"]`)?.classList.add('active'); }
  renderView(view, param);
  if(typeof renderQuoteFab==='function') renderQuoteFab();
  document.getElementById('main')?.scrollTo({top:0,behavior:'smooth'});
}

function renderView(view, param){
  const app = document.getElementById('app-view');
  if(!app) return;
  switch(view){
    case 'home':       app.innerHTML = renderHome();       bindHome(); break;
    case 'produits':   app.innerHTML = renderProducts();   bindProducts(); break;
    case 'pepinieres': app.innerHTML = renderNurseries();  bindNurseries(); break;
    case 'pepiniere':  app.innerHTML = renderNurseryProfile(param||STATE.currentNursery||'n1'); break;
    case 'espace':     app.innerHTML = renderEspaceHTML(); renderEspace(); break;
    default:           app.innerHTML = renderHome(); bindHome();
  }
}

/* ═════════════════════════ HOME / DASHBOARD ═════════════════════════ */
function renderHome(){
  const nbNur = Object.values(NURSERIES).filter(n=>n.agree).length;
  const nbVar = LISTINGS.length;
  const featured = featuredNurseryIds();
  return `
  <div class="view-home">
    <div class="home-header">
      <h1>Bienvenue sur <span class="grad-text">El Mechtel</span></h1>
      <p>Le réseau de confiance du végétal en Tunisie — ${nbNur} pépinières agréées, ${nbVar} variétés.</p>
    </div>

    <div class="stats-bar">
      <div class="stat-card glass"><div class="stat-label">Pépinières agréées</div><div class="stat-value" id="h-nur">0</div><div class="stat-sub">contrôlées CRDA</div></div>
      <div class="stat-card glass"><div class="stat-label">Variétés</div><div class="stat-value" id="h-var">0</div><div class="stat-sub">référencées</div></div>
      <div class="stat-card glass"><div class="stat-label">Gouvernorats</div><div class="stat-value">8</div><div class="stat-sub">couverts</div></div>
      <div class="stat-card glass"><div class="stat-label">Note moyenne</div><div class="stat-value">4,8<span style="font-size:16px;color:var(--muted)">/5</span></div><div class="stat-sub">sur avis vérifiés</div></div>
    </div>

    <div class="section-title">Explorer par catégorie</div>
    <div class="home-cats">
      ${Object.keys(CATS).map(k=>{const c=CATS[k],n=LISTINGS.filter(l=>l.cat===k).length;return `
        <div class="home-cat glass" onclick="navigateTo('produits','${k}')" style="--cc:${c.color}">
          <div class="hc-ico" style="background:linear-gradient(155deg,${c.tint},rgba(255,255,255,.4))">${SVG[k]}</div>
          <div class="hc-meta"><b>${c.label}</b><span>${n} variété${n>1?'s':''}</span></div>
          <svg class="hc-go" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 4l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>`;}).join('')}
    </div>

    <div class="section-title">Pépinières à la une</div>
    <div class="nur-grid">${featured.map((id,i)=>nurseryCard(id,i)).join('')}</div>
  </div>`;
}
// Ordre d'affichage en page d'accueil :
//  - si l'admin a classé des pépinières (home_rank défini) → on respecte ce classement manuel
//  - sinon (règle par défaut) → les pépinières agréées, triées par note décroissante, max 4
function featuredNurseryIds(){
  const all = Object.keys(NURSERIES).filter(id=>NURSERIES[id].about);
  const ranked = all.filter(id=>NURSERIES[id].home_rank!=null)
                    .sort((a,b)=>NURSERIES[a].home_rank-NURSERIES[b].home_rank);
  if(ranked.length) return ranked;                          // classement manuel admin
  return all.filter(id=>NURSERIES[id].agree)                // règle par défaut
            .sort((a,b)=>NURSERIES[b].rating-NURSERIES[a].rating)
            .slice(0,4);
}
function bindHome(){
  countUp($('#h-nur'), Object.values(NURSERIES).filter(n=>n.agree).length);
  countUp($('#h-var'), LISTINGS.length);
}

/* ═════════════════════════ PLANTS ═════════════════════════ */
function renderProducts(){
  return `
  <div class="view-section">
    <div class="vs-head"><h1>Trouvez vos <span class="grad-text">plants</span></h1><p>Comparez les plants des pépinières agréées partout en Tunisie.</p></div>
    <div class="search glass">
      <div class="field"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4" stroke-linecap="round"/></svg><input id="p-q" type="text" placeholder="Olivier Chemlali, amandier, géranium…" value="${STATE.pQuery}"></div>
      <div class="field" style="flex:0 1 200px"><svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 18s6-5.3 6-10A6 6 0 104 8c0 4.7 6 10 6 10z"/><circle cx="10" cy="8" r="2"/></svg><select id="p-region"></select></div>
    </div>
    <div class="toolbar">
      <div class="chips" id="p-chips"></div><div class="spacer"></div>
      <label class="toggle-agree ${STATE.pAgree?'on':''}" id="p-agree"><span class="switch"></span> Agréées seulement</label>
      <select class="sort" id="p-sort"><option value="rating">Mieux notées</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select>
    </div>
    <p class="count" id="p-count"></p>
    <div class="grid" id="p-grid"></div>
  </div>`;
}
function bindProducts(){
  const regions=[...new Set(Object.values(NURSERIES).map(n=>n.region))].sort();
  $('#p-region').innerHTML='<option value="">Toute la Tunisie</option>'+regions.map(r=>`<option ${STATE.pRegion===r?'selected':''}>${r}</option>`).join('');
  $('#p-sort').value=STATE.pSort;
  buildPChips();
  $('#p-q').addEventListener('input',e=>{STATE.pQuery=e.target.value;drawProducts();});
  $('#p-region').addEventListener('change',e=>{STATE.pRegion=e.target.value;drawProducts();});
  $('#p-sort').addEventListener('change',e=>{STATE.pSort=e.target.value;drawProducts();});
  $('#p-agree').addEventListener('click',function(){STATE.pAgree=!STATE.pAgree;this.classList.toggle('on',STATE.pAgree);drawProducts();});
  drawProducts();
}
function buildPChips(){
  let h=`<button class="chip ${STATE.pCat===''?'on':''}" onclick="setPCat('')">Tout</button>`;
  for(const k in CATS) h+=`<button class="chip ${STATE.pCat===k?'on':''}" onclick="setPCat('${k}')"><span class="dot" style="background:${CATS[k].color}"></span>${CATS[k].label}</button>`;
  $('#p-chips').innerHTML=h;
}
function setPCat(c){STATE.pCat=c;buildPChips();drawProducts();}
function drawProducts(){
  const q=STATE.pQuery.trim().toLowerCase();
  let rows=LISTINGS.filter(l=>{const nur=NURSERIES[l.n];
    if(STATE.pCat&&l.cat!==STATE.pCat)return false;
    if(STATE.pAgree&&!nur.agree)return false;
    if(STATE.pRegion&&nur.region!==STATE.pRegion)return false;
    if(q&&!(l.plant+' '+l.variety+' '+CATS[l.cat].label+' '+nur.name+' '+nur.region).toLowerCase().includes(q))return false;
    return true;});
  rows.sort((a,b)=>STATE.pSort==='price-asc'?a.pmin-b.pmin:STATE.pSort==='price-desc'?b.pmax-a.pmax:NURSERIES[b.n].rating-NURSERIES[a.n].rating);
  $('#p-count').innerHTML=`<b>${rows.length}</b> résultat${rows.length>1?'s':''}`+(STATE.pRegion?` à ${STATE.pRegion}`:'')+(STATE.pCat?` · ${CATS[STATE.pCat].label}`:'');
  $('#p-grid').innerHTML = rows.length ? rows.map((l,i)=>productCard(l,i)).join('')
    : `<div class="empty glass"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5" stroke-linecap="round"/></svg><h3>Aucun plant trouvé</h3><p>Élargissez la région ou désactivez « agréées seulement ».</p></div>`;
  attachTilt();
}

/* ═════════════════════════ PÉPINIÈRES ═════════════════════════ */
function renderNurseries(){
  return `
  <div class="view-section">
    <div class="vs-head"><h1>Les <span class="grad-text">pépinières</span> agréées</h1><p>Chaque pépinière a sa vitrine : histoire, spécialités, catalogue et avis. Cliquez pour découvrir.</p></div>
    <div class="toolbar">
      <div class="chips" id="n-chips"></div><div class="spacer"></div>
      <select class="sort" id="n-sort"><option value="rating">Mieux notées</option><option value="since">Plus anciennes</option><option value="orders">Plus de plants livrés</option></select>
    </div>
    <p class="count" id="n-count"></p>
    <div class="nur-grid" id="n-grid"></div>
  </div>`;
}
function bindNurseries(){
  $('#n-sort').value=STATE.nSort;
  buildNChips();
  $('#n-sort').addEventListener('change',e=>{STATE.nSort=e.target.value;drawNurseries();});
  drawNurseries();
}
function buildNChips(){
  let h=`<button class="chip ${STATE.nCat===''?'on':''}" onclick="setNCat('')">Toutes</button>`;
  for(const k in CATS) h+=`<button class="chip ${STATE.nCat===k?'on':''}" onclick="setNCat('${k}')"><span class="dot" style="background:${CATS[k].color}"></span>${CATS[k].label}</button>`;
  $('#n-chips').innerHTML=h;
}
function setNCat(c){STATE.nCat=c;buildNChips();drawNurseries();}
function drawNurseries(){
  let ids=Object.keys(NURSERIES).filter(id=>NURSERIES[id].about);
  if(STATE.nCat) ids=ids.filter(id=>NURSERIES[id].cat===STATE.nCat||LISTINGS.some(l=>l.n===id&&l.cat===STATE.nCat));
  ids.sort((a,b)=>{const A=NURSERIES[a],B=NURSERIES[b];if(STATE.nSort==='since')return A.since-B.since;if(STATE.nSort==='orders')return B.orders-A.orders;return B.rating-A.rating;});
  $('#n-count').innerHTML=`<b>${ids.length}</b> pépinière${ids.length>1?'s':''} agréée${ids.length>1?'s':''}`+(STATE.nCat?` · ${CATS[STATE.nCat].label}`:'');
  $('#n-grid').innerHTML = ids.length ? ids.map((id,i)=>nurseryCard(id,i)).join('') : `<div class="empty glass"><h3>Aucune pépinière</h3></div>`;
}

/* ═════════════════════════ ESPACE PÉPINIÈRE ═════════════════════════ */
function renderEspaceHTML(){
  return `
  <div class="view-section">
    <div class="vs-head"><h1>Pépinière El Baraka — <span class="grad-text">Béja</span></h1><p>Tableau de bord · vos contacts acheteurs ce mois-ci.</p></div>
    <div class="dash-tools"><button onclick="resetLeads()">↺ Réinitialiser la démo</button></div>
    <div class="plan-banner"><span class="pill">Formule Pro</span>
      <div><h3>120 TND / mois</h3><div style="font-size:.84rem;opacity:.9">12 contacts inclus · puis 9 TND / contact (CPL)</div></div>
      <div class="quota"><b><span id="lead-count">0</span><span style="font-size:1rem;opacity:.7"> / 12</span></b><span>contacts utilisés</span></div>
      <div class="quota-bar"><i id="quota-fill" style="width:0%"></i></div>
    </div>
    <div class="stat-row">
      <div class="stat glass"><small>Contacts reçus</small><b id="stat-total">0</b><span>ce mois</span></div>
      <div class="stat glass"><small>Inclus dans la formule</small><b id="stat-inc">0</b><span>sur 12</span></div>
      <div class="stat glass"><small>Contacts supplémentaires</small><b id="stat-cpl">0</b><span>facturés au lead</span></div>
      <div class="stat glass"><small>Vues de la vitrine</small><b>1 284</b><span>+18 % vs mois passé</span></div>
    </div>
    <div class="leads-panel glass"><div class="ph"><h3>Demandes des acheteurs</h3><span>Répondez sur WhatsApp — la vente se conclut entre vous.</span></div><div id="leads-list"></div></div>
    <p class="note">Démo : chaque « Demander un devis » (onglet Plants) crée un contact ici — c'est ce que la pépinière paie, des contacts qualifiés, pas une commission.</p>
  </div>`;
}
function renderEspace(){
  const leads=STATE.leads,total=leads.length,inc=Math.min(total,QUOTA),cpl=Math.max(0,total-QUOTA);
  const set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v;};
  set('lead-count',inc);set('stat-total',total);set('stat-inc',inc);set('stat-cpl',cpl);
  const qf=$('#quota-fill');if(qf)qf.style.width=Math.min(100,total/QUOTA*100)+'%';
  const list=$('#leads-list');if(!list)return;
  if(!total){list.innerHTML=`<div class="empty-leads"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#7a8a80" stroke-width="1.5" style="margin-bottom:12px"><path d="M3 8l9 6 9-6M3 8v10h18V8M3 8l9-5 9 5" stroke-linejoin="round"/></svg><p>Aucun contact pour l'instant.<br>Allez dans <b onclick="navigateTo('produits')" style="cursor:pointer;color:var(--teal-deep)">Plants</b> et cliquez « Demander un devis ».</p></div>`;return;}
  list.innerHTML=leads.map((d,i)=>`<div class="lead-item ${i===0?'new-flash':''}">
    <div class="lead-av">${(d.name[0]||'A').toUpperCase()}</div>
    <div class="lead-info"><b>${d.name}</b><p>${d.plant} · ${d.variety} — ${d.qty}</p></div>
    <span class="lead-tag ${d.overQuota?'cpl':'inc'}">${d.overQuota?'+9 TND · CPL':'Inclus'}</span>
    <span class="lead-when">${d.when}</span>
    <button class="lead-wa" title="Répondre sur WhatsApp" onclick="toast('Ouverture de WhatsApp… (démo)')">${waIcon(18)}</button>
  </div>`).join('');
}

// Export Node (tests uniquement) — bloc inerte dans un navigateur classique.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STATE, QUOTA, featuredNurseryIds };
}
