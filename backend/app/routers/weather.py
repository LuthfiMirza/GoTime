import os
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.schemas.weather import WeatherResponse
from app.services.weather_service import fetch_weather, get_forecast, manual_response

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/", response_model=WeatherResponse)
async def get_weather(city: str, date: str, time: str, lat: Optional[float] = None, lon: Optional[float] = None):
    if not city.strip() and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="city atau koordinat wajib diisi")
    try:
        datetime.strptime(date, "%Y-%m-%d")
        datetime.strptime(time, "%H:%M")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Format date/time tidak valid") from exc

    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        return manual_response("API key tidak dikonfigurasi")

    target_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    if lat is not None and lon is not None:
        forecast = get_forecast(lat, lon, target_dt, api_key)
        if forecast is not None:
            return forecast
        return manual_response("Tanggal di luar jangkauan forecast (>5 hari) atau layanan cuaca gagal")

    return fetch_weather(city.strip(), date, time, api_key)
