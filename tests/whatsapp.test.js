'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { waDigits, waLink, leadWaMessage, quoteWaMessage } = require('./helpers/browser-stubs.js');
const { NURSERIES } = require('../pepinieres.js');
const { LISTINGS } = require('../produits.js');

describe('waDigits', () => {
  it('garde uniquement les chiffres, quel que soit le format saisi', () => {
    assert.equal(waDigits('+33 6 36 01 78 92'), '33636017892');
    assert.equal(waDigits('33636017892'), '33636017892');
    assert.equal(waDigits(''), '');
    assert.equal(waDigits(undefined), '');
  });
});

describe('waLink', () => {
  it("construit une URL wa.me avec le texte encodé", () => {
    const url = waLink('+33636017892', 'Bonjour & bienvenue');
    assert.equal(url, 'https://wa.me/33636017892?text=Bonjour%20%26%20bienvenue');
  });
});

describe('leadWaMessage (devis simple)', () => {
  const l = LISTINGS.find((x) => x.id === 1); // Olivier en godet, Chemlali Sfax -> n2
  const nur = NURSERIES[l.n];

  it('inclut le plant, la pépinière, la quantité et l’acheteur', () => {
    const msg = leadWaMessage(l, nur, 'Slim Ben Ali', '+216 12 345 678', '50 plants', '');
    assert.match(msg, /Olivier en godet/);
    assert.match(msg, /Chemlali Sfax/);
    assert.match(msg, new RegExp(nur.name));
    assert.match(msg, /50 plants/);
    assert.match(msg, /Slim Ben Ali/);
    assert.match(msg, /\+216 12 345 678/);
  });

  it('omet la ligne Message quand il est vide, mais l’ajoute sinon', () => {
    const sansMsg = leadWaMessage(l, nur, 'Slim', '', '', '');
    assert.doesNotMatch(sansMsg, /Message :/);
    const avecMsg = leadWaMessage(l, nur, 'Slim', '', '', 'Livraison possible ?');
    assert.match(avecMsg, /Message : Livraison possible \?/);
  });

  it('affiche un tiret quand la quantité est vide', () => {
    const msg = leadWaMessage(l, nur, 'Slim', '', '', '');
    assert.match(msg, /Quantité souhaitée : —/);
  });
});

describe('quoteWaMessage (devis groupé)', () => {
  it('liste chaque plant du devis avec sa quantité', () => {
    const nur = NURSERIES.n2;
    const items = [{ id: 1, qty: '10' }, { id: 4, qty: '' }];
    const msg = quoteWaMessage(items, nur, 'Slim', '+216 12 345 678', '');
    assert.match(msg, /Olivier en godet \(Chemlali Sfax\) ×10/);
    assert.match(msg, /Picholine/);
    assert.match(msg, new RegExp(nur.name));
  });
});
