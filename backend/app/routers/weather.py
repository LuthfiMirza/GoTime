import os
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.schemas.weather import WeatherResponse
from app.services.weather_service import fetch_weather, manual_response

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/", response_model=WeatherResponse)
async def get_weather(city: str, date: str, time: str):
    if not city.strip():
        raise HTTPException(status_code=400, detail="city tidak boleh kosong")
    try:
        datetime.strptime(date, "%Y-%m-%d")
        datetime.strptime(time, "%H:%M")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Format date/time tidak valid") from exc

    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        return manual_response("API key tidak dikonfigurasi")
    return fetch_weather(city.strip(), date, time, api_key)
