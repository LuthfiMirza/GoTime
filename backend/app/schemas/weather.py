from typing import Optional

from pydantic import BaseModel


class WeatherResponse(BaseModel):
    cuaca: Optional[str]
    suhu: Optional[float]
    kelembapan: Optional[int]
    deskripsi: str
    source: str
