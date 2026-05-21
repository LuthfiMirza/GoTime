import axios, { AxiosError } from 'axios'
import type { PredictRequest, PredictResponse, WeatherResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

function humanError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>
    const detail = axiosError.response?.data?.detail
    if (detail) return new Error(detail)
    if (axiosError.code === 'ECONNABORTED') return new Error('Request timeout. Coba lagi beberapa saat lagi.')
    if (!axiosError.response) return new Error('Backend tidak dapat dihubungi. Pastikan API berjalan di localhost:8000.')
  }
  return new Error(fallback)
}

export async function fetchPrediction(data: PredictRequest): Promise<PredictResponse> {
  try {
    const response = await api.post<PredictResponse>('/predict/', data)
    return response.data
  } catch (error) {
    throw humanError(error, 'Gagal membuat prediksi jam berangkat.')
  }
}

export async function fetchWeather(city: string, date: string, time: string, coordinates?: { lat: number; lon: number }): Promise<WeatherResponse> {
  try {
    const response = await api.get<WeatherResponse>('/weather/', { params: { city, date, time, ...coordinates } })
    return response.data
  } catch (error) {
    throw humanError(error, 'Gagal mengambil data cuaca.')
  }
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  try {
    const response = await api.get<{ status: string; model_loaded: boolean }>('/health')
    return response.data
  } catch (error) {
    throw humanError(error, 'Gagal mengecek status backend.')
  }
}
