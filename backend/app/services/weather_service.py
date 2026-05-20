from datetime import datetime
from typing import Optional

import requests

from app.schemas.weather import WeatherResponse

WEATHER_MAP = {
    "Clear": "cerah",
    "Clouds": "berawan",
    "Rain": "hujan",
    "Drizzle": "hujan",
    "Thunderstorm": "hujan",
    "Snow": "berawan",
    "Mist": "berawan",
    "Fog": "berawan",
    "Haze": "berawan",
    "Dust": "berawan",
    "Sand": "berawan",
}


def manual_response(message: str) -> WeatherResponse:
    return WeatherResponse(
        cuaca=None,
        suhu=None,
        kelembapan=None,
        deskripsi=message,
        source="manual",
    )


def get_coordinates(city: str, api_key: str) -> Optional[tuple[float, float]]:
    try:
        response = requests.get(
            "http://api.openweathermap.org/geo/1.0/direct",
            params={"q": city, "limit": 1, "appid": api_key},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
        if not data:
            return None
        return float(data[0]["lat"]), float(data[0]["lon"])
    except requests.RequestException:
        return None


def get_forecast(lat: float, lon: float, target_dt: datetime, api_key: str) -> Optional[WeatherResponse]:
    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"lat": lat, "lon": lon, "units": "metric", "appid": api_key},
            timeout=5,
        )
        response.raise_for_status()
        forecasts = response.json().get("list", [])
        if not forecasts:
            return None

        closest = min(
            forecasts,
            key=lambda item: abs(datetime.fromtimestamp(item["dt"]) - target_dt),
        )
        closest_dt = datetime.fromtimestamp(closest["dt"])
        if abs((closest_dt - target_dt).total_seconds()) > 60 * 60 * 6:
            return None

        weather_main = closest.get("weather", [{}])[0].get("main", "")
        return WeatherResponse(
            cuaca=WEATHER_MAP.get(weather_main, "berawan"),
            suhu=round(float(closest.get("main", {}).get("temp")), 1),
            kelembapan=int(closest.get("main", {}).get("humidity")),
            deskripsi=closest.get("weather", [{}])[0].get("description", "forecast tersedia"),
            source="api",
        )
    except (requests.RequestException, KeyError, TypeError, ValueError):
        return None


def fetch_weather(city: str, date_str: str, time_str: str, api_key: str) -> WeatherResponse:
    try:
        target_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        return manual_response("Format tanggal atau waktu tidak valid")

    coordinates = get_coordinates(city, api_key)
    if coordinates is None:
        return manual_response("Kota tidak ditemukan atau layanan geocoding gagal")

    forecast = get_forecast(coordinates[0], coordinates[1], target_dt, api_key)
    if forecast is None:
        return manual_response("Tanggal di luar jangkauan forecast (>5 hari) atau layanan cuaca gagal")
    return forecast
