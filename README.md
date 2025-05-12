# iLoop

**iLoop** is a lightweight, interactive timelapse viewer that displays photos based on their timestamped directory. With an intuitive filter system and smooth controls, you can browse your moments hour by hour, day by day.

---

## 🗂 Folder Structure

Organize your photos inside the `assets` folder using the following format:

```

assets/
├── YYYY/
│   ├── MM/
│   │   ├── DD/
│   │   │   ├── HH/
│   │   │   │   ├── photo1_YYYY-MM-DD_HH-MM-SS.jpg
│   │   │   │   ├── photo2_YYYY-MM-DD_HH-MM-SS.jpg

````

Where:
- `YYYY` = Year (e.g., 2024)
- `MM` = Month (e.g., 07)
- `DD` = Day (e.g., 15)
- `HH` = Hour in 24-hour format (e.g., 13)
Note: You must delete the .txt file inside the folder to avoid any errors.
---

## ⚙️ Setup & Usage

### 1. Add Your Images

Place your timestamped images in the correct folder structure inside the `assets/` directory.

### 2. Generate JSON Data

Run the Python script to generate the data files:

```bash
python generate_data_json.py
````

> This will create a `data.json` file for **each day**, used by the webpage to load the images.

---

## 🌐 How It Works

Open the `index.html` file in your browser. You'll see:

### 🔎 Filters

* **Year**
* **Month**
* **Day**

These determine the folder path to load your images.

### 🕒 Time Slider

Use the slider to view photos by **hour** of the day. It creates a smooth **timelapse** effect.

### 🎮 Controls

* ⬅️ ➡️ : Navigate photos manually using left/right arrow buttons.
* ▶️ ⏸️ : Start/stop the **auto-play mode** to cycle through images like a slideshow.

---

## ✅ Requirements

* Python 3.x (for running the script)
* A modern browser (Chrome, Firefox, Edge, etc.)

---

## 📌 Notes

* Be sure to re-run `generate_data_json.py` every time you add new images.
* Images must follow the strict folder structure or they won’t be detected.

---

## 🚀 Enjoy your timelapse journey with iLoop!
