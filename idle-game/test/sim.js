// Greedy-bot pacing simulation: node test/sim.js
const E = require('../engine.js');
const s = E.defaultState(0);
let t = 0;
const marks = {};
const CPS_CLICKS = 4; // bot clicks 4/sec early on
while (t < 6 * 3600 && !marks.ascend) {
  E.tick(s, 1, t * 1000);
  for (let i = 0; i < CPS_CLICKS; i++) E.click(s, t * 1000, () => 0.5);
  // buy cheapest-payback item repeatedly
  let bought = true;
  while (bought) {
    bought = false;
    for (const u of E.UPGRADES) if (s.stardust >= u.cost * 1.0 && E.buyUpgrade(s, u.id)) bought = true;
    let best = null;
    for (const g of E.GENERATORS) {
      const own = s.owned[g.id] || 0, c = E.genCost(g, own);
      const score = c / g.cps;
      if (!best || score < best.score) best = { g, score, c };
    }
    if (best && s.stardust >= best.c) { E.buyGenerator(s, best.g.id, 1); bought = true; }
  }
  t++;
  for (const m of [1e3, 1e6, 1e9]) if (!marks[m] && s.totalMined >= m) marks[m] = t;
  if (E.pendingEssence(s) >= 1) marks.ascend = t;
}
console.log('ulasilan sure (dk):', Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, (v / 60).toFixed(1)])));
