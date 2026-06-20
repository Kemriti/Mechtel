/* ============================================================
   El Mechtel — CATÉGORIES + VISUELS + CATALOGUE PRODUITS
   Source unique : éditer ce fichier pour ajouter un plant / une catégorie.
   ============================================================ */

const CATS = {
  olivier:  {label:"Oliviers",          color:"#15803d", tint:"rgba(21,128,61,.16)",  season:"Plantation : oct.–fév."},
  fruitier: {label:"Arbres fruitiers",  color:"#c2410c", tint:"rgba(194,65,12,.15)",  season:"Plantation : nov.–fév."},
  ornement: {label:"Plants d'ornement", color:"#0d9488", tint:"rgba(13,148,136,.16)", season:"Plantation : printemps"},
  maraicher:{label:"Plants maraîchers", color:"#65a30d", tint:"rgba(101,163,13,.16)", season:"Selon campagne"},
};

const SVG = {
  olivier:`<svg class="plant" viewBox="0 0 120 120" fill="none"><path d="M60 112c0-30 0-50 17-67 12-12 34-13 34-13s-1 22-13 34c-17 17-38 17-38 17z" fill="#65a30d"/><path d="M60 112c0-30 0-50-17-67C31 33 9 32 9 32s1 22 13 34c17 17 38 17 38 17z" fill="#15803d"/><path d="M60 112V40" stroke="#0f3f29" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="44" r="5" fill="#3d3326"/><circle cx="78" cy="52" r="5" fill="#3d3326"/></svg>`,
  fruitier:`<svg class="plant" viewBox="0 0 120 120" fill="none"><path d="M60 110V60" stroke="#7a4a2a" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="44" r="30" fill="#15803d"/><circle cx="44" cy="40" r="26" fill="#16a34a"/><circle cx="76" cy="40" r="26" fill="#059669"/><circle cx="48" cy="48" r="7" fill="#c2410c"/><circle cx="72" cy="52" r="7" fill="#d97706"/><circle cx="62" cy="36" r="7" fill="#c2410c"/></svg>`,
  ornement:`<svg class="plant" viewBox="0 0 120 120" fill="none"><path d="M60 112V58" stroke="#15803d" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="44" r="11" fill="#d97706"/><g fill="#0d9488"><ellipse cx="60" cy="24" rx="8" ry="14"/><ellipse cx="80" cy="34" rx="14" ry="8"/><ellipse cx="40" cy="34" rx="14" ry="8"/><ellipse cx="74" cy="56" rx="11" ry="7" transform="rotate(40 74 56)"/><ellipse cx="46" cy="56" rx="11" ry="7" transform="rotate(-40 46 56)"/></g><circle cx="60" cy="40" r="6" fill="#fff"/></svg>`,
  maraicher:`<svg class="plant" viewBox="0 0 120 120" fill="none"><rect x="34" y="74" width="52" height="30" rx="4" fill="#9a6a3a"/><path d="M40 74h40M52 74v30M68 74v30" stroke="#7a4a2a" stroke-width="2"/><path d="M60 74V46" stroke="#15803d" stroke-width="4" stroke-linecap="round"/><path d="M60 52c-10-2-16-12-16-12s12-2 16 8M60 58c10-2 16-12 16-12s-12-2-16 8" fill="#16a34a"/><circle cx="60" cy="40" r="7" fill="#65a30d"/></svg>`,
};

const LISTINGS = [
  {id:1,cat:"olivier",plant:"Olivier en godet",variety:"Chemlali Sfax",n:"n2",pmin:4,pmax:8,unit:"plant",san:"Indemne maladies"},
  {id:2,cat:"olivier",plant:"Olivier en godet",variety:"Chétoui",n:"n1",pmin:4,pmax:7,unit:"plant",san:"Indemne maladies"},
  {id:3,cat:"olivier",plant:"Olivier grand sujet",variety:"Oueslati",n:"n1",pmin:18,pmax:38,unit:"sujet",san:"Indemne maladies",stock:"low"},
  {id:4,cat:"olivier",plant:"Olivier en godet",variety:"Picholine",n:"n2",pmin:5,pmax:9,unit:"plant",san:"Sélection pieds-mères"},
  {id:5,cat:"fruitier",plant:"Amandier",variety:"Achaak",n:"n1",pmin:7,pmax:12,unit:"plant",san:"Indemne maladies"},
  {id:6,cat:"fruitier",plant:"Agrumes — Oranger",variety:"Maltaise",n:"n3",pmin:9,pmax:16,unit:"plant",san:"Greffé certifié"},
  {id:7,cat:"fruitier",plant:"Grenadier",variety:"Gabsi",n:"n3",pmin:6,pmax:11,unit:"plant",san:"Indemne maladies"},
  {id:8,cat:"fruitier",plant:"Figuier",variety:"Bouhouli",n:"n1",pmin:6,pmax:10,unit:"plant",san:"Indemne maladies"},
  {id:9,cat:"fruitier",plant:"Pêcher",variety:"Carnival",n:"n3",pmin:8,pmax:14,unit:"plant",san:"Greffé certifié"},
  {id:10,cat:"ornement",plant:"Géranium",variety:"Lierre rouge",n:"n5",pmin:3,pmax:6,unit:"plant",san:"Sain, en fleur"},
  {id:11,cat:"ornement",plant:"Bougainvillier",variety:"Violet",n:"n4",pmin:12,pmax:28,unit:"plant",san:"Sain, en fleur"},
  {id:12,cat:"ornement",plant:"Laurier-rose",variety:"Blanc / rose",n:"n4",pmin:8,pmax:18,unit:"plant",san:"Sain"},
  {id:13,cat:"ornement",plant:"Olivier d'ornement",variety:"Bonsaï de jardin",n:"n5",pmin:25,pmax:60,unit:"sujet",san:"Sain, façonné",stock:"out"},
  {id:14,cat:"ornement",plant:"Plantes d'extérieur",variety:"Assortiment",n:"n5",pmin:5,pmax:22,unit:"plant",san:"Sain"},
  {id:15,cat:"maraicher",plant:"Plants de tomate",variety:"Rio Grande",n:"n3",pmin:0.12,pmax:0.20,unit:"plant",san:"Plaque alvéolée"},
  {id:16,cat:"maraicher",plant:"Plants de piment",variety:"Beldi",n:"n3",pmin:0.15,pmax:0.25,unit:"plant",san:"Plaque alvéolée"},
  {id:17,cat:"maraicher",plant:"Plants de pastèque",variety:"Crimson greffé",n:"n4",pmin:0.20,pmax:0.30,unit:"plant",san:"Greffé"},
  {id:18,cat:"olivier",plant:"Olivier en godet",variety:"Chemlali",n:"n5",pmin:4,pmax:8,unit:"plant",san:"Indemne maladies"},
];

/* Statuts de stock (3 niveaux) — utilisé en front ET dans l'admin */
const STOCK = {
  ok:  { label:"Disponible",   color:"#16a34a", bg:"rgba(22,163,74,.14)",  dot:"#16a34a" },
  low: { label:"Stock limité", color:"#b45309", bg:"rgba(217,119,6,.16)",  dot:"#d97706" },
  out: { label:"Rupture",      color:"#b91c1c", bg:"rgba(220,38,38,.14)",  dot:"#dc2626" },
};
const STOCK_CYCLE = ["ok","low","out"];          // ordre de bascule en 1 clic
function stockOf(p){ return (p && p.stock) || "ok"; } // défaut = disponible

// Export Node (tests uniquement) — bloc inerte dans un navigateur classique.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATS, SVG, LISTINGS, STOCK, STOCK_CYCLE, stockOf };
}
