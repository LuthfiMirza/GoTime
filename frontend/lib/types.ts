export interface PredictRequest {
  event_time: string
  event_date: string
  jarak_km: number
  durasi_api_menit: number
  cuaca: string
  suhu: number
  kelembapan: number
  jenis_kendaraan: string
  buffer_menit: number
}

export interface PredictResponse {
  jam_berangkat: string
  prediksi_durasi_menit: number
  buffer_menit: number
  total_menit: number
  risiko: 'Rendah' | 'Sedang' | 'Tinggi'
  tips: string
}

export interface WeatherResponse {
  cuaca: string | null
  suhu: number | null
  kelembapan: number | null
  deskripsi: string
  source: 'api' | 'manual'
}

export interface FormState {
  event_date: string
  event_time: string
  asal: string
  tujuan: string
  jarak_km: number
  durasi_api_menit: number
  cuaca: string
  suhu: number
  kelembapan: number
  jenis_kendaraan: string
  buffer_menit: number
}
