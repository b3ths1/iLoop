/* ---------- app.js ---------- */
fetch('data.json')
  .then(r => r.json())
  .then(data => {
    /* ─── DOM handles ─────────────────────────── */
    const yearSelect    = document.getElementById('yearSelect');
    const monthSelect   = document.getElementById('monthSelect');
    const daySelect     = document.getElementById('daySelect');
    const timeSlider    = document.getElementById('timeSlider');
    const timeDisplay   = document.getElementById('timeDisplay');
    const mainImage     = document.getElementById('mainImage');
    const imageDateTop  = document.getElementById('imageDateTop');
    const thumbnailGrid = document.getElementById('thumbnailGrid');

    /* ─── enrich JSON: calculate absolute minutes (0–1439) ─── */
    data.forEach(img => {
      if (img.minute === undefined) {
        const m = img.path.match(/-(\d{2})-\d{2}\.\w+$/);
        img.minute = m ? m[1] : '00';
      }
      img.timeMinutes = (+img.hour) * 60 + (+img.minute);
    });

    /* ─── populate dropdowns ─── */
    function populate(select, values) {
      select.innerHTML = '<option value="none">All</option>';
      values.forEach(v => {
        const o = document.createElement('option');
        o.value = o.textContent = v;
        select.appendChild(o);
      });
    }

    populate(yearSelect , [...new Set(data.map(i => i.year ))].sort());
    populate(monthSelect, [...new Set(data.map(i => i.month))].sort());
    populate(daySelect  , [...new Set(data.map(i => i.day  ))].sort());

    /* ─── format minutes to HH:MM ─── */
    function formatTime(mins) {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      return `${h}:${m}`;
    }

    /* ─── main render logic ─── */
    function render() {
      const y = yearSelect.value,
            m = monthSelect.value,
            d = daySelect.value,
            t = +timeSlider.value;

      // Sync the timeDisplay
      timeDisplay.textContent = `Time: ${formatTime(t)}`;

      let imgs = data;
      if (y !== 'none') imgs = imgs.filter(i => i.year  === y);
      if (m !== 'none') imgs = imgs.filter(i => i.month === m);
      if (d !== 'none') imgs = imgs.filter(i => i.day   === d);

      const exact = imgs.filter(i => i.timeMinutes === t);
      const toShow = exact.length ? exact
                     : imgs.sort((a, b) =>
                         Math.abs(a.timeMinutes - t) - Math.abs(b.timeMinutes - t))
                       .slice(0, 1);

      if (toShow.length) setMain(toShow[0]);

      thumbnailGrid.innerHTML = '';
      imgs.forEach(i => {
        const im = document.createElement('img');
        im.src = i.url;
        im.onclick = () => setMain(i);
        thumbnailGrid.appendChild(im);
      });
    }

    /* ─── helper to set main image & caption ─── */
    function setMain(img) {
      mainImage.src = img.url;
      imageDateTop.textContent =
        `${img.year}-${img.month}-${img.day}  ${img.hour}:${img.minute}`;
      timeSlider.value = img.timeMinutes;
      timeDisplay.textContent = `Time: ${formatTime(img.timeMinutes)}`; // also sync display on click
    }

    /* ─── bind events ─── */
    [yearSelect, monthSelect, daySelect].forEach(sel =>
      sel.addEventListener('change', render));
    timeSlider.addEventListener('input', render);

    /* ─── initial render ─── */
    render();
  });
