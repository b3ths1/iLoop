# iLoop

**iLoop** is a minimalist, Apple-style web app designed for managing and visualizing photos captured every minute of every day. It allows users to upload images, then filter and browse them by **year, month, day**, and a **24-hour time slider** based on embedded EXIF metadata.

---

## Features

- Upload multiple photos from your device.
- Filter images by **Year**, **Month**, and **Day**.
- Use a **time slider** (00:00 – 23:59) to browse by exact capture time.
- Reads and parses **EXIF metadata** (`DateTimeOriginal`) to extract timestamps.
- Interactive thumbnail grid with image preview and delete option.
- Clean and responsive Apple-like user interface.
- Lightweight, no backend required — runs fully in the browser.

---

## Technologies Used

- **HTML5, CSS3, JavaScript**
- [EXIF.js](https://github.com/exif-js/exif-js) – To read metadata from images
