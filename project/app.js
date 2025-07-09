/* ---------- app.js ---------- */

const yearSelect  = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const daySelect   = document.getElementById('daySelect');
const timeSlider  = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const mainImage   = document.getElementById('mainImage');

/* ─── carousel controls ─────────────────────────────────── */
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playBtn = document.getElementById('playBtn');

let currentImgs  = [];
let currentIndex = 0;
let playing      = false;
let playTimer    = null;
/* ───────────────────────────────────────────────────────── */

const cache     = new Map();  // "YYYY‑MM‑DD" → image array
let   available = [];         // list of dates we have JSON for

const defaultPreview = 'preview.png';
mainImage.src = defaultPreview;

/* ─── helpers ───────────────────────────────────────────── */
const pad  = n => String(n).padStart(2,'0');
const iso  = (y,m,d)=>`${y}-${m}-${d}`;
const fmtT = mins => `${(mins/60)|0}:${pad(mins%60)}`;

function populate(select, vals){
  select.innerHTML = '<option value="none">–</option>';
  vals.forEach(v=>{
    const o = document.createElement('option');
    o.value = o.textContent = v;
    select.appendChild(o);
  });
}

/* ─── build YEAR menu ───────────────────────────────────── */
fetch('./daily_json/dates.json')
  .then(r=>r.json())
  .then(dates=>{
    available = dates;
    const years = [...new Set(dates.map(s=>s.slice(0,4)))].sort();
    populate(yearSelect, years);
  });

/* ─── YEAR change ───────────────────────────────────────── */
yearSelect.addEventListener('change', ()=>{
  stopPlaying();

  const y = yearSelect.value;
  if(y==='none'){
    monthSelect.innerHTML = daySelect.innerHTML = '';
    render();
    return;
  }

  const months = [...new Set(
    available.filter(s=>s.startsWith(y)).map(s=>s.slice(5,7))
  )].sort();
  populate(monthSelect, months);
  daySelect.innerHTML = '';
  render();
});

/* ─── MONTH change ──────────────────────────────────────── */
monthSelect.addEventListener('change', ()=>{
  stopPlaying();

  const y = yearSelect.value, m = monthSelect.value;
  if(m==='none'){
    daySelect.innerHTML = '';
    render();
    return;
  }

  const days = available
    .filter(s=>s.startsWith(`${y}-${m}`))
    .map(s=>s.slice(8,10))
    .sort();
  populate(daySelect, days);
  render();
});

/* ─── DAY change  ➜  NEW!  (shows first photo) ──────────── */
daySelect.addEventListener('change', () => {
  stopPlaying();
  timeSlider.value = 0;   // ensures render() picks the day’s 1st shot
  render();
});

/* ─── fetch JSON for a day (with caching) ───────────────── */
function loadDay(y,m,d){
  const key = iso(y,m,d);
  if(cache.has(key)) return Promise.resolve(cache.get(key));

  return fetch(`./daily_json/${key}.json`)
    .then(r=>r.json())
    .then(arr=>{ cache.set(key,arr); return arr; })
    .catch(()=>[]);
}

/* ─── carousel helpers ─────────────────────────────────── */
function showImageByIndex(i){
  if(!currentImgs.length) return;
  currentIndex = ((i%currentImgs.length)+currentImgs.length)%currentImgs.length;
  const img = currentImgs[currentIndex];

  mainImage.src    = img.url;
  timeSlider.value = img.timeMinutes;
  timeDisplay.textContent = `Time: ${fmtT(img.timeMinutes)}`;
}

function startPlaying(){
  if(!currentImgs.length) return;
  playing = true;
  playBtn.textContent = 'Pause';
  playTimer = setInterval(()=>showImageByIndex(currentIndex+1), 1000);
}
function stopPlaying(){
  playing = false;
  playBtn.textContent = 'Play';
  clearInterval(playTimer);
}

/* ─── master render routine ─────────────────────────────── */
function render(){
  const y = yearSelect.value,
        m = monthSelect.value,
        d = daySelect.value,
        t = +timeSlider.value;

  if([y,m,d].includes('none')){
    currentImgs = [];
    mainImage.src = defaultPreview;
    timeDisplay.textContent = `Time: ${fmtT(t)}`;
    return;
  }

  loadDay(y,m,d).then(imgs=>{
    currentImgs = imgs;
    if(!imgs.length) return;

    const chosen = imgs.reduce((a,b)=>
      Math.abs(a.timeMinutes - t) < Math.abs(b.timeMinutes - t) ? a : b);
    currentIndex = imgs.indexOf(chosen);
    showImageByIndex(currentIndex);
  });
}

/* ─── slider handler ────────────────────────────────────── */
timeSlider.addEventListener('input', ()=>{
  stopPlaying();

  if(currentImgs.length){
    const nearest = currentImgs.reduce((a,b)=>
      Math.abs(a.timeMinutes - timeSlider.value) <
      Math.abs(b.timeMinutes - timeSlider.value) ? a : b);
    currentIndex = currentImgs.indexOf(nearest);
  }
  render();
});

/* ─── carousel buttons ──────────────────────────────────── */
prevBtn.addEventListener('click',()=>{stopPlaying();showImageByIndex(currentIndex-1)});
nextBtn.addEventListener('click',()=>{stopPlaying();showImageByIndex(currentIndex+1)});
playBtn.addEventListener('click',()=>playing?stopPlaying():startPlaying());

/* ─── initial UI state ──────────────────────────────────── */
timeSlider.max   = 1439;
timeSlider.value = 0;
timeDisplay.textContent = `Time: ${fmtT(0)}`;
render();
