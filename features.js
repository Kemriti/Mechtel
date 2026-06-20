/* ─────────────────────────────────────────────
   EL MECHTEL — FEATURES.JS
   1. Atomes UI réutilisables (sceau, étoiles, cartes)
   2. Système de mise en relation (modale + lead)
   3. Vitrine pépinière (profil complet)
   ───────────────────────────────────────────── */

const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const fmt = n => Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/,'');
const priceLabel = l => l.pmin===l.pmax ? `${fmt(l.pmin)} TND` : `${fmt(l.pmin)}–${fmt(l.pmax)} TND`;

/* ── SVG atoms ── */
function seal(size=42){return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 56 56" fill="none">
  <circle cx="28" cy="28" r="26" fill="rgba(255,255,255,.92)" stroke="#0d9488" stroke-width="1.5"/>
  <circle cx="28" cy="28" r="21" fill="none" stroke="#0d9488" stroke-width=".8" stroke-dasharray="2 2"/>
  <path d="M21 28l5 5 9-10" stroke="#0d9488" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="28" y="13.5" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="4.6" font-weight="800" fill="#0d9488" letter-spacing=".3">AGRÉÉE</text>
  <text x="28" y="48" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="4" font-weight="700" fill="#0d9488">· CRDA ·</text></svg>`;}
const chk = ()=>`<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M4 10l4 4 8-9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const pin = (s=14)=>`<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 18s6-5.3 6-10A6 6 0 104 8c0 4.7 6 10 6 10z"/><circle cx="10" cy="8" r="2"/></svg>`;
const waIcon = (s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z"/></svg>`;
function stars(r,size=14){let s='';for(let i=1;i<=5;i++){s+=`<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${i<=Math.round(r)?'currentColor':'none'}" stroke="currentColor" stroke-width="${i<=Math.round(r)?0:1.4}"><path d="M8 1l1.8 3.9L14 5.3l-3 3 .8 4.2L8 10.6 4.2 12.5 5 8.3l-3-3 4.2-.4z"/></svg>`;}return s;}

/* ── Toast / count-up / tilt ── */
let _toastT;
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(_toastT);_toastT=setTimeout(()=>t.classList.remove('show'),2600);}
function countUp(el,to,dur=1100){if(!el)return;const start=performance.now();(function step(t){const p=Math.min(1,(t-start)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(e*to);if(p<1)requestAnimationFrame(step);})(start);}
const tiltOK = !window.matchMedia('(prefers-reduced-motion:reduce)').matches && window.matchMedia('(hover:hover)').matches;
function attachTilt(){if(!tiltOK)return;$$('.card.tilt').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(800px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg) translateY(-4px)`;});
  card.addEventListener('pointerleave',()=>card.style.transform='');});}

/* ── Cartes ── */
function stockBadge(p){
  const s=stockOf(p), m=STOCK[s];
  return `<span class="stock-tag" style="background:${m.bg};color:${m.color}"><span class="sdot" style="background:${m.dot}"></span>${m.label}</span>`;
}
function productCard(l,i=0){
  const nur=NURSERIES[l.n],c=CATS[l.cat],out=stockOf(l)==='out';
  return `<article class="card tilt ${out?'is-out':''}" style="animation-delay:${i*40}ms" onclick="openModal(${l.id})" tabindex="0" onkeydown="if(event.key==='Enter')openModal(${l.id})">
    <div class="thumb" style="background:linear-gradient(155deg,${c.tint},rgba(255,255,255,.35))">
      ${l.photo?`<img class="ph-img" src="${l.photo}" alt="${l.plant}" loading="lazy">`:SVG[l.cat]}${nur.agree?seal(40):''}
      <span class="season-tag"><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 8H5V6h2V3h2z"/></svg>${c.season}</span>
      <span class="stock-pos">${stockBadge(l)}</span>
    </div>
    <div class="card-body">
      <span class="cat-label" style="color:${c.color}">${c.label}</span>
      <h3>${l.plant}</h3><div class="variety">${l.variety}</div>
      <div class="nursery-row link" onclick="event.stopPropagation();navigateTo('pepiniere','${l.n}')">${pin(13)}<u>${nur.name}</u> · ${nur.region}</div>
      <div class="card-foot">
        <div class="price"><b>${priceLabel(l)}</b><br><span>/ ${l.unit}</span></div>
        <div class="rating"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.8 3.9L14 5.3l-3 3 .8 4.2L8 10.6 4.2 12.5 5 8.3l-3-3 4.2-.4z"/></svg>${nur.rating}</div>
      </div>
    </div></article>`;
}
function nurseryCard(nid,i=0){
  const nur=NURSERIES[nid],c=CATS[nur.cat]||CATS.olivier;
  return `<article class="nur-card" style="animation-delay:${i*50}ms" onclick="navigateTo('pepiniere','${nid}')" tabindex="0" onkeydown="if(event.key==='Enter')navigateTo('pepiniere','${nid}')">
    <div class="nur-cover" style="background:linear-gradient(155deg,${c.tint},rgba(255,255,255,.35))">
      <div class="crest">${nur.photo?`<img class="ph-img" src="${nur.photo}" alt="${nur.name}" loading="lazy">`:(SVG[nur.cat]||SVG.olivier)}</div>
      <div class="nm"><h3>${nur.name}</h3><div class="loc">${pin(14)}${nur.region} · depuis ${nur.since}</div></div>
      ${nur.agree?`<div class="seal-wrap">${seal(44)}</div>`:''}
    </div>
    <div class="nur-body">
      <p class="tagline">${nur.tagline||''}</p>
      <div class="nur-tags">${(nur.specialties||[]).slice(0,3).map(s=>`<span>${s}</span>`).join('')}</div>
      <div class="nur-foot">
        <div class="mini"><b>${nur.area||'—'}</b><span>SUPERFICIE</span></div>
        <div class="mini"><b>${(nur.orders||0).toLocaleString('fr')}+</b><span>PLANTS LIVRÉS</span></div>
        <div class="rate">${stars(nur.rating,13)} ${nur.rating}</div>
        <div class="go"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 4l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      </div>
    </div></article>`;
}

/* ── Modale fiche + mise en relation ── */
function openModal(id){
  const l=LISTINGS.find(x=>x.id===id),nur=NURSERIES[l.n],c=CATS[l.cat];
  $('#modal').innerHTML=`
    <div class="modal-hero" style="background:linear-gradient(155deg,${c.tint},rgba(255,255,255,.4))">
      <button class="close" onclick="closeModal()" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2"><path d="M5 5l10 10M15 5L5 15" stroke-linecap="round"/></svg></button>
      ${l.photo?`<img class="ph-img" src="${l.photo}" alt="${l.plant}">`:SVG[l.cat]}${nur.agree?seal(58):''}
    </div>
    <div class="modal-body">
      <span class="cat-label" style="color:${c.color}">${c.label}</span>
      <h2>${l.plant}</h2><div class="variety">Variété : <b>${l.variety}</b></div>
      <div class="meta-row">
        <div class="meta"><small>Prix indicatif</small><b class="price-big">${priceLabel(l)}</b></div>
        <div class="meta"><small>Unité</small><b>par ${l.unit}</b></div>
        <div class="meta"><small>Disponibilité</small><b>${stockBadge(l)}</b></div>
        <div class="meta"><small>Pépinière</small><b>${nur.name}</b></div>
        <div class="meta"><small>Région</small><b>${nur.region}</b></div>
        <div class="meta"><small>Note</small><b>★ ${nur.rating} / 5</b></div>
      </div>
      ${nur.agree?`<div class="trust-card">
        <h4><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0d9488" stroke-width="2"><path d="M10 2l6 2.5v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5v-5z" stroke-linejoin="round"/><path d="M7.5 10l1.8 1.8L13 8" stroke-linecap="round" stroke-linejoin="round"/></svg>Carte de confiance El Mechtel</h4>
        <ul class="trust-list">
          <li>${chk()}<div><b>Pépinière agréée</b><small>Contrôlée par le CRDA ${nur.region}</small></div></li>
          <li>${chk()}<div><b>État sanitaire</b><small>${l.san}</small></div></li>
          <li>${chk()}<div><b>Variété confirmée</b><small>${l.variety} — conforme</small></div></li>
          <li>${chk()}<div><b>Établie depuis ${nur.since}</b><small>${new Date().getFullYear()-nur.since} ans d'activité</small></div></li>
        </ul></div>`:`<div class="guarantee warn"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v9M10 15v.5" stroke-linecap="round"/><circle cx="10" cy="10" r="8.5"/></svg>Pépinière non encore agréée — agrément CRDA en cours de vérification.</div>`}
      <div class="guarantee"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l3 3 8-9" stroke-linecap="round" stroke-linejoin="round"/></svg>Variété conforme et plant sain à la réception, ou El Mechtel vous accompagne pour le remplacement.</div>
      <div class="cta-row" id="cta-row">
        ${stockOf(l)==='out'
          ? `<button class="btn-wa" disabled style="opacity:.5;cursor:not-allowed">Indisponible — en rupture</button>`
          : `<button class="btn-wa" onclick="showLeadForm()">${waIcon(20)}Demander un devis</button>
             <button class="btn-ghost" onclick="addToQuote(${l.id})">+ Ajouter au devis groupé</button>`}
        <button class="btn-ghost" onclick="closeModal();navigateTo('pepiniere','${l.n}')">Voir la pépinière</button>
      </div>
      <div class="lead-form" id="leadForm">
        <div class="row"><div><label>Votre nom</label><input id="lf-name" placeholder="Ex. Slim Ben Ali"></div><div><label>Téléphone (WhatsApp)</label><input id="lf-phone" placeholder="+216 …"></div></div>
        <div class="row"><div><label>Quantité souhaitée</label><input id="lf-qty" placeholder="Ex. 50 plants"></div></div>
        <div style="margin-bottom:14px"><label>Message (facultatif)</label><textarea id="lf-msg" placeholder="Disponibilité, livraison vers ma région…"></textarea></div>
        <button class="btn-wa" style="width:100%" onclick="submitLead(${l.id})">Envoyer ma demande</button>
      </div>
      <div class="confirm" id="confirm">
        <div class="check"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h3>Demande envoyée</h3>
        <p><b>${nur.name}</b> a reçu votre demande et vous contactera sur WhatsApp. Vous traitez directement avec la pépinière.</p>
        <button class="btn-ghost" style="margin-top:20px" onclick="closeModal();navigateTo('espace');toast('Votre demande apparaît côté pépinière 👇')">Voir côté pépinière (démo)</button>
      </div>
    </div>`;
  $('#overlay').classList.add('show');document.body.style.overflow='hidden';
}
function showLeadForm(){$('#cta-row').style.display='none';$('#leadForm').classList.add('show');$('#lf-name').focus();}
function closeModal(){const o=$('#overlay');if(o){o.classList.remove('show');document.body.style.overflow='';}}
function submitLead(id){
  const l=LISTINGS.find(x=>x.id===id),nur=NURSERIES[l.n];
  const name=$('#lf-name').value.trim()||"Acheteur",qty=$('#lf-qty').value.trim();
  addLead({name,plant:l.plant,variety:l.variety,qty:qty||"—",nursery:nur.name,when:"À l'instant"});  // addLead défini dans app.js
  $('#leadForm').classList.remove('show');$('#confirm').classList.add('show');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ── Vitrine pépinière (vue dédiée) ── */
function renderNurseryProfile(nid){
  const nur=NURSERIES[nid];
  if(!nur||!nur.about){
    return `<div class="empty glass" style="margin-top:10px"><h3>Vitrine indisponible</h3><p>Réservée aux pépinières agréées du réseau. <a onclick="navigateTo('pepinieres')" style="color:var(--teal-deep);font-weight:700;cursor:pointer">Voir l'annuaire →</a></p></div>`;
  }
  const c=CATS[nur.cat],cat=LISTINGS.filter(l=>l.n===nid);
  return `
    <a class="back-btn glass" onclick="navigateTo('pepinieres')"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>Toutes les pépinières</a>
    <div class="np-cover glass" style="background:linear-gradient(150deg,${c.tint},rgba(255,255,255,.35))">
      <div class="crest">${nur.photo?`<img class="ph-img" src="${nur.photo}" alt="${nur.name}">`:SVG[nur.cat]}</div>
      <div class="np-id">
        <div class="row1"><h1>${nur.name}</h1>${nur.agree?`<span class="np-badge">${chk()}Agréée CRDA</span>`:''}</div>
        <p class="tagline">${nur.tagline}</p>
        <div class="loc">${pin(15)}${nur.region}, Tunisie · établie en ${nur.since}</div>
      </div>
      <div class="np-rate"><div><div class="num">${nur.rating}</div><small>${nur.reviews} avis</small></div><div class="stars">${stars(nur.rating,15)}</div></div>
    </div>
    <div class="np-stats">
      <div class="np-stat glass"><b>${new Date().getFullYear()-nur.since} ans</b><span>D'ACTIVITÉ</span></div>
      <div class="np-stat glass"><b>${nur.area}</b><span>SUPERFICIE</span></div>
      <div class="np-stat glass"><b>${nur.cap.split(' plants')[0]}</b><span>PLANTS / AN</span></div>
      <div class="np-stat glass"><b>${nur.orders.toLocaleString('fr')}+</b><span>PLANTS LIVRÉS</span></div>
    </div>
    <div class="np-grid">
      <div class="np-block glass">
        <h3><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6v.5" stroke-linecap="round"/></svg>À propos</h3>
        <p class="about">${nur.about}</p>
        <h3 style="margin-top:22px"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l4 4 10-11" stroke-linecap="round" stroke-linejoin="round"/></svg>Spécialités</h3>
        <div class="tag-row">${nur.specialties.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
        <h3 style="margin-top:22px"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2l6 2.5v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5v-5z" stroke-linejoin="round"/></svg>Garanties & certifications</h3>
        <ul class="cert-row">${nur.certs.map(x=>`<li>${chk()}${x}</li>`).join('')}</ul>
      </div>
      <div class="np-block glass">
        <h3><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2" stroke-linecap="round"/></svg>Notre histoire</h3>
        <div class="timeline">${nur.history.map(h=>`<div class="tl-item"><div class="y">${h.y}</div><div class="t">${h.t}</div><div class="d">${h.d}</div></div>`).join('')}</div>
      </div>
    </div>
    <div class="np-catalog">
      <h3>Catalogue de ${nur.name} <span style="font-weight:600;color:var(--muted);font-size:1rem">· ${cat.length} variété${cat.length>1?'s':''}</span></h3>
      <div class="mini-grid">${cat.map(l=>{const cc=CATS[l.cat];return `<div class="mini-card glass" onclick="openModal(${l.id})">
        <div class="mini-thumb" style="background:linear-gradient(155deg,${cc.tint},rgba(255,255,255,.35))">${l.photo?`<img class="ph-img" src="${l.photo}" alt="${l.plant}" loading="lazy">`:SVG[l.cat]}${nur.agree?seal(34):''}</div>
        <div class="mini-body"><span class="ml" style="color:${cc.color}">${cc.label}</span><b>${l.plant}</b><div style="font-size:.8rem;color:var(--ink-soft)">${l.variety}</div><div class="mp">${priceLabel(l)}</div></div></div>`;}).join('')}</div>
    </div>
    <div class="np-reviews">
      <h3>Avis vérifiés <span style="font-weight:600;color:var(--muted);font-size:1rem">· ${nur.rating}/5 sur ${nur.reviews} avis</span></h3>
      <div class="rev-grid">${nur.revs.map(rv=>`<div class="rev-card glass"><div class="rev-head"><div class="rev-av">${rv.n[0]}</div><div><b>${rv.n}</b><div class="stars">${stars(rv.r,12)}</div></div><small style="margin-left:auto">${rv.w}</small></div><p>« ${rv.t} »</p></div>`).join('')}</div>
    </div>
    <div class="np-cta glass">
      <div class="lbl">Intéressé par ${nur.name} ?<span>Contactez la pépinière pour un devis — réponse sur WhatsApp.</span></div>
      <button class="btn-wa" style="flex:0 0 auto;padding:0 24px" onclick="openModal(${cat[0]?cat[0].id:1})">${waIcon(20)}Demander un devis</button>
    </div>`;
}

/* ─────────────────────────────────────────────
   DEVIS GROUPÉ — règle : une seule pépinière par devis
   STATE.quote = { nid: <id pépinière>, items: [ {id, qty} ] }
   ───────────────────────────────────────────── */
function addToQuote(id){
  const l = LISTINGS.find(x=>x.id===id);
  if(stockOf(l)==='out'){ toast('Ce plant est en rupture — non ajoutable.'); return; }
  const q = STATE.quote;
  // Règle de filtrage : tous les plants du devis doivent venir de la MÊME pépinière.
  if(q.nid && q.nid !== l.n){
    const cur = NURSERIES[q.nid]?.name || 'une autre pépinière';
    const next = NURSERIES[l.n]?.name || 'cette pépinière';
    const ok = confirm(`Votre devis contient déjà des plants de « ${cur} ».\n\nUn devis ne peut concerner qu'une seule pépinière. Voulez-vous vider le devis et le recommencer avec « ${next} » ?`);
    if(!ok) return;
    q.nid = l.n; q.items = [];
  }
  if(!q.nid) q.nid = l.n;
  if(q.items.some(it=>it.id===id)){ toast('Déjà dans le devis.'); }
  else { q.items.push({id, qty:''}); toast('Ajouté au devis groupé ✓'); }
  closeModal(); renderQuoteFab();
}
function removeFromQuote(id){
  STATE.quote.items = STATE.quote.items.filter(it=>it.id!==id);
  if(!STATE.quote.items.length) STATE.quote.nid = null;
  renderQuoteFab(); openQuote();
}
function clearQuote(){ STATE.quote = {nid:null, items:[]}; renderQuoteFab(); closeModal(); }

function renderQuoteFab(){
  const fab = document.getElementById('quoteFab'); if(!fab) return;
  const n = STATE.quote.items.length;
  if(!n){ fab.style.display='none'; return; }
  fab.style.display='flex';
  fab.innerHTML = `${waIcon(20)} Devis groupé <span class="qcount">${n}</span>`;
  fab.onclick = openQuote;
}
function openQuote(){
  const q = STATE.quote;
  if(!q.items.length){ toast('Votre devis est vide.'); return; }
  const nur = NURSERIES[q.nid];
  const rows = q.items.map(it=>{
    const l = LISTINGS.find(x=>x.id===it.id); const c=CATS[l.cat];
    return `<div class="q-item">
      <div class="q-thumb" style="background:linear-gradient(155deg,${c.tint},rgba(255,255,255,.4))">${l.photo?`<img class="ph-img" src="${l.photo}">`:SVG[l.cat]}</div>
      <div class="q-info"><b>${l.plant}</b><span>${l.variety} · ${priceLabel(l)} / ${l.unit}</span></div>
      <input class="q-qty" type="text" placeholder="Qté" value="${it.qty}" oninput="setQuoteQty(${it.id}, this.value)">
      <button class="q-del" title="Retirer" onclick="removeFromQuote(${it.id})">✕</button>
    </div>`;}).join('');
  $('#modal').innerHTML = `
    <div class="modal-body">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <h2 style="flex:1">Devis groupé</h2>
        <button class="close" style="position:static" onclick="closeModal()" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2"><path d="M5 5l10 10M15 5L5 15" stroke-linecap="round"/></svg></button>
      </div>
      <div class="q-nursery">${nur.agree?chk():''} Pépinière : <b>${nur.name}</b> · ${nur.region}</div>
      <div class="q-list">${rows}</div>
      <div class="lead-form show" style="border-top:1px solid var(--line);margin-top:14px;padding-top:16px">
        <div class="row"><div><label>Votre nom</label><input id="q-name" placeholder="Ex. Slim Ben Ali"></div><div><label>Téléphone (WhatsApp)</label><input id="q-phone" placeholder="+216 …"></div></div>
        <div style="margin-bottom:14px"><label>Message (facultatif)</label><textarea id="q-msg" placeholder="Précisez vos besoins, délais, livraison…"></textarea></div>
        <div class="cta-row">
          <button class="btn-wa" onclick="submitQuote()">${waIcon(20)}Envoyer le devis groupé (${q.items.length} plant${q.items.length>1?'s':''})</button>
          <button class="btn-ghost" onclick="clearQuote()">Vider</button>
        </div>
      </div>
    </div>`;
  $('#overlay').classList.add('show'); document.body.style.overflow='hidden';
}
function setQuoteQty(id, val){ const it=STATE.quote.items.find(x=>x.id===id); if(it) it.qty=val; }
function submitQuote(){
  const q=STATE.quote, nur=NURSERIES[q.nid];
  const name=$('#q-name').value.trim()||'Acheteur';
  const lignes=q.items.map(it=>{const l=LISTINGS.find(x=>x.id===it.id);return `${l.plant} (${l.variety})${it.qty?` ×${it.qty}`:''}`;}).join(' · ');
  addLead({ name, plant:`Devis groupé — ${q.items.length} plants`, variety:lignes, qty:'groupé', nursery:nur.name, when:"À l'instant" });
  clearQuote();
  $('#modal').innerHTML = `<div class="modal-body"><div class="confirm show">
    <div class="check"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h3>Devis groupé envoyé</h3>
    <p><b>${nur.name}</b> a reçu votre demande pour l'ensemble des plants sélectionnés et vous répondra sur WhatsApp.</p>
    <button class="btn-ghost" style="margin-top:20px" onclick="closeModal();navigateTo('espace')">Voir côté pépinière (démo)</button>
  </div></div>`;
  $('#overlay').classList.add('show'); document.body.style.overflow='hidden';
}

// Export Node (tests uniquement) — bloc inerte dans un navigateur classique.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addToQuote, removeFromQuote, clearQuote, setQuoteQty, toast, closeModal };
}
