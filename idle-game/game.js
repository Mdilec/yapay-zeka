(function () {
  'use strict';
  const E = window.Engine;
  const KEY = 'stardustTycoonPlusSave';
  const $ = id => document.getElementById(id);
  let s, qty = 1, now = Date.now(), goldenTimer = 0, goldenEl = null;

  // Synthesized sound effects (WebAudio, no assets). Muted state is persisted.
  let audio = null, muted = localStorage.getItem('sdMuted') === '1';
  function beep(freq, dur, type, vol) {
    if (muted) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.05, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
    } catch (e) { /* ses desteklenmiyor */ }
  }

  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return E.deserialize(raw, Date.now()); } catch (e) { console.warn('Kayıt okunamadı', e); }
    return E.defaultState(Date.now());
  }
  function save() { try { localStorage.setItem(KEY, E.serialize(s, Date.now())); } catch (e) { /* kota dolu */ } }

  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    $('toasts').appendChild(t); setTimeout(() => t.remove(), 4000);
  }

  function floatText(x, y, text, crit) {
    const f = document.createElement('div'); f.className = 'float' + (crit ? ' crit' : '');
    f.textContent = text; f.style.left = x + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 800);
  }

  const gensUI = {}, upsUI = {}, eupsUI = {}, achUI = {};
  function row(name, desc) {
    const r = document.createElement('div'); r.className = 'row';
    r.innerHTML = '<div><div class="name"></div><div class="desc"></div><div class="own"></div></div><button></button>';
    r.querySelector('.name').textContent = name; r.querySelector('.desc').textContent = desc;
    return r;
  }
  function build() {
    for (const g of E.GENERATORS) {
      const r = row(g.name, ''); $('gens').appendChild(r);
      r.querySelector('button').addEventListener('click', () => { if (E.buyGenerator(s, g.id, qty)) beep(660, 0.1); });
      gensUI[g.id] = { r, desc: r.querySelector('.desc'), own: r.querySelector('.own'), btn: r.querySelector('button') };
    }
    for (const u of E.UPGRADES) {
      const r = row(u.name, u.desc); $('ups').appendChild(r);
      r.querySelector('button').addEventListener('click', () => { if (E.buyUpgrade(s, u.id)) toast('Yükseltme: ' + u.name); });
      upsUI[u.id] = { r, btn: r.querySelector('button') };
    }
    for (const u of E.ESSENCE_UPGRADES) {
      const r = row(u.name, u.desc); $('eups').appendChild(r);
      r.querySelector('button').addEventListener('click', () => { if (E.buyEssenceUpgrade(s, u.id)) toast('Öz yükseltmesi: ' + u.name); });
      eupsUI[u.id] = { r, btn: r.querySelector('button') };
    }
    for (const a of E.ACHIEVEMENTS) {
      const d = document.createElement('div'); d.className = 'ach'; d.textContent = a.name; d.title = a.desc;
      $('achs').appendChild(d); achUI[a.id] = d;
    }
    $('achTotal').textContent = E.ACHIEVEMENTS.length;
  }

  function render() {
    $('stardust').textContent = E.fmt(s.stardust);
    $('rate').textContent = E.fmt(E.cps(s, now)) + ' ✦/sn';
    $('perClick').textContent = 'Tıklama başına: ' + E.fmt(E.clickValue(s, now));
    $('totalMined').textContent = E.fmt(s.totalMined);
    $('clicks').textContent = s.clicks;
    $('achCount').textContent = Object.keys(s.achieved).length;
    $('essence').textContent = s.essence;
    const pend = E.pendingEssence(s);
    $('ascendBtn').textContent = 'Yükselme (+' + pend + ' Öz)';
    $('ascendBtn').disabled = pend < 1;
    const left = (s.buffUntil - now) / 1000;
    $('buff').classList.toggle('hidden', left <= 0);
    if (left > 0) $('buff').textContent = '🔥 Delilik x' + s.buffMult + ' — ' + Math.ceil(left) + ' sn';
    for (const g of E.GENERATORS) {
      const u = gensUI[g.id], own = s.owned[g.id] || 0;
      const k = qty === 'max' ? Math.max(E.maxAffordable(g, own, s.stardust), 1) : qty;
      const cost = E.batchCost(g, own, k);
      u.r.classList.toggle('locked', own === 0 && s.totalMined < g.base * 0.3);
      u.own.textContent = 'Sahip: ' + own;
      u.desc.textContent = '+' + E.fmt(g.cps * E.globalMult(s, now)) + ' ✦/sn (birim)';
      u.btn.textContent = 'x' + k + ' — ' + E.fmt(cost) + ' ✦';
      u.btn.disabled = s.stardust < cost;
    }
    for (const u of E.UPGRADES) {
      const ui = upsUI[u.id], bought = !!s.upgrades[u.id];
      ui.r.classList.toggle('locked', bought || (u.req && !s.upgrades[u.req]));
      ui.btn.textContent = E.fmt(u.cost) + ' ✦'; ui.btn.disabled = s.stardust < u.cost;
    }
    for (const u of E.ESSENCE_UPGRADES) {
      const ui = eupsUI[u.id], bought = !!s.essenceUpgrades[u.id];
      ui.r.classList.toggle('locked', bought);
      ui.btn.textContent = u.cost + ' Öz'; ui.btn.disabled = s.essence < u.cost;
    }
    for (const a of E.ACHIEVEMENTS) achUI[a.id].classList.toggle('got', !!s.achieved[a.id]);
  }

  function spawnGolden() {
    if (goldenEl) return;
    goldenEl = document.createElement('button'); goldenEl.id = 'golden'; goldenEl.textContent = '🌟';
    goldenEl.style.left = (10 + Math.random() * 80) + 'vw'; goldenEl.style.top = (15 + Math.random() * 70) + 'vh';
    goldenEl.addEventListener('click', () => {
      const r = E.goldenReward(s, Date.now()); beep(1200, 0.4, 'sine', 0.08);
      toast(r.kind === 'lucky' ? '🌟 Şanslı! +' + E.fmt(r.gain) + ' ✦' : '🌟 Delilik! Üretim x7 (30 sn)');
      goldenEl.remove(); goldenEl = null; scheduleGolden();
    });
    document.body.appendChild(goldenEl);
    setTimeout(() => { if (goldenEl) { goldenEl.remove(); goldenEl = null; scheduleGolden(); } }, 12000);
  }
  function scheduleGolden() {
    const [a, b] = E.goldenInterval(s);
    goldenTimer = a + Math.random() * (b - a);
  }

  function init() {
    s = load(); build(); scheduleGolden();
    const off = E.offlineGain(s, Date.now());
    if (off.seconds > 60 && off.gain > 0) { E.earn(s, off.gain); toast('Sen yokken ' + E.fmt(off.gain) + ' ✦ kazanıldı'); }

    $('core').addEventListener('click', ev => {
      const r = E.click(s, Date.now());
      floatText(ev.clientX || 100, ev.clientY || 100, '+' + E.fmt(r.gain), r.crit);
      beep(r.crit ? 880 : 440, 0.08, 'triangle');
    });
    $('qty').addEventListener('click', ev => {
      const q = ev.target.dataset && ev.target.dataset.q; if (!q) return;
      qty = q === 'max' ? 'max' : Number(q);
      for (const b of $('qty').children) b.classList.toggle('on', b === ev.target);
    });
    $('ascendBtn').addEventListener('click', () => {
      const p = E.pendingEssence(s);
      if (p >= 1 && confirm('Yükselerek ' + p + ' Kozmik Öz kazanırsın, ilerleme sıfırlanır. Emin misin?')) { E.ascend(s, Date.now()); save(); }
    });
    $('exportBtn').addEventListener('click', () => {
      const data = btoa(E.serialize(s, Date.now()));
      if (navigator.clipboard) navigator.clipboard.writeText(data).then(() => toast('Kayıt panoya kopyalandı'), () => prompt('Kaydı kopyala:', data)); else prompt('Kaydı kopyala:', data);
    });
    $('importBtn').addEventListener('click', () => {
      const data = prompt('Kayıt kodunu yapıştır:'); if (!data) return;
      try { s = E.deserialize(atob(data.trim()), Date.now()); save(); toast('Kayıt yüklendi'); } catch (e) { toast('Geçersiz kayıt'); }
    });
    $('resetBtn').addEventListener('click', () => {
      if (confirm('TÜM ilerleme silinsin mi?')) { s = E.defaultState(Date.now()); save(); }
    });
    $('soundBtn').textContent = muted ? '\ud83d\udd07 Sessiz' : '\ud83d\udd0a Ses';
    $('soundBtn').addEventListener('click', () => {
      muted = !muted; localStorage.setItem('sdMuted', muted ? '1' : '0');
      $('soundBtn').textContent = muted ? '\ud83d\udd07 Sessiz' : '\ud83d\udd0a Ses';
    });
    window.addEventListener('beforeunload', save);
    setInterval(save, 15000);

    let last = performance.now();
    setInterval(() => {
      const t = performance.now(), dt = Math.min((t - last) / 1000, 5); last = t; now = Date.now();
      E.tick(s, dt, now);
      for (const a of E.checkAchievements(s)) toast('🏆 ' + a.name);
      goldenTimer -= dt; if (goldenTimer <= 0) { spawnGolden(); goldenTimer = 9999; }
      render();
    }, 100);
  }
  init();
})();
