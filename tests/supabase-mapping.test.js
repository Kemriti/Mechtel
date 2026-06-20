'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// assets/supabase.js vérifie `window.supabase` au chargement — un objet vide
// suffit pour que `sb` reste `null` (mode démo), sans appel réseau.
global.window = global.window || {};

const { rowToNursery, nurseryToRow, rowToProduct, productToRow } = require('../assets/supabase.js');
const { NURSERIES } = require('../pepinieres.js');
const { LISTINGS } = require('../produits.js');

test('nurseryToRow -> rowToNursery round-trip préserve la fiche pépinière', () => {
  const n1 = NURSERIES.n1;
  const row = nurseryToRow({ ...n1, id: 'n1' });
  const back = rowToNursery(row);
  assert.equal(back.id, 'n1');
  assert.equal(back.name, n1.name);
  assert.equal(back.region, n1.region);
  assert.equal(back.agree, true);
  assert.equal(back.since, n1.since);
  assert.deepEqual(back.specialties, n1.specialties);
  assert.deepEqual(back.certs, n1.certs);
  assert.deepEqual(back.history, n1.history);
  assert.deepEqual(back.revs, n1.revs);
});

test('nurseryToRow normalise home_rank : "" et null deviennent tous les deux null', () => {
  const base = { id: 'n9', name: 'X', region: 'Y', agree: true, since: 2020, rating: 4 };
  assert.equal(nurseryToRow({ ...base, home_rank: '' }).home_rank, null);
  assert.equal(nurseryToRow({ ...base, home_rank: null }).home_rank, null);
  assert.equal(nurseryToRow({ ...base, home_rank: 3 }).home_rank, 3);
});

test('nurseryToRow force agree en booléen', () => {
  assert.equal(nurseryToRow({ id: 'n9', agree: undefined }).agree, false);
  assert.equal(nurseryToRow({ id: 'n9', agree: 1 }).agree, true);
});

test('nurseryToRow met reviews/orders à 0 par défaut', () => {
  const row = nurseryToRow({ id: 'n9', name: 'X', region: 'Y' });
  assert.equal(row.reviews, 0);
  assert.equal(row.orders, 0);
});

test('productToRow -> rowToProduct round-trip + défaut de stock', () => {
  const l = LISTINGS.find((x) => x.id === 1); // pas de `stock` explicite dans la démo -> "ok"
  const row = productToRow(l);
  assert.equal(row.stock, 'ok');
  const back = rowToProduct(row);
  assert.equal(back.id, l.id);
  assert.equal(back.plant, l.plant);
  assert.equal(back.variety, l.variety);
  assert.equal(back.n, l.n);
  assert.equal(back.pmin, l.pmin);
  assert.equal(back.pmax, l.pmax);
  assert.equal(back.stock, 'ok');
});

test('productToRow force les champs numériques', () => {
  const row = productToRow({ id: '7', cat: 'olivier', plant: 'X', variety: 'Y', n: 'n1', pmin: '4.5', pmax: '8', unit: 'plant', san: 'ok' });
  assert.equal(row.id, 7);
  assert.equal(row.pmin, 4.5);
  assert.equal(row.pmax, 8);
});

test('rowToProduct défaulte le stock manquant à "ok"', () => {
  const back = rowToProduct({ id: 1, cat: 'olivier', plant: 'X', variety: 'Y', nursery_id: 'n1', pmin: 1, pmax: 2, unit: 'plant', san: 'ok' });
  assert.equal(back.stock, 'ok');
});
