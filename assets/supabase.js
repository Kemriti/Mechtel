/* ============================================================
   El Mechtel — SUPABASE.JS
   Config + fonctions partagées : auth, données, upload photos.
   ------------------------------------------------------------
   ⚠️  À CONFIGURER (voir GUIDE-SUPABASE.md) :
       Remplace les 2 valeurs ci-dessous par CELLES DE TON PROJET.
       Ces 2 clés sont PUBLIQUES (anon) — aucun risque à les mettre ici.
       Ne mets JAMAIS la clé "service_role" dans un fichier front.
   ============================================================ */

const SUPABASE_URL  = "https://nqlsukckqjnfiyipsrzo.supabase.co";   // ← à remplacer
const SUPABASE_ANON = "sb_publishable_eTmK9cvpCNVupAxytk_8Yg_eU12SW7Y";            // ← à remplacer

// Client Supabase (la lib est chargée via <script> dans les pages)
const sb = (window.supabase && SUPABASE_URL.startsWith("https://V") === false)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

// Indique si Supabase est configuré ; sinon les pages publiques retombent
// sur les données locales (produits.js / pepinieres.js) — mode démo.
function sbReady(){ return !!sb; }

/* ───────────── AUTH (admin) ───────────── */
async function sbLogin(email, password){
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error) throw error;
  return data.user;
}
async function sbLogout(){ await sb.auth.signOut(); }
async function sbCurrentUser(){
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

/* ───────────── LECTURE (public) ───────────── */
// Renvoie les pépinières sous forme d'objet { id: {...} } comme NURSERIES.
async function sbFetchNurseries(){
  const { data, error } = await sb.from('nurseries').select('*').order('since',{ascending:true});
  if(error) throw error;
  const map = {};
  data.forEach(n => { map[n.id] = rowToNursery(n); });
  return map;
}
async function sbFetchProducts(){
  const { data, error } = await sb.from('products').select('*').order('id',{ascending:true});
  if(error) throw error;
  return data.map(rowToProduct);
}

/* ───────────── ÉCRITURE (admin) ───────────── */
async function sbSaveNursery(row){
  const { data, error } = await sb.from('nurseries').upsert(row).select().single();
  if(error) throw error;
  return data;
}
async function sbDeleteNursery(id){
  const { error } = await sb.from('nurseries').delete().eq('id', id);
  if(error) throw error;
}
async function sbSaveProduct(row){
  const { data, error } = await sb.from('products').upsert(row).select().single();
  if(error) throw error;
  return data;
}
async function sbDeleteProduct(id){
  const { error } = await sb.from('products').delete().eq('id', id);
  if(error) throw error;
}

/* ───────────── UPLOAD PHOTOS (admin) ─────────────
   bucket "photos" (public en lecture). Retourne l'URL publique. */
async function sbUploadPhoto(file, pathPrefix){
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${pathPrefix}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('photos').upload(path, file, { upsert:true, cacheControl:'3600' });
  if(error) throw error;
  const { data } = sb.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}

/* ───────────── MAPPING base ⇄ objets de l'app ─────────────
   Les colonnes JSON (specialties, certs, history, revs) sont stockées
   en jsonb côté Supabase et utilisées telles quelles côté app. */
function rowToNursery(n){
  return {
    id:n.id, name:n.name, region:n.region, agree:n.agree, since:n.since, rating:n.rating,
    cat:n.cat, reviews:n.reviews, orders:n.orders, area:n.area, cap:n.cap,
    tagline:n.tagline, about:n.about,
    photo:n.photo || null, home_rank:(n.home_rank ?? null),
    specialties:n.specialties || [], certs:n.certs || [],
    history:n.history || [], revs:n.revs || [],
  };
}
function nurseryToRow(o){
  return {
    id:o.id, name:o.name, region:o.region, agree:!!o.agree, since:+o.since||null, rating:+o.rating||null,
    cat:o.cat, reviews:+o.reviews||0, orders:+o.orders||0, area:o.area, cap:o.cap,
    tagline:o.tagline, about:o.about, photo:o.photo||null,
    home_rank:(o.home_rank===''||o.home_rank==null)?null:+o.home_rank,
    specialties:o.specialties||[], certs:o.certs||[], history:o.history||[], revs:o.revs||[],
  };
}
function rowToProduct(p){
  return { id:p.id, cat:p.cat, plant:p.plant, variety:p.variety, n:p.nursery_id,
           pmin:p.pmin, pmax:p.pmax, unit:p.unit, san:p.san, photo:p.photo||null, stock:p.stock||'ok' };
}
function productToRow(o){
  return { id:+o.id, cat:o.cat, plant:o.plant, variety:o.variety, nursery_id:o.n,
           pmin:+o.pmin, pmax:+o.pmax, unit:o.unit, san:o.san, photo:o.photo||null, stock:o.stock||'ok' };
}
