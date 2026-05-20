'use client'

import { FormEvent, useRef, useState } from 'react'
import { fetchPrediction, fetchWeather } from '@/lib/api'
import type { FormState, PredictRequest, PredictResponse, WeatherResponse } from '@/lib/types'
import ResultCard from './ResultCard'
import WeatherBadge from './WeatherBadge'

const today = new Date().toISOString().slice(0, 10)

const defaultForm: FormState = {
  event_date: today,
  event_time: '08:00',
  asal: '',
  tujuan: '',
  jarak_km: 8.2,
  durasi_api_menit: 35,
  cuaca: 'cerah',
  suhu: 28,
  kelembapan: 75,
  jenis_kendaraan: 'motor',
  buffer_menit: 10,
}

const vehicleOptions = [
  { value: 'motor', label: 'Motor', icon: '🏍' },
  { value: 'mobil', label: 'Mobil', icon: '🚗' },
  { value: 'transportasi_umum', label: 'Umum', icon: '🚌' },
]

export default function PredictForm() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleWeather() {
    setWeatherLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(form.asal, form.event_date, form.event_time)
      setWeather(data)
      if (data.cuaca) update('cuaca', data.cuaca)
      if (data.suhu !== null) update('suhu', data.suhu)
      if (data.kelembapan !== null) update('kelembapan', data.kelembapan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil cuaca otomatis.')
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    const payload: PredictRequest = {
      event_time: form.event_time,
      event_date: form.event_date,
      jarak_km: Number(form.jarak_km),
      durasi_api_menit: Number(form.durasi_api_menit),
      cuaca: form.cuaca,
      suhu: Number(form.suhu),
      kelembapan: Number(form.kelembapan),
      jenis_kendaraan: form.jenis_kendaraan,
      buffer_menit: Number(form.buffer_menit),
    }

    try {
      const prediction = await fetchPrediction(payload)
      setResult(prediction)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat prediksi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5 px-4">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card title="Detail Acara" description="Tentukan kapan kamu perlu tiba.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal acara">
            <input className="input" type="date" min={today} value={form.event_date} onChange={(e) => update('event_date', e.target.value)} />
          </Field>
          <Field label="Jam acara">
            <input className="input" type="time" value={form.event_time} onChange={(e) => update('event_time', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Rute" description="Masukkan estimasi dari maps favoritmu.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lokasi asal">
            <input className="input" value={form.asal} onChange={(e) => update('asal', e.target.value)} placeholder="contoh: Depok, Jawa Barat" />
          </Field>
          <Field label="Lokasi tujuan">
            <input className="input" value={form.tujuan} onChange={(e) => update('tujuan', e.target.value)} placeholder="contoh: Universitas Indonesia, Depok" />
          </Field>
          <Field label="Jarak (km)">
            <input className="input" type="number" min="0.1" step="0.1" value={form.jarak_km} onChange={(e) => update('jarak_km', Number(e.target.value))} />
          </Field>
          <Field label="Estimasi Maps (menit)">
            <input className="input" type="number" min="1" value={form.durasi_api_menit} onChange={(e) => update('durasi_api_menit', Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      <Card title="Kondisi" description="Tambahkan kendaraan, buffer, dan cuaca.">
        <div className="space-y-5">
          <Field label="Jenis kendaraan">
            <div className="grid grid-cols-3 gap-2">
              {vehicleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update('jenis_kendaraan', option.value)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${form.jenis_kendaraan === option.value ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200'}`}
                >
                  <span className="mr-1">{option.icon}</span> {option.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Buffer keamanan: ${form.buffer_menit} menit`}>
            <input className="w-full accent-indigo-600" type="range" min="0" max="60" step="5" value={form.buffer_menit} onChange={(e) => update('buffer_menit', Number(e.target.value))} />
          </Field>

          {form.asal && form.event_date && (
            <div className="space-y-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Cuaca otomatis</p>
                  <p className="text-sm text-zinc-500">Ambil prakiraan dari lokasi asal.</p>
                </div>
                <button type="button" onClick={handleWeather} disabled={weatherLoading} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950">
                  {weatherLoading ? 'Mengambil…' : 'Ambil Cuaca Otomatis'}
                </button>
              </div>
              {weather && <WeatherBadge weather={weather} />}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Cuaca">
              <select className="input" value={form.cuaca} onChange={(e) => update('cuaca', e.target.value)}>
                <option value="cerah">Cerah</option>
                <option value="berawan">Berawan</option>
                <option value="hujan">Hujan</option>
              </select>
            </Field>
            <Field label="Suhu (°C)">
              <input className="input" type="number" value={form.suhu} onChange={(e) => update('suhu', Number(e.target.value))} />
            </Field>
            <Field label="Kelembapan (%)">
              <input className="input" type="number" min="0" max="100" value={form.kelembapan} onChange={(e) => update('kelembapan', Number(e.target.value))} />
            </Field>
          </div>
        </div>
      </Card>

      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-indigo-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Menghitung prediksi…' : 'Prediksi Jam Berangkat →'}
      </button>

      <div ref={resultRef}>{result && <ResultCard result={result} />}</div>
    </form>
  )
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>{label}</span>
      {children}
    </label>
  )
}
