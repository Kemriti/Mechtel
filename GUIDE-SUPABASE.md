# Guide de configuration Supabase — El Mechtel (≈ 15 min)

Ce guide active le **stockage des photos**, la **base de données** et le **login admin**.
Tu n'as **rien à coder** : juste créer un projet, coller du SQL, et reporter 2 clés.

> ⚠️ Sécurité : tu ne colleras que des clés **publiques** (URL + clé `anon`). Ne mets **jamais** la clé `service_role` dans les fichiers du site.

---

## 1) Créer le projet (3 min)
1. Va sur **https://supabase.com** → *Start your project* → connecte-toi (GitHub ou email).
2. *New project* → donne un nom (ex. `el-mechtel`), un mot de passe de base de données (garde-le), une région proche (ex. *Europe West*).
3. Attends ~2 min que le projet soit prêt.

## 2) Créer les tables (3 min)
1. Menu de gauche → **SQL Editor** → *New query*.
2. Colle **tout** le bloc ci-dessous, puis clique **Run**.

```sql
-- Table des pépinières
create table if not exists nurseries (
  id          text primary key,
  name        text,
  region      text,
  agree       boolean default false,
  since       int,
  rating      numeric,
  cat         text,
  reviews     int default 0,
  orders      int default 0,
  area        text,
  cap         text,
  tagline     text,
  about       text,
  photo       text,
  home_rank   int,
  specialties jsonb default '[]',
  certs       jsonb default '[]',
  history     jsonb default '[]',
  revs        jsonb default '[]',
  created_at  timestamptz default now()
);

-- Table des plants
create table if not exists products (
  id         int primary key,
  cat        text,
  plant      text,
  variety    text,
  nursery_id text references nurseries(id) on delete set null,
  pmin       numeric,
  pmax       numeric,
  unit       text,
  san        text,
  photo      text,
  stock      text default 'ok',
  created_at timestamptz default now()
);
```

> **Déjà créé les tables avant cette version ?** Lance alors ces 2 lignes pour ajouter les nouvelles colonnes (stock + ordre d'accueil) :
> ```sql
> alter table products  add column if not exists stock     text default 'ok';
> alter table nurseries add column if not exists home_rank int;
> ```

## 3) Sécurité (RLS) — lecture publique, écriture admin seulement (3 min)
Toujours dans **SQL Editor**, nouvelle requête, colle et **Run** :

```sql
-- Activer la sécurité au niveau ligne
alter table nurseries enable row level security;
alter table products  enable row level security;

-- Tout le monde peut LIRE (le site public)
create policy "lecture publique nurseries" on nurseries for select using (true);
create policy "lecture publique products"  on products  for select using (true);

-- Seuls les utilisateurs CONNECTÉS (toi) peuvent écrire
create policy "ecriture admin nurseries" on nurseries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "ecriture admin products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

## 4) Créer le bucket de photos (2 min)
1. Menu de gauche → **Storage** → *New bucket*.
2. Nom : **`photos`** → coche **Public bucket** → *Create*.
3. (Lecture publique des photos automatique. L'upload est réservé aux connectés grâce au point 3.)

Pour autoriser l'upload par l'admin connecté, lance ce SQL :

```sql
create policy "upload admin photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');
create policy "update admin photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos');
create policy "lecture publique photos" on storage.objects
  for select using (bucket_id = 'photos');
```

## 5) Créer TON compte admin (1 min)
1. Menu de gauche → **Authentication** → *Users* → **Add user** → *Create new user*.
2. Mets **ton email** + un mot de passe. (Coche « Auto Confirm User » si proposé.)
3. C'est ce compte qui te connectera sur `admin.html`.

## 6) Reporter tes 2 clés dans le site (1 min)
1. Menu de gauche → **Project Settings** (roue) → **API**.
2. Copie **Project URL** et **anon public key**.
3. Ouvre `assets/supabase.js` et remplace :

```js
const SUPABASE_URL  = "https://VOTRE-PROJET.supabase.co";   // ← Project URL
const SUPABASE_ANON = "VOTRE_CLE_ANON_PUBLIQUE";            // ← anon public key
```

## 7) Importer tes données de démarrage (1 min)
1. Ouvre **`admin.html`** dans ton navigateur → connecte-toi avec ton compte admin.
2. Clique **« ⇪ Importer la démo »** : les 8 pépinières et 18 plants de démonstration sont copiés dans Supabase.
3. Tu peux maintenant **modifier**, **ajouter**, **supprimer**, et **téléverser des photos**.

---

## C'est en ligne — comment ça marche ensuite
- **`admin.html`** : ton back-office. Ajoute/modifie/supprime plants & pépinières, et clique « Choisir une photo » pour remplacer une illustration par une vraie image. Tout est sauvegardé dans Supabase.
- **`index.html`** (le site public) : au chargement, il lit automatiquement les données depuis Supabase. Dès que tu changes une photo dans l'admin, le site public l'affiche.
- **Mode démo** : tant que `supabase.js` n'est pas configuré, le site tourne sur les données locales (`produits.js` / `pepinieres.js`) — pratique pour tester sans rien installer.

## Bonnes pratiques photos
- Formats : **JPG/WebP**, < 1–2 Mo idéalement. Redimensionne à ~1200 px de large avant upload (les fiches n'ont pas besoin de plus).
- Nomme proprement tes fichiers ; le système les range dans `photos/products/...` et `photos/nurseries/...`.

## Dépannage
- *« Supabase n'est pas configuré »* → tu n'as pas reporté l'URL/clé dans `supabase.js`.
- *Échec de connexion* → vérifie que le compte existe dans Authentication et qu'il est confirmé.
- *Erreur à l'enregistrement (RLS)* → relance le SQL du point 3 ; assure-toi d'être bien connecté.
- *Photo non visible* → le bucket `photos` doit être **public** (point 4).
