const test = require('node:test');
const assert = require('node:assert');
const E = require('../engine.js');
const T = 1e12;

test('click earns and counts', () => {
  const s = E.defaultState(T);
  E.click(s, T, () => 0.99);
  assert.strictEqual(s.stardust, 1);
  assert.strictEqual(s.clicks, 1);
});

test('batch cost equals sequential cost', () => {
  const g = E.GENERATORS[0];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += E.genCost(g, i);
  assert.ok(Math.abs(sum - E.batchCost(g, 0, 10)) < 1e-6);
});

test('buy max never overspends', () => {
  const s = E.defaultState(T);
  s.stardust = 12345;
  const k = E.buyGenerator(s, 'drone', 'max');
  assert.ok(k > 0 && s.stardust >= 0);
  assert.ok(E.genCost(E.GENERATORS[0], k) > s.stardust);
});

test('cannot buy when poor', () => {
  const s = E.defaultState(T);
  assert.strictEqual(E.buyGenerator(s, 'drone', 1), 0);
  assert.strictEqual(E.buyUpgrade(s, 'u_click1'), false);
});

test('upgrade requirements and multiplier', () => {
  const s = E.defaultState(T);
  s.stardust = 1e9;
  assert.strictEqual(E.buyUpgrade(s, 'u_click2'), false);
  assert.ok(E.buyUpgrade(s, 'u_click1'));
  assert.strictEqual(E.buyUpgrade(s, 'u_click1'), false);
  assert.strictEqual(E.clickValue(s, T), 2);
  assert.ok(E.buyUpgrade(s, 'u_click2'));
  assert.strictEqual(E.clickValue(s, T), 6);
});

test('tick produces cps', () => {
  const s = E.defaultState(T);
  s.owned.drone = 10;
  E.tick(s, 2, T);
  assert.strictEqual(s.stardust, 10);
});

test('ascend needs 1e9 and resets run', () => {
  const s = E.defaultState(T);
  s.runMined = 1e8; s.owned.drone = 5;
  assert.strictEqual(E.ascend(s, T), 0);
  s.runMined = 4e9; s.stardust = 5;
  assert.strictEqual(E.pendingEssence(s), 2);
  assert.strictEqual(E.ascend(s, T), 2);
  assert.strictEqual(s.essence, 2);
  assert.deepStrictEqual(s.owned, {});
  assert.strictEqual(s.runMined, 0);
  assert.strictEqual(s.ascensions, 1);
});

test('essence upgrades: start dust persists through ascend', () => {
  const s = E.defaultState(T);
  s.essence = 5;
  assert.ok(E.buyEssenceUpgrade(s, 'e_start'));
  s.runMined = 1e9;
  E.ascend(s, T);
  assert.strictEqual(s.stardust, 1000);
});

test('achievements fire once and boost production', () => {
  const s = E.defaultState(T);
  s.totalMined = 150;
  assert.strictEqual(E.checkAchievements(s).length, 1);
  assert.strictEqual(E.checkAchievements(s).length, 0);
  assert.ok(E.globalMult(s, T) > 1);
});

test('offline gain capped and halved', () => {
  const s = E.defaultState(T);
  s.owned.drone = 2; // cps 1
  const o = E.offlineGain(s, T + 100 * 3600 * 1000);
  assert.strictEqual(o.seconds, 8 * 3600);
  assert.strictEqual(o.gain, 8 * 3600 * 0.5);
});

test('golden frenzy buff multiplies cps', () => {
  const s = E.defaultState(T);
  s.owned.drone = 2;
  const r = E.goldenReward(s, T, () => 0.9);
  assert.strictEqual(r.kind, 'frenzy');
  assert.strictEqual(E.cps(s, T + 1000), 7);
  assert.strictEqual(E.cps(s, T + 31000), 1);
});

test('save roundtrip and rejects garbage', () => {
  const s = E.defaultState(T);
  s.stardust = 42; s.owned.rig = 3;
  const r = E.deserialize(E.serialize(s, T), T);
  assert.strictEqual(r.stardust, 42);
  assert.strictEqual(r.owned.rig, 3);
  assert.throws(() => E.deserialize('{"x":1}'));
  assert.throws(() => E.deserialize('nope'));
  assert.strictEqual(E.deserialize('{"stardust":-5,"owned":null}', T).stardust, 0);
});

test('fmt', () => {
  assert.strictEqual(E.fmt(999), '999');
  assert.strictEqual(E.fmt(1500), '1.50 B');
  assert.strictEqual(E.fmt(2e6), '2.00 M');
});
