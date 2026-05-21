# GoTime

GoTime adalah aplikasi full-stack untuk memprediksi jam berangkat yang ideal berdasarkan detail perjalanan, kondisi cuaca, estimasi durasi dari maps, buffer keamanan, dan model Machine Learning.

Project ini dibuat sebagai portfolio project dengan arsitektur monorepo:

- `backend/` — FastAPI + scikit-learn model
- `frontend/` — Next.js 14 + TypeScript + Tailwind CSS

## Fitur

- Prediksi jam berangkat berdasarkan waktu acara dan estimasi perjalanan.
- Model Machine Learning `RandomForestRegressor` untuk memprediksi durasi perjalanan aktual.
- Input kondisi perjalanan: jarak, estimasi maps, kendaraan, cuaca, suhu, kelembapan, dan buffer.
- Integrasi OpenWeather untuk cuaca otomatis berdasarkan kota, tanggal, dan waktu.
- Fallback manual jika API key cuaca belum tersedia atau forecast gagal.
- Health check backend dengan status model loaded.
- UI modern dan responsif untuk form prediksi dan kartu hasil.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Axios |
| Backend | FastAPI, Pydantic, Uvicorn, Requests |
| Machine Learning | pandas, scikit-learn, joblib, RandomForestRegressor |
| External API | OpenWeather Geocoding + 5 Day Forecast |

## Struktur Project

```text
GoTime/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
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
│   ├── lib/
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prasyarat

Pastikan sudah terinstall:

- Python 3.9 atau lebih baru
- Node.js 18 atau lebih baru
- npm

## Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Buat virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependency:

```bash
pip install -r requirements.txt
```

Buat file environment:

```bash
cp .env.example .env
```

Isi API key OpenWeather di `backend/.env`:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

> Jika API key belum diisi atau tidak valid, aplikasi tetap berjalan. Fitur cuaca otomatis akan fallback ke input manual.

## Training Model

Jalankan training dari folder `backend/`:

```bash
python scripts/train_model.py
```

Contoh output training:

```text
=== GoTime Model Training ===
Data   : 96 baris (76 train / 20 test)
MAE    : 6.42 menit
R²     : 0.89
Status : ✅ Model siap (MAE < 10 menit)
Saved  : model/travel_time_model.pkl
```

File model `.pkl` dibuat secara lokal di `backend/model/` dan tidak di-commit ke Git.

## Menjalankan Backend

Dari folder `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

Endpoint penting:

- Health check: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`

Contoh response health:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

## Setup Frontend

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file environment jika belum ada:

```bash
cp .env.example .env.local
```

Isi URL backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Jalankan development server:

```bash
npm run dev
```

Buka browser ke:

```text
http://localhost:3000
```

Jika port `3000` sedang dipakai, Next.js akan otomatis memakai port lain seperti `3001`.

## API Contract

### `GET /health`

Response:

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
  "event_date": "2026-05-21",
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
  "prediksi_durasi_menit": 46.8,
  "buffer_menit": 10,
  "total_menit": 56.8,
  "risiko": "Sedang",
  "tips": "Kondisi hujan biasanya menambah 15–30% durasi perjalanan. Waspadai genangan."
}
```

### `GET /weather/`

Query params:

- `city` — nama kota, contoh `Depok`
- `date` — format `YYYY-MM-DD`
- `time` — format `HH:MM`

Contoh:

```text
http://localhost:8000/weather/?city=Depok&date=2026-05-21&time=08:00
```

Response sukses dari API:

```json
{
  "cuaca": "hujan",
  "suhu": 27.3,
  "kelembapan": 85,
  "deskripsi": "light rain",
  "source": "api"
}
```

Response fallback manual:

```json
{
  "cuaca": null,
  "suhu": null,
  "kelembapan": null,
  "deskripsi": "API key tidak dikonfigurasi",
  "source": "manual"
}
```

## Cara Menggunakan Aplikasi

1. Jalankan backend di `localhost:8000`.
2. Jalankan frontend di `localhost:3000` atau port yang ditampilkan Next.js.
3. Isi tanggal dan jam acara.
4. Isi lokasi asal, lokasi tujuan, jarak, dan estimasi durasi maps.
5. Pilih kendaraan dan buffer keamanan.
6. Klik `Ambil Cuaca Otomatis` jika OpenWeather API key valid.
7. Jika cuaca otomatis gagal, isi cuaca, suhu, dan kelembapan secara manual.
8. Klik `Prediksi Jam Berangkat →`.
9. Lihat hasil rekomendasi jam berangkat, risiko, dan tips.

## Catatan Development

- `backend/.env`, `frontend/.env.local`, `frontend/node_modules/`, `frontend/.next/`, dan `backend/model/*.pkl` tidak di-commit.
- File instruksi lokal seperti `PLAN.md` dan `CLAUDE*.md` juga tidak di-commit.
- CORS backend mengizinkan `localhost:3000`, `localhost:3001`, `127.0.0.1:3000`, dan `127.0.0.1:3001` untuk development.

## Status Saat Ini

- Backend health check berhasil dengan `model_loaded: true`.
- Training model berhasil dengan MAE `6.42 menit`.
- Frontend production build berhasil.
- Cuaca otomatis membutuhkan OpenWeather API key yang valid dan aktif.
