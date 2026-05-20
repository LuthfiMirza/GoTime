from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

from app.schemas.predict import PredictRequest, PredictResponse

ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT_DIR / "model" / "travel_time_model.pkl"
_model: Optional[Pipeline] = None


def load_model() -> Pipeline:
    if not MODEL_PATH.exists():
        raise RuntimeError("Model belum tersedia. Jalankan scripts/train_model.py terlebih dahulu.")
    return joblib.load(MODEL_PATH)


def set_model(model: Optional[Pipeline]) -> None:
    global _model
    _model = model


def get_model() -> Optional[Pipeline]:
    return _model


def calculate_risk(predicted_duration: float, buffer_menit: int) -> str:
    if buffer_menit >= predicted_duration * 0.3:
        return "Rendah"
    if buffer_menit >= predicted_duration * 0.15:
        return "Sedang"
    return "Tinggi"


def generate_tips(cuaca: str, jam: int, is_weekend: bool) -> str:
    if cuaca == "hujan":
        return "Kondisi hujan biasanya menambah 15–30% durasi perjalanan. Waspadai genangan."
    if jam in [6, 7, 8, 16, 17, 18]:
        return "Jam sibuk terdeteksi. Pertimbangkan berangkat 10–15 menit lebih awal."
    if is_weekend:
        return "Akhir pekan biasanya lebih lancar, namun tetap pantau kondisi jalan."
    return "Kondisi perjalanan terlihat normal. Tetap patuhi aturan lalu lintas."


def predict(request: PredictRequest) -> PredictResponse:
    model = get_model()
    if model is None:
        raise RuntimeError("Model belum siap")

    event_datetime = datetime.strptime(
        f"{request.event_date} {request.event_time}",
        "%Y-%m-%d %H:%M",
    )
    hari_ke = event_datetime.weekday()
    is_weekend = hari_ke >= 5
    jam = event_datetime.hour
    is_rush_hour = jam in [6, 7, 8, 16, 17, 18]

    features = pd.DataFrame([
        {
            "jarak_km": request.jarak_km,
            "durasi_api_menit": request.durasi_api_menit,
            "suhu": request.suhu,
            "kelembapan": request.kelembapan,
            "hari_ke": hari_ke,
            "is_weekend": int(is_weekend),
            "jam": jam,
            "is_rush_hour": int(is_rush_hour),
            "cuaca": request.cuaca,
            "jenis_kendaraan": request.jenis_kendaraan,
        }
    ])
    predicted_duration = round(float(model.predict(features)[0]), 1)
    total_minutes = round(predicted_duration + request.buffer_menit, 1)
    departure_time = event_datetime - timedelta(minutes=total_minutes)

    return PredictResponse(
        jam_berangkat=departure_time.strftime("%H:%M"),
        prediksi_durasi_menit=predicted_duration,
        buffer_menit=request.buffer_menit,
        total_menit=total_minutes,
        risiko=calculate_risk(predicted_duration, request.buffer_menit),
        tips=generate_tips(request.cuaca, jam, is_weekend),
    )
