# GoTime — Smart Departure & Travel Planner

GoTime adalah aplikasi full-stack untuk memprediksi **jam berangkat terbaik** agar pengguna tiba tepat waktu. Aplikasi ini menggabungkan dashboard travel planner modern, routing interaktif, cuaca otomatis, dan model Machine Learning untuk menghitung rekomendasi waktu berangkat.

## Highlight

- **Dashboard travel planner modern** dengan layout sidebar, live route map, smart departure card, weather card, dan trip readiness.
- **Prediksi jam berangkat berbasis ML** menggunakan `RandomForestRegressor`.
- **Interactive route map** dengan Leaflet + Geoapify tiles, mendukung zoom, drag, marker, dan route line.
- **Autocomplete lokasi Indonesia** menggunakan Geoapify Geocoder Autocomplete.
- **Gunakan lokasi saya** via browser geolocation + reverse geocoding.
- **Mode rute**: Motor, Mobil, dan Transportasi Umum.
- **Motor route** diarahkan untuk menghindari tol/highway.
- **Cuaca otomatis** dari OpenWeather berdasarkan koordinat lokasi asal.
- **Fallback manual** jika routing/cuaca/API key tidak tersedia.
- **Swagger docs** tersedia dari backend FastAPI.

## Preview Fitur

Flow utama aplikasi:

```text
Pilih tanggal & jam acara
→ pilih lokasi asal/tujuan atau pakai GPS
→ pilih mode rute
→ map interaktif + jarak + durasi muncul
→ cuaca otomatis terisi
→ klik prediksi
→ GoTime memberi jam berangkat, risiko, dan tips
```

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Axios, Lucide React |
| Map & Geocoding | Geoapify, Leaflet, React Leaflet |
| Backend | FastAPI, Pydantic, Uvicorn, Requests |
| Machine Learning | pandas, scikit-learn, joblib, RandomForestRegressor |
| Weather API | OpenWeather Forecast API |

## Struktur Project

```text
GoTime/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── predict.py
│   │   │   └── weather.py
│   │   ├── schemas/
│   │   └── services/
│   ├── data/trips.csv
│   ├── scripts/train_model.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Procfile
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── InteractiveMap.tsx
│   │   ├── LocationInput.tsx
│   │   ├── PredictForm.tsx
│   │   ├── RouteMap.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts
│   │   ├── geo.ts
│   │   └── types.ts
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prasyarat

- Python 3.9 atau lebih baru
- Node.js 18 atau lebih baru
- npm
- API key OpenWeather untuk cuaca otomatis
- API key Geoapify untuk autocomplete, routing, map tiles, dan reverse geocoding

## Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Isi `backend/.env`:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

> Jika API key OpenWeather kosong/tidak valid, aplikasi tetap berjalan dan cuaca otomatis fallback ke mode manual.

## Training Model

Jalankan dari folder `backend/`:

```bash
python scripts/train_model.py
```

Hasil verifikasi terakhir:

```text
=== GoTime Model Training ===
Data   : 96 baris (76 train / 20 test)
MAE    : 6.42 menit
R²     : 0.89
Status : ✅ Model siap (MAE < 10 menit)
Saved  : model/travel_time_model.pkl
```

File model `.pkl` dibuat lokal di `backend/model/` dan tidak di-commit.

## Menjalankan Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Endpoint penting:

- Health check: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`

Contoh response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

## Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Isi `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_api_key_here
```

Jalankan frontend:

```bash
npm run dev
```

Buka URL yang muncul, biasanya:

```text
http://localhost:3000
```

Jika port 3000/3001 terpakai, Next.js otomatis memakai port berikutnya seperti `3002`.

## API Contract

### `GET /health`

```json
{
  "status": "ok",
  "model_loaded": true
}
```

### `POST /predict/`

Request:

```json
{
  "event_time": "08:00",
  "event_date": "2026-05-22",
  "jarak_km": 8.2,
  "durasi_api_menit": 35,
  "cuaca": "hujan",
  "suhu": 27,
  "kelembapan": 85,
  "jenis_kendaraan": "motor",
  "buffer_menit": 10
}
```

Response:

```json
{
  "jam_berangkat": "07:03",
  "prediksi_durasi_menit": 46.9,
  "buffer_menit": 10,
  "total_menit": 56.9,
  "risiko": "Sedang",
  "tips": "Kondisi hujan biasanya menambah 15–30% durasi perjalanan. Waspadai genangan."
}
```

### `GET /weather/`

Query params:

- `city` — nama kota/alamat fallback
- `date` — format `YYYY-MM-DD`
- `time` — format `HH:MM`
- `lat` dan `lon` — opsional, direkomendasikan untuk cuaca akurat berdasarkan lokasi asal

Contoh:

```text
http://localhost:8000/weather/?city=Depok&date=2026-05-22&time=08:00&lat=-6.40719&lon=106.81584
```

Response sukses:

```json
{
  "cuaca": "berawan",
  "suhu": 30.8,
  "kelembapan": 61,
  "deskripsi": "broken clouds",
  "source": "api"
}
```

Response fallback:

```json
{
  "cuaca": null,
  "suhu": null,
  "kelembapan": null,
  "deskripsi": "API key tidak dikonfigurasi",
  "source": "manual"
}
```

## Cara Menggunakan

1. Jalankan backend di `localhost:8000`.
2. Jalankan frontend dan buka URL yang ditampilkan Next.js.
3. Isi tanggal dan jam acara.
4. Pilih lokasi asal dengan autocomplete atau tombol `Lokasi saya`.
5. Pilih lokasi tujuan.
6. Pilih mode rute: Motor, Mobil, atau Umum.
7. Lihat map interaktif, jarak, dan estimasi durasi otomatis.
8. Cek cuaca otomatis atau isi manual jika fallback.
9. Atur buffer keamanan.
10. Klik `Prediksi Jam Berangkat`.
11. Lihat rekomendasi jam berangkat, risiko, tips, dan ringkasan dashboard.

## Verifikasi Terakhir

Verifikasi lokal terakhir berhasil:

- Training model: `MAE 6.42 menit`
- Backend `/health`: `model_loaded: true`
- Backend `/predict/`: response sukses dengan `jam_berangkat`
- Frontend `npm run build`: sukses

## Catatan Development

File berikut sengaja tidak di-commit:

- `backend/.env`
- `frontend/.env.local`
- `frontend/node_modules/`
- `frontend/.next/`
- `backend/model/*.pkl`
- `PLAN.md`
- `CLAUDE.md`
- `backend/CLAUDE-backend.md`
- `frontend/CLAUDE-frontend.md`

CORS backend sudah mengizinkan port development lokal umum seperti `localhost:3000`, `3001`, dan `3002`.

## Status Project

Project siap untuk dipresentasikan sebagai portfolio full-stack ML dashboard. Bagian utama yang sudah kuat:

- Backend API jelas dan terdokumentasi lewat Swagger.
- Model ML sudah memenuhi target MAE `< 10 menit`.
- Frontend sudah berbentuk dashboard modern.
- Map sudah interaktif, bukan static image.
- Secret/API key aman karena tidak di-commit.
