const fileInput = document.getElementById("fileInput");
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const timeSlider = document.getElementById("timeSlider");
const timeDisplay = document.getElementById("timeDisplay");
const mainImage = document.getElementById("mainImage");
const imageDateTop = document.getElementById("imageDateTop");
const imageDateBottom = document.getElementById("imageDateBottom");
const thumbnailGrid = document.getElementById("thumbnailGrid");

let images = [];
let filteredImages = [];

fileInput.addEventListener("change", handleFiles);
yearSelect.addEventListener("change", () => {
  updateDayOptions();
  filterAndRender();
});
monthSelect.addEventListener("change", () => {
  updateDayOptions();
  filterAndRender();
});
daySelect.addEventListener("change", filterAndRender);

timeSlider.addEventListener("input", () => {
  const value = parseInt(timeSlider.value, 10);
  timeDisplay.textContent = `Time: ${formatTime(value)}`;
  const index = findClosestImageByTime(value);
  updatePreview(index);
});

function handleFiles(e) {
  const files = Array.from(e.target.files);
  let loaded = 0;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        EXIF.getData(img, function () {
          let dateStr = EXIF.getTag(this, "DateTimeOriginal");
          if (!dateStr) {
            dateStr = new Date(file.lastModified).toISOString();
          } else {
            dateStr = dateStr.replace(/^(.{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
          }
          const date = new Date(dateStr);
          images.push({ url: event.target.result, date });
          loaded++;
          if (loaded === files.length) {
            populateYearMonthOptions();
            updateDayOptions();
            filterAndRender();
          }
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function populateYearMonthOptions() {
  const years = [...new Set(images.map((i) => i.date.getFullYear()))].sort();
  const months = [...new Set(images.map((i) => i.date.getMonth() + 1))].sort();

  yearSelect.innerHTML = '<option value="none">None</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
  monthSelect.innerHTML = '<option value="none">None</option>' + months.map(m => `<option value="${m}">${m}</option>`).join('');
}

function updateDayOptions() {
  const year = yearSelect.value;
  const month = monthSelect.value;

  let relevantImages = images;

  if (year !== "none") {
    relevantImages = relevantImages.filter(img => img.date.getFullYear().toString() === year);
  }

  if (month !== "none") {
    relevantImages = relevantImages.filter(img => (img.date.getMonth() + 1).toString() === month);
  }

  const days = [...new Set(relevantImages.map(i => i.date.getDate()))].sort((a, b) => a - b);
  daySelect.innerHTML = `<option value="none">None</option>` + days.map(d => `<option value="${d}">${d}</option>`).join('');
}

function filterAndRender() {
  const y = yearSelect.value;
  const m = monthSelect.value;
  const d = daySelect.value;

  filteredImages = images.filter((img) => {
    const date = img.date;
    const matchY = y === "none" || date.getFullYear().toString() === y;
    const matchM = m === "none" || (date.getMonth() + 1).toString() === m;
    const matchD = d === "none" || date.getDate().toString() === d;
    return matchY && matchM && matchD;
  });

  filteredImages.sort((a, b) => a.date - b.date);

  renderThumbnails();
  if (filteredImages.length) {
    const firstImg = filteredImages[0];
    const firstTimeMinutes = firstImg.date.getHours() * 60 + firstImg.date.getMinutes();
    timeSlider.value = firstTimeMinutes;
    timeDisplay.textContent = `Time: ${formatTime(firstTimeMinutes)}`;
    updatePreview(0);
  } else {
    mainImage.src = "";
    imageDateTop.textContent = "";
    imageDateBottom.textContent = "No images match the filters.";
    timeDisplay.textContent = "Time: 00:00";
  }
}

function renderThumbnails() {
  thumbnailGrid.innerHTML = "";
  filteredImages.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = img.url;
    thumb.title = img.date.toLocaleString();
    thumb.addEventListener("click", () => updatePreview(index));
    thumbnailGrid.appendChild(thumb);
  });
}

function updatePreview(index) {
  const img = filteredImages[index];
  if (!img) return;
  mainImage.src = img.url;

  const dateString = img.date.toLocaleString();
  imageDateTop.textContent = dateString;
  imageDateBottom.textContent = dateString;

  const minutes = img.date.getHours() * 60 + img.date.getMinutes();
  timeSlider.value = minutes;
  timeDisplay.textContent = `Time: ${formatTime(minutes)}`;
}

function findClosestImageByTime(minuteValue) {
  let closest = 0;
  let closestDiff = Infinity;
  filteredImages.forEach((img, i) => {
    const imgMin = img.date.getHours() * 60 + img.date.getMinutes();
    const diff = Math.abs(imgMin - minuteValue);
    if (diff < closestDiff) {
      closest = i;
      closestDiff = diff;
    }
  });
  return closest;
}

function formatTime(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
