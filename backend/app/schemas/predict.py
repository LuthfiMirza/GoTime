from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    event_time: str
    event_date: str
    jarak_km: float = Field(gt=0)
    durasi_api_menit: float = Field(gt=0)
    cuaca: str
    suhu: float
    kelembapan: float = Field(ge=0, le=100)
    jenis_kendaraan: str
    buffer_menit: int = Field(default=10, ge=0, le=60)

    @field_validator("cuaca")
    @classmethod
    def validate_cuaca(cls, value: str) -> str:
        allowed = {"cerah", "hujan", "berawan"}
        if value not in allowed:
            raise ValueError(f"cuaca harus salah satu dari {sorted(allowed)}")
        return value

    @field_validator("jenis_kendaraan")
    @classmethod
    def validate_jenis_kendaraan(cls, value: str) -> str:
        allowed = {"motor", "mobil", "transportasi_umum"}
        if value not in allowed:
            raise ValueError(f"jenis_kendaraan harus salah satu dari {sorted(allowed)}")
        return value


class PredictResponse(BaseModel):
    jam_berangkat: str
    prediksi_durasi_menit: float
    buffer_menit: int
    total_menit: float
    risiko: str
    tips: str
