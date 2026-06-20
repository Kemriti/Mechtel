'use strict';
// Stub minimal de l'environnement navigateur pour pouvoir charger les vrais
// fichiers de l'app (produits.js, pepinieres.js, app.js, features.js) sous Node.
// En navigateur classique, ces scripts partagent une seule portée globale ;
// sous Node (CommonJS), on reproduit ça en posant leurs exports sur `global`
// avant de require() le fichier suivant — exactement comme des <script> en cascade.

function makeDocStub() {
  const nodes = {};
  function node(sel) {
    if (!nodes[sel]) {
      nodes[sel] = {
        textContent: '',
        className: '',
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        style: {},
      };
    }
    return nodes[sel];
  }
  return {
    _nodes: nodes,
    querySelector: (sel) => node(sel),
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {},
    body: { style: {} },
  };
}

global.window = { matchMedia: () => ({ matches: false }) };
global.document = makeDocStub();
global.confirm = () => true;

const produits = require('../../produits.js');
const pepinieres = require('../../pepinieres.js');
const app = require('../../app.js');

global.LISTINGS = produits.LISTINGS;
global.CATS = produits.CATS;
global.SVG = produits.SVG;
global.STOCK = produits.STOCK;
global.stockOf = produits.stockOf;
global.NURSERIES = pepinieres.NURSERIES;
global.STATE = app.STATE;

const features = require('../../features.js');

function resetQuote() {
  global.STATE.quote = { nid: null, items: [] };
}

function lastToast() {
  return global.document._nodes['#toast'] && global.document._nodes['#toast'].textContent;
}

module.exports = {
  ...produits,
  ...pepinieres,
  ...features,
  STATE: app.STATE,
  resetQuote,
  lastToast,
};
