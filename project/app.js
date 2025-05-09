/* ---------- app.js ---------- */

const yearSelect  = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const daySelect   = document.getElementById('daySelect');
const timeSlider  = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const mainImage   = document.getElementById('mainImage');
const imageDate   = document.getElementById('imageDateTop');

const cache   = new Map();   // iso‑date → array of image records
let available = [];          // list of iso‑date strings (YYYY‑MM‑DD)

const defaultPreview = 'preview.png';          // <-- your default thumbnail
mainImage.src = defaultPreview;

/* ─── helpers ────────────────────────────────────────────── */
const pad  = n => String(n).padStart(2, '0');
const iso  = (y, m, d) => `${y}-${m}-${d}`;
// show hours without a leading zero: 0:00, 7:05, 12:30 …
const fmtT = mins => `${(mins / 60) | 0}:${pad(mins % 60)}`;

function populate(select, vals) {
  select.innerHTML = '<option value="none">–</option>';
  vals.forEach(v => {
    const o = document.createElement('option');
    o.value = o.textContent = v;
    select.appendChild(o);
  });
}

/* ─── load master list then build YY/MM/DD dropdowns ─────── */
fetch('/daily_json/dates.json')
  .then(r => r.json())
  .then(dates => {
    available = dates;                       // ["2025-05-09", ...]
    const years  = [...new Set(dates.map(s => s.slice(0, 4)))].sort();
    populate(yearSelect, years);
  });

/* ─── rebuild MONTH and DAY menus when year/month changes ── */
yearSelect.addEventListener('change', () => {
  const y = yearSelect.value;
  if (y === 'none') { monthSelect.innerHTML = daySelect.innerHTML = ''; return; }

  const months = [...new Set(
    available.filter(s => s.startsWith(y)).map(s => s.slice(5, 7))
  )].sort();
  populate(monthSelect, months);
  daySelect.innerHTML = '';
});

monthSelect.addEventListener('change', () => {
  const y = yearSelect.value, m = monthSelect.value;
  if (m === 'none') { daySelect.innerHTML = ''; return; }

  const days = available
    .filter(s => s.startsWith(`${y}-${m}`))
    .map(s => s.slice(8, 10))
    .sort();
  populate(daySelect, days);
});

/* ─── fetch JSON for the selected day (with caching) ─────── */
function loadDay(y, m, d) {
  const key = iso(y, m, d);
  if (cache.has(key)) return Promise.resolve(cache.get(key));

  return fetch(`/daily_json/${key}.json`)
    .then(r => r.json())
    .then(arr => {
      cache.set(key, arr);
      return arr;
    })
    .catch(() => []);              // if file missing
}

/* ─── main render logic ──────────────────────────────────── */
function render() {
  const y = yearSelect.value,
        m = monthSelect.value,
        d = daySelect.value,
        t = +timeSlider.value;

  // No full date selected → show default preview
  if ([y, m, d].includes('none')) {
    mainImage.src = defaultPreview;
    imageDate && (imageDate.textContent = '');
    timeDisplay.textContent = `Time: ${fmtT(t)}`;
    return;
  }

  loadDay(y, m, d).then(imgs => {
    if (!imgs.length) return;

    const exact  = imgs.filter(i => i.timeMinutes === t);
    const chosen = exact.length
      ? exact[0]
      : imgs.reduce((a, b) =>
          Math.abs(a.timeMinutes - t) < Math.abs(b.timeMinutes - t) ? a : b);

    mainImage.src = chosen.url;
    imageDate && (imageDate.textContent =
      `${chosen.year}-${chosen.month}-${chosen.day}  ` +
      `${chosen.hour}:${chosen.minute}`);
  });

  timeDisplay.textContent = `Time: ${fmtT(t)}`;
}

/* ─── bind events ────────────────────────────────────────── */
[yearSelect, monthSelect, daySelect].forEach(sel =>
  sel.addEventListener('change', render));
timeSlider.addEventListener('input', render);

/* ─── initial UI state ───────────────────────────────────── */
timeSlider.max  = 1439;      // 24 h × 60 m ‑ 1
timeSlider.value = 0;        // begin at the far‑left
timeDisplay.textContent = `Time: ${fmtT(0)}`;

/* optional: draw the initial preview */
render();
