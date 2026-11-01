// Stardust Tycoon+ engine: pure game logic (no DOM) so it can be tested in Node.
(function (root) {
  'use strict';
  const SAVE_VERSION = 3;
  const GROWTH = 1.15;
  const OFFLINE_CAP_SEC = 8 * 3600;
  const OFFLINE_EFFICIENCY = 0.5;

  const GENERATORS = [
    { id: 'drone', name: 'Yıldız Drone', base: 15, cps: 0.5 },
    { id: 'rig', name: 'Madencilik Teçhizatı', base: 120, cps: 4 },
    { id: 'planet', name: 'Maden Gezegeni', base: 1300, cps: 30 },
    { id: 'fleet', name: 'Maden Filosu', base: 14000, cps: 200 },
    { id: 'forge', name: 'Galaksi Ocağı', base: 200000, cps: 1500 },
    { id: 'harvester', name: 'Çokevren Hasatçısı', base: 3.3e6, cps: 12000 },
    { id: 'blackhole', name: 'Kara Delik', base: 5e7, cps: 95000 },
    { id: 'quasar', name: 'Kuasar', base: 7.5e8, cps: 800000 },
    { id: 'omni', name: 'Omniverse', base: 1.2e10, cps: 7e6 },
    { id: 'singularity', name: 'Tekillik', base: 2e11, cps: 6e7 },
  ];

  // One-time upgrades. type: click (x click), gen (x one generator), all (x everything), crit.
  const UPGRADES = [
    { id: 'u_click1', name: 'Yıldız Parmakları', desc: 'Tıklama x2', cost: 200, type: 'click', mult: 2 },
    { id: 'u_click2', name: 'Güçlendirilmiş Parmaklar', desc: 'Tıklama x3', cost: 20000, type: 'click', mult: 3, req: 'u_click1' },
    { id: 'u_click3', name: 'Mekanik Parmaklar', desc: 'Tıklama x5', cost: 2e6, type: 'click', mult: 5, req: 'u_click2' },
    { id: 'u_cps', name: 'Tıklama Sinerjisi', desc: 'Tıklama = saniyelik üretimin %2\'si', cost: 5e5, type: 'clickCps', frac: 0.02 },
    { id: 'u_drone', name: 'Drone Yazılımı', desc: 'Drone x2', cost: 500, type: 'gen', gen: 'drone', mult: 2 },
    { id: 'u_rig', name: 'Turbo Matkap', desc: 'Teçhizat x2', cost: 3000, type: 'gen', gen: 'rig', mult: 2 },
    { id: 'u_planet', name: 'Çekirdek Sondaj', desc: 'Gezegen x2', cost: 30000, type: 'gen', gen: 'planet', mult: 2 },
    { id: 'u_fleet', name: 'Hiper Sürücü', desc: 'Filo x2', cost: 3e5, type: 'gen', gen: 'fleet', mult: 2 },
    { id: 'u_forge', name: 'Yıldız Körüğü', desc: 'Ocak x2', cost: 4e6, type: 'gen', gen: 'forge', mult: 2 },
    { id: 'u_all1', name: 'Yıldız Yükseltici', desc: 'Tüm üretim +%25', cost: 1e5, type: 'all', mult: 1.25 },
    { id: 'u_all2', name: 'Nebula Yükseltici', desc: 'Tüm üretim +%50', cost: 5e7, type: 'all', mult: 1.5, req: 'u_all1' },
    { id: 'u_all3', name: 'Kozmik Yükseltici', desc: 'Tüm üretim x2', cost: 5e9, type: 'all', mult: 2, req: 'u_all2' },
    { id: 'u_crit', name: 'Şanslı Tıklama', desc: '%5 şansla tıklama x10', cost: 1e4, type: 'crit', chance: 0.05, mult: 10 },
  ];

  // Permanent prestige shop paid in Cosmic Essence.
  const ESSENCE_UPGRADES = [
    { id: 'e_start', name: 'Başlangıç Tozu', desc: 'Her sıfırlamada 1000 ✦ ile başla', cost: 5 },
    { id: 'e_prod', name: 'Öz Rezonansı', desc: 'Tüm üretim x1.5', cost: 20 },
    { id: 'e_off', name: 'Uyuyan Madenci', desc: 'Çevrimdışı verim %50 → %100', cost: 50 },
    { id: 'e_gold', name: 'Altın Yıldız Çekimi', desc: 'Altın yıldızlar 2x sık çıkar', cost: 100 },
  ];

  const ACHIEVEMENTS = [
    { id: 'a1', name: 'Bozuk Para', desc: '100 ✦ kazan', cond: s => s.totalMined >= 100 },
    { id: 'a2', name: 'Tasarrufçu', desc: '10 B ✦ kazan', cond: s => s.totalMined >= 1e4 },
    { id: 'a3', name: 'Milyoner', desc: '1 M ✦ kazan', cond: s => s.totalMined >= 1e6 },
    { id: 'a4', name: 'Milyarder', desc: '1 Mr ✦ kazan', cond: s => s.totalMined >= 1e9 },
    { id: 'a5', name: 'Tıklayıcı', desc: '100 kez tıkla', cond: s => s.clicks >= 100 },
    { id: 'a6', name: 'Tıklama Çılgını', desc: '5000 kez tıkla', cond: s => s.clicks >= 5000 },
    { id: 'a7', name: 'Drone Filosu', desc: '25 Drone', cond: s => (s.owned.drone || 0) >= 25 },
    { id: 'a8', name: 'Çeşitlilik', desc: 'Her üreticiden en az 1 al', cond: s => GENERATORS.every(g => (s.owned[g.id] || 0) >= 1) },
    { id: 'a9', name: 'Yükseliş', desc: '1 kez prestij yap', cond: s => s.ascensions >= 1 },
    { id: 'a10', name: 'Avcı', desc: '10 altın yıldız yakala', cond: s => s.goldenCaught >= 10 },
  ];
  // Each achievement gives +2% production.
  const ACH_BONUS = 0.02;

  function defaultState(now) {
    return {
      version: SAVE_VERSION, stardust: 0, totalMined: 0, runMined: 0, clicks: 0,
      owned: {}, upgrades: {}, achieved: {}, essence: 0, essenceSpent: 0,
      essenceUpgrades: {}, ascensions: 0, goldenCaught: 0,
      buffUntil: 0, buffMult: 1, lastSave: now || Date.now(),
    };
  }

  function genCost(g, owned) { return g.base * Math.pow(GROWTH, owned); }

  // Total cost to buy k copies starting from `owned`.
  function batchCost(g, owned, k) {
    return g.base * Math.pow(GROWTH, owned) * (Math.pow(GROWTH, k) - 1) / (GROWTH - 1);
  }

  function maxAffordable(g, owned, budget) {
    if (budget < genCost(g, owned)) return 0;
    let k = Math.floor(Math.log(budget * (GROWTH - 1) / genCost(g, owned) + 1) / Math.log(GROWTH));
    while (k > 0 && batchCost(g, owned, k) > budget) k--;
    return Math.max(k, 0);
  }

  function achievementCount(s) { return Object.keys(s.achieved).length; }

  function globalMult(s, now) {
    let m = 1 + achievementCount(s) * ACH_BONUS;
    m *= 1 + s.essence * 0.02; // each unspent essence +2%
    for (const u of UPGRADES) if (s.upgrades[u.id] && u.type === 'all') m *= u.mult;
    if (s.essenceUpgrades.e_prod) m *= 1.5;
    if (now !== undefined && now < s.buffUntil) m *= s.buffMult;
    return m;
  }

  function genMult(s, id) {
    let m = 1;
    for (const u of UPGRADES) if (s.upgrades[u.id] && u.type === 'gen' && u.gen === id) m *= u.mult;
    return m;
  }

  function baseCps(s) {
    let t = 0;
    for (const g of GENERATORS) t += (s.owned[g.id] || 0) * g.cps * genMult(s, g.id);
    return t;
  }

  function cps(s, now) { return baseCps(s) * globalMult(s, now); }

  function clickValue(s, now) {
    let v = 1;
    for (const u of UPGRADES) {
      if (!s.upgrades[u.id]) continue;
      if (u.type === 'click') v *= u.mult;
    }
    let c = v * globalMult(s, now);
    if (s.upgrades.u_cps) c += cps(s, now) * 0.02;
    return c;
  }

  function critInfo(s) {
    return s.upgrades.u_crit ? { chance: 0.05, mult: 10 } : { chance: 0, mult: 1 };
  }

  function earn(s, amount) { s.stardust += amount; s.totalMined += amount; s.runMined += amount; }

  function click(s, now, rnd) {
    const ci = critInfo(s);
    let gain = clickValue(s, now);
    let crit = false;
    if (ci.chance && (rnd ? rnd() : Math.random()) < ci.chance) { gain *= ci.mult; crit = true; }
    earn(s, gain); s.clicks++;
    return { gain, crit };
  }

  function buyGenerator(s, id, qty) {
    const g = GENERATORS.find(x => x.id === id);
    if (!g) return 0;
    const owned = s.owned[id] || 0;
    const k = qty === 'max' ? maxAffordable(g, owned, s.stardust) : Math.min(qty, maxAffordable(g, owned, s.stardust));
    if (k <= 0) return 0;
    s.stardust -= batchCost(g, owned, k);
    s.owned[id] = owned + k;
    return k;
  }

  function buyUpgrade(s, id) {
    const u = UPGRADES.find(x => x.id === id);
    if (!u || s.upgrades[id] || (u.req && !s.upgrades[u.req]) || s.stardust < u.cost) return false;
    s.stardust -= u.cost; s.upgrades[id] = true; return true;
  }

  function buyEssenceUpgrade(s, id) {
    const u = ESSENCE_UPGRADES.find(x => x.id === id);
    if (!u || s.essenceUpgrades[id] || s.essence < u.cost) return false;
    s.essence -= u.cost; s.essenceSpent += u.cost; s.essenceUpgrades[id] = true; return true;
  }

  // Essence earned this run: floor(sqrt(runMined / 1e9)) -- first essence needs 1 Mr.
  function pendingEssence(s) { return Math.floor(Math.sqrt(s.runMined / 1e9)); }

  function ascend(s, now) {
    const gain = pendingEssence(s);
    if (gain < 1) return 0;
    const keep = {
      essence: s.essence + gain, essenceSpent: s.essenceSpent, essenceUpgrades: s.essenceUpgrades,
      ascensions: s.ascensions + 1, achieved: s.achieved, clicks: s.clicks,
      totalMined: s.totalMined, goldenCaught: s.goldenCaught,
    };
    Object.assign(s, defaultState(now), keep);
    if (s.essenceUpgrades.e_start) { s.stardust = 1000; }
    return gain;
  }

  function checkAchievements(s) {
    const fresh = [];
    for (const a of ACHIEVEMENTS) {
      if (!s.achieved[a.id] && a.cond(s)) { s.achieved[a.id] = true; fresh.push(a); }
    }
    return fresh;
  }

  function tick(s, dt, now) { earn(s, cps(s, now) * dt); }

  function offlineGain(s, now) {
    const sec = Math.min(Math.max((now - s.lastSave) / 1000, 0), OFFLINE_CAP_SEC);
    const eff = s.essenceUpgrades.e_off ? 1 : OFFLINE_EFFICIENCY;
    return { seconds: sec, gain: cps(s) * sec * eff };
  }

  function goldenInterval(s) { return s.essenceUpgrades.e_gold ? [30, 75] : [60, 150]; }

  // Golden star outcomes: lucky (cash), frenzy (x7 for 30s), or click frenzy (x777 click not used).
  function goldenReward(s, now, rnd) {
    const r = rnd ? rnd() : Math.random();
    s.goldenCaught++;
    if (r < 0.5) {
      const gain = Math.max(cps(s, now) * 900, 100);
      earn(s, gain);
      return { kind: 'lucky', gain };
    }
    s.buffUntil = now + 30000; s.buffMult = 7;
    return { kind: 'frenzy', seconds: 30 };
  }

  function serialize(s, now) { s.lastSave = now || Date.now(); return JSON.stringify(s); }

  function deserialize(str, now) {
    const o = JSON.parse(str);
    if (!o || typeof o !== 'object' || typeof o.stardust !== 'number') throw new Error('invalid save');
    const s = Object.assign(defaultState(now), o);
    for (const k of ['owned', 'upgrades', 'achieved', 'essenceUpgrades']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
    for (const k of ['stardust', 'totalMined', 'runMined', 'clicks', 'essence', 'essenceSpent', 'ascensions', 'goldenCaught']) {
      if (!Number.isFinite(s[k]) || s[k] < 0) s[k] = 0;
    }
    s.runMined = s.runMined || 0;
    s.version = SAVE_VERSION;
    return s;
  }

  const SUFFIX = ['', 'B', 'M', 'Mr', 'Tr', 'Kd', 'Kn', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n) {
    if (!Number.isFinite(n)) return '∞';
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
    const i = Math.min(Math.floor(Math.log10(n) / 3), SUFFIX.length - 1);
    return (n / Math.pow(1000, i)).toFixed(2) + ' ' + SUFFIX[i];
  }

  const api = {
    SAVE_VERSION, GROWTH, GENERATORS, UPGRADES, ESSENCE_UPGRADES, ACHIEVEMENTS,
    defaultState, genCost, batchCost, maxAffordable, globalMult, cps, clickValue, click,
    buyGenerator, buyUpgrade, buyEssenceUpgrade, pendingEssence, ascend, checkAchievements,
    tick, offlineGain, goldenInterval, goldenReward, serialize, deserialize, fmt, earn,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof self !== 'undefined' ? self : this);
