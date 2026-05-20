from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT_DIR / "data" / "trips.csv"
MODEL_PATH = ROOT_DIR / "model" / "travel_time_model.pkl"

NUMERIC_FEATURES = [
    "jarak_km",
    "durasi_api_menit",
    "suhu",
    "kelembapan",
    "hari_ke",
    "is_weekend",
    "jam",
    "is_rush_hour",
]
CATEGORICAL_FEATURES = ["cuaca", "jenis_kendaraan"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "durasi_asli_menit"


def add_features(dataframe: pd.DataFrame) -> pd.DataFrame:
    data = dataframe.copy()
    data["tanggal"] = pd.to_datetime(data["tanggal"])
    data["hari_ke"] = data["tanggal"].dt.dayofweek
    data["is_weekend"] = (data["hari_ke"] >= 5).astype(int)
    data["jam"] = pd.to_datetime(data["jam_berangkat"], format="%H:%M").dt.hour
    data["is_rush_hour"] = data["jam"].isin([6, 7, 8, 16, 17, 18]).astype(int)
    return data


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )
    regressor = RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        random_state=42,
    )
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )


def main() -> None:
    dataframe = add_features(pd.read_csv(DATA_PATH))
    X = dataframe[FEATURES]
    y = dataframe[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = build_pipeline()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    status = "✅ Model siap (MAE < 10 menit)" if mae < 10 else "❌ Model perlu ditingkatkan (MAE >= 10 menit)"
    print("=== GoTime Model Training ===")
    print(f"Data   : {len(dataframe)} baris ({len(X_train)} train / {len(X_test)} test)")
    print(f"MAE    : {mae:.2f} menit")
    print(f"R²     : {r2:.2f}")
    print(f"Status : {status}")
    print(f"Saved  : {MODEL_PATH.relative_to(ROOT_DIR)}")

    if mae >= 10:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
