'use strict';
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { addToQuote, removeFromQuote, setQuoteQty, STATE, resetQuote, lastToast } = require('./helpers/browser-stubs.js');

// Fixtures réelles de produits.js : id 1 et 4 -> pépinière n2 ; id 2 -> n1 ; id 13 -> n5 (stock "out").
describe('devis groupé — une seule pépinière par devis', () => {
  beforeEach(() => {
    resetQuote();
    global.confirm = () => true;
  });

  it('ajoute un plant à un devis vide et fixe la pépinière', () => {
    addToQuote(1);
    assert.equal(STATE.quote.nid, 'n2');
    assert.equal(STATE.quote.items.length, 1);
    assert.equal(STATE.quote.items[0].id, 1);
  });

  it('ajoute un second plant de la même pépinière sans demander confirmation', () => {
    global.confirm = () => { throw new Error('confirm ne doit pas être appelé pour la même pépinière'); };
    addToQuote(1);
    addToQuote(4);
    assert.equal(STATE.quote.nid, 'n2');
    assert.equal(STATE.quote.items.length, 2);
  });

  it('changer de pépinière + confirmation acceptée vide le devis et repart sur la nouvelle pépinière', () => {
    addToQuote(1); // n2
    global.confirm = () => true;
    addToQuote(2); // n1 - pépinière différente
    assert.equal(STATE.quote.nid, 'n1');
    assert.equal(STATE.quote.items.length, 1);
    assert.equal(STATE.quote.items[0].id, 2);
  });

  it('changer de pépinière + confirmation refusée laisse le devis inchangé', () => {
    addToQuote(1); // n2
    global.confirm = () => false;
    addToQuote(2); // n1 - refusé
    assert.equal(STATE.quote.nid, 'n2');
    assert.equal(STATE.quote.items.length, 1);
    assert.equal(STATE.quote.items[0].id, 1);
  });

  it('refuse un plant en rupture de stock', () => {
    addToQuote(13); // n5, stock "out"
    assert.equal(STATE.quote.items.length, 0);
    assert.match(lastToast(), /rupture/);
  });

  it('ne duplique pas un plant déjà présent dans le devis', () => {
    addToQuote(1);
    addToQuote(1);
    assert.equal(STATE.quote.items.length, 1);
    assert.match(lastToast(), /Déjà dans le devis/);
  });

  it('removeFromQuote sur le dernier article réinitialise la pépinière (nid)', () => {
    addToQuote(1);
    removeFromQuote(1);
    assert.equal(STATE.quote.items.length, 0);
    assert.equal(STATE.quote.nid, null);
  });

  it('setQuoteQty met à jour la quantité du bon article', () => {
    addToQuote(1);
    addToQuote(4);
    setQuoteQty(4, '12');
    assert.equal(STATE.quote.items.find((it) => it.id === 4).qty, '12');
    assert.equal(STATE.quote.items.find((it) => it.id === 1).qty, '');
  });
});
