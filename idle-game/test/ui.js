// Real-browser interaction test (headless Chromium): node test/ui.js
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..');
const probe = `<script>
window.onerror = function(){ window.__err = 1; };
setTimeout(function(){
  var c = document.getElementById('core'); for (var i=0;i<30;i++) c.click();
}, 300);
setTimeout(function(){
  document.querySelector('#gens button').click();
}, 700);
setTimeout(function(){
  document.title = 'RES clicks=' + document.getElementById('clicks').textContent +
    ' owned=' + document.querySelector('#gens .own').textContent + ' err=' + (window.__err||0);
}, 1500);
</script></body>`;
const f = path.join(root, '_ui.html');
fs.writeFileSync(f, fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace('</body>', probe));
let out = '';
try {
  out = cp.execFileSync(process.env.CHROME || 'chromium', ['--headless', '--no-sandbox', '--disable-gpu', '--virtual-time-budget=4000', '--dump-dom', 'file://' + f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
} finally { fs.unlinkSync(f); }
const m = out.match(/<title>([^<]*)<\/title>/);
console.log(m && m[1]);
if (m && m[1].includes('clicks=30 owned=Sahip: 1 err=0')) console.log('UI-OK'); else { console.log('UI-FAIL'); process.exit(1); }
