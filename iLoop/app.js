const fileInput = document.getElementById("fileInput");
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const timeSlider = document.getElementById("timeSlider");
const timeLabel = document.getElementById("timeLabel");
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
  const index = findClosestImageByTime(timeSlider.value);
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

  yearSelect.innerHTML = '<option value="all">All</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
  monthSelect.innerHTML = '<option value="all">All</option>' + months.map(m => `<option value="${m}">${m}</option>`).join('');
}

function updateDayOptions() {
  const year = yearSelect.value;
  const month = monthSelect.value;
  let daysInMonth = 31;

  if (year !== "all" && month !== "all") {
    daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  }

  daySelect.innerHTML = `<option value="all">All</option>`;
  for (let d = 1; d <= daysInMonth; d++) {
    daySelect.innerHTML += `<option value="${d}">${d}</option>`;
  }
}

function filterAndRender() {
  const y = yearSelect.value;
  const m = monthSelect.value;
  const d = daySelect.value;

  filteredImages = images.filter((img) => {
    const date = img.date;
    const matchY = y === "all" || date.getFullYear().toString() === y;
    const matchM = m === "all" || (date.getMonth() + 1).toString() === m;
    const matchD = d === "all" || date.getDate().toString() === d;
    return matchY && matchM && matchD;
  });

  filteredImages.sort((a, b) => a.date - b.date);

  renderThumbnails();
  if (filteredImages.length) {
    updatePreview(0);
  } else {
    mainImage.src = "";
    imageDateTop.textContent = "";
    imageDateBottom.textContent = "No images match the filters.";
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
  timeLabel.textContent = formatTime(minutes);
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
