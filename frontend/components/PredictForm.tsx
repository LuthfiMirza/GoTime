'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { fetchPrediction, fetchWeather } from '@/lib/api'
import { buildStaticMapUrl, getRoute, reverseGeocode } from '@/lib/geo'
import type { RouteMode, RouteOptions, RouteResult, SelectedLocation } from '@/lib/geo'
import type { FormState, PredictRequest, PredictResponse, WeatherResponse } from '@/lib/types'
import LocationInput from './LocationInput'
import ResultCard from './ResultCard'
import RouteMap from './RouteMap'
import WeatherBadge from './WeatherBadge'

export interface DashboardSnapshot {
  origin: string
  destination: string
  eventTime: string
  vehicle: string
  distanceKm: number
  durationMinutes: number
  bufferMinutes: number
  recommendedDeparture: string
  risk: string
  weather: string | null
  temperature: number | null
  humidity: number | null
  routeMode: string
  mapUrl: string
}

interface PredictFormProps {
  onDashboardChange?: (snapshot: DashboardSnapshot) => void
}

const today = new Date().toISOString().slice(0, 10)

const defaultForm: FormState = {
  event_date: today,
  event_time: '08:00',
  asal: '',
  tujuan: '',
  jarak_km: 0,
  durasi_api_menit: 0,
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

const routeOptions: Array<{
  vehicle: string
  mode: RouteMode
  label: string
  icon: string
  description: string
  mapLabel: string
  avoidTolls?: boolean
  avoidHighways?: boolean
}> = [
  {
    vehicle: 'motor',
    mode: 'motorcycle',
    label: 'Motor',
    icon: '🏍',
    description: 'Rute motor, hindari tol',
    mapLabel: 'Motor — Hindari tol',
    avoidTolls: true,
    avoidHighways: true,
  },
  {
    vehicle: 'mobil',
    mode: 'drive',
    label: 'Mobil',
    icon: '🚗',
    description: 'Rute mobil tercepat',
    mapLabel: 'Mobil — Rute tercepat',
  },
  {
    vehicle: 'transportasi_umum',
    mode: 'approximated_transit',
    label: 'Umum',
    icon: '🚌',
    description: 'Estimasi kendaraan umum',
    mapLabel: 'Umum — Estimasi transit',
    avoidTolls: true,
  },
]

const quickLocations: SelectedLocation[] = [
  { name: 'Depok, West Java, Indonesia', lat: -6.40719, lon: 106.8158371 },
  { name: 'Universitas Indonesia, Depok, West Java, Indonesia', lat: -6.3624, lon: 106.8246 },
  { name: 'Stasiun Depok Baru, Depok, West Java, Indonesia', lat: -6.3917, lon: 106.8228 },
]

function getRouteOptions(vehicle: string): RouteOptions {
  const selectedRoute = routeOptions.find((option) => option.vehicle === vehicle) || routeOptions[1]
  return {
    mode: selectedRoute.mode,
    avoidTolls: selectedRoute.avoidTolls,
    avoidHighways: selectedRoute.avoidHighways,
  }
}

function getRouteLabel(vehicle: string): string {
  return routeOptions.find((option) => option.vehicle === vehicle)?.mapLabel || routeOptions[1].mapLabel
}

export default function PredictForm({ onDashboardChange }: PredictFormProps) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherAutoFetchedKey, setWeatherAutoFetchedKey] = useState('')
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [asalLoc, setAsalLoc] = useState<SelectedLocation | null>(null)
  const [tujuanLoc, setTujuanLoc] = useState<SelectedLocation | null>(null)
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [mapUrl, setMapUrl] = useState<string>('')
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [routePreference, setRoutePreference] = useState(defaultForm.jenis_kendaraan)
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const routeMapRef = useRef<HTMLDivElement>(null)

  const detailDone = Boolean(form.event_date && form.event_time)
  const routeDone = Boolean(routeResult || (Number(form.jarak_km) > 0 && Number(form.durasi_api_menit) > 0))
  const conditionDone = Boolean(form.cuaca && Number(form.suhu) > 0 && Number(form.kelembapan) >= 0)
  const canPredict = detailDone && routeDone && conditionDone

  useEffect(() => {
    onDashboardChange?.({
      origin: form.asal,
      destination: form.tujuan,
      eventTime: form.event_time,
      vehicle: form.jenis_kendaraan,
      distanceKm: Number(form.jarak_km) || 0,
      durationMinutes: result?.prediksi_durasi_menit || Number(form.durasi_api_menit) || 0,
      bufferMinutes: form.buffer_menit,
      recommendedDeparture: result?.jam_berangkat || '',
      risk: result?.risiko || '',
      weather: weather?.cuaca || null,
      temperature: weather?.suhu ?? null,
      humidity: weather?.kelembapan ?? null,
      routeMode: getRouteLabel(routePreference),
      mapUrl,
    })
  }, [form, weather, result, routePreference, mapUrl, onDashboardChange])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function loadWeather(options?: { silent?: boolean }) {
    if (!form.event_date || !form.event_time || (!form.asal && !asalLoc)) return

    setWeatherLoading(true)
    if (!options?.silent) setError(null)
    try {
      const data = await fetchWeather(
        form.asal || asalLoc?.name || 'Lokasi asal',
        form.event_date,
        form.event_time,
        asalLoc ? { lat: asalLoc.lat, lon: asalLoc.lon } : undefined,
      )
      setWeather(data)
      if (data.cuaca) update('cuaca', data.cuaca)
      if (data.suhu !== null) update('suhu', data.suhu)
      if (data.kelembapan !== null) update('kelembapan', data.kelembapan)
    } catch (err) {
      if (!options?.silent) {
        setError(err instanceof Error ? err.message : 'Gagal mengambil cuaca otomatis.')
      }
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    if (!asalLoc || !tujuanLoc) {
      setRouteResult(null)
      setMapUrl('')
      setRouteError(null)
      return
    }

    let cancelled = false

    const fetchRoute = async () => {
      setRouteLoading(true)
      setRouteError(null)
      const route = await getRoute(asalLoc, tujuanLoc, getRouteOptions(routePreference))
      if (cancelled) return

      if (route) {
        setRouteResult(route)
        setMapUrl(buildStaticMapUrl(asalLoc, tujuanLoc, route.polyline))
        setForm((prev) => ({
          ...prev,
          asal: asalLoc.name,
          tujuan: tujuanLoc.name,
          jarak_km: route.jarak_km,
          durasi_api_menit: route.durasi_api_menit,
        }))
        setTimeout(() => routeMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
      } else {
        setRouteResult(null)
        setMapUrl('')
        setRouteError('Rute otomatis gagal dihitung. Kamu tetap bisa isi jarak dan durasi manual.')
      }
      setRouteLoading(false)
    }

    fetchRoute()

    return () => {
      cancelled = true
    }
  }, [asalLoc, tujuanLoc, routePreference])

  useEffect(() => {
    if (!asalLoc || !form.event_date || !form.event_time || weatherLoading) return

    const autoKey = `${asalLoc.lat},${asalLoc.lon},${form.event_date},${form.event_time}`
    if (weatherAutoFetchedKey === autoKey) return

    setWeatherAutoFetchedKey(autoKey)
    loadWeather({ silent: true })
  }, [asalLoc, form.event_date, form.event_time, weatherAutoFetchedKey, weatherLoading])

  async function handleUseCurrentLocation() {
    setError(null)

    if (!navigator.geolocation) {
      setError('Browser tidak mendukung deteksi lokasi. Isi lokasi asal secara manual.')
      return
    }

    setCurrentLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const location = await reverseGeocode(latitude, longitude)
        const selectedLocation = location || {
          name: `Lokasi saya (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
          lat: latitude,
          lon: longitude,
        }

        setAsalLoc(selectedLocation)
        update('asal', selectedLocation.name)
        setCurrentLocationLoading(false)
      },
      () => {
        setError('Izin lokasi ditolak atau lokasi tidak tersedia. Pilih lokasi asal dari autocomplete.')
        setCurrentLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  function handleSwapLocations() {
    if (!asalLoc && !tujuanLoc) return

    const previousAsal = asalLoc
    const previousTujuan = tujuanLoc
    setAsalLoc(previousTujuan)
    setTujuanLoc(previousAsal)
    setForm((prev) => ({
      ...prev,
      asal: previousTujuan?.name || '',
      tujuan: previousAsal?.name || '',
    }))
    setRouteResult(null)
    setMapUrl('')
    setRouteError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (Number(form.jarak_km) <= 0 || Number(form.durasi_api_menit) <= 0) {
      setError('Lengkapi rute terlebih dahulu atau isi jarak dan estimasi menit manual sebelum prediksi.')
      return
    }

    setLoading(true)
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <ProgressSteps detailDone={detailDone} routeDone={routeDone} conditionDone={conditionDone} resultDone={Boolean(result)} />
      {error && <div className="rounded-2xl border border-orange-500 bg-orange-50 p-4 text-sm text-orange-700">{error}</div>}

      <Card title="Detail Acara" description="Tentukan kapan kamu perlu tiba.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal acara">
            <input className="input" type="date" min={today} value={form.event_date} onChange={(event) => update('event_date', event.target.value)} />
          </Field>
          <Field label="Jam acara">
            <input className="input" type="time" value={form.event_time} onChange={(event) => update('event_time', event.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Rute" description="Pilih lokasi untuk menghitung jarak dan estimasi otomatis.">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-100 dark:bg-gray-50 dark:text-gray-700">
            <p className="font-semibold">Tips biar cepat</p>
            <p className="mt-1 text-xs opacity-80">Ketik minimal 3 huruf, lalu pilih rekomendasi. Jarak dan durasi baru otomatis terisi setelah dua lokasi terpilih.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickLocations.map((location) => (
                <button
                  key={location.name}
                  type="button"
                  onClick={() => {
                    if (!asalLoc) {
                      setAsalLoc(location)
                      update('asal', location.name)
                    } else {
                      setTujuanLoc(location)
                      update('tujuan', location.name)
                    }
                  }}
                  className="rounded-full bg-white px-4 py-1.5.5 text-xs font-semibold text-white ring-1 ring-gray-100 transition hover:bg-indigo-600 dark:bg-gray-50 dark:text-gray-700 dark:ring-gray-100"
                >
                  {location.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
            <LocationInput
              label="Lokasi asal"
              placeholder="contoh: Depok, Jawa Barat"
              value={asalLoc}
              onChange={(location) => {
                setAsalLoc(location)
                update('asal', location?.name || '')
              }}
              onUseCurrentLocation={handleUseCurrentLocation}
              currentLocationLoading={currentLocationLoading}
            />
            <button
              type="button"
              onClick={handleSwapLocations}
              disabled={!asalLoc && !tujuanLoc}
              className="mt-8 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-100 dark:bg-white dark:text-gray-700"
            >
              ↕ Tukar
            </button>
            <LocationInput
              label="Lokasi tujuan"
              placeholder="contoh: Universitas Indonesia, Depok"
              value={tujuanLoc}
              onChange={(location) => {
                setTujuanLoc(location)
                update('tujuan', location?.name || '')
              }}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {routeOptions.map((option) => (
              <button
                key={option.vehicle}
                type="button"
                onClick={() => {
                  setRoutePreference(option.vehicle)
                  update('jenis_kendaraan', option.vehicle)
                }}
                className={`rounded-2xl border p-4 text-left transition ${routePreference === option.vehicle ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'border-gray-100 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-100 dark:bg-white dark:text-gray-700'}`}
              >
                <span className="block text-sm font-bold">{option.icon} {option.label}</span>
                <span className={`mt-1 block text-xs ${routePreference === option.vehicle ? 'text-gray-700' : 'text-gray-500'}`}>{option.description}</span>
              </button>
            ))}
          </div>

          {routeLoading && (
            <div className="flex h-48 animate-pulse items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <span className="text-sm text-gray-400">Menghitung rute...</span>
            </div>
          )}

          {routeError && !routeLoading && (
            <div className="rounded-2xl border border-orange-500 bg-orange-50 p-4 text-sm text-orange-700   ">
              {routeError}
            </div>
          )}

          <div ref={routeMapRef}>
            {!routeLoading && routeResult && mapUrl && asalLoc && tujuanLoc && (
              <RouteMap from={asalLoc} to={tujuanLoc} routeResult={routeResult} mapUrl={mapUrl} routeLabel={getRouteLabel(routePreference)} />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jarak (km)">
              <input className="input" type="number" min="0" step="0.1" readOnly={Boolean(routeResult)} value={form.jarak_km || ''} onChange={(event) => update('jarak_km', Number(event.target.value))} placeholder="contoh: 8.2" />
              <span className="text-xs font-normal text-gray-500">{routeResult ? 'Terisi otomatis' : 'Isi manual'}</span>
            </Field>
            <Field label="Estimasi Maps (menit)">
              <input className="input" type="number" min="0" readOnly={Boolean(routeResult)} value={form.durasi_api_menit || ''} onChange={(event) => update('durasi_api_menit', Number(event.target.value))} placeholder="contoh: 35" />
              <span className="text-xs font-normal text-gray-500">{routeResult ? 'Terisi otomatis' : 'Isi manual'}</span>
            </Field>
          </div>
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
                  onClick={() => {
                    update('jenis_kendaraan', option.value)
                    setRoutePreference(option.value)
                  }}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${form.jenis_kendaraan === option.value ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'border-gray-100 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-100 dark:bg-white dark:text-gray-700'}`}
                >
                  <span className="mr-1">{option.icon}</span> {option.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Buffer keamanan: ${form.buffer_menit} menit`}>
            <input className="w-full accent-indigo-600" type="range" min="0" max="60" step="5" value={form.buffer_menit} onChange={(event) => update('buffer_menit', Number(event.target.value))} />
          </Field>

          {form.asal && form.event_date && (
            <div className="space-y-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Cuaca otomatis</p>
                  <p className="text-sm text-gray-500">{weather?.source === 'api' ? 'Cuaca sudah terisi otomatis dari lokasi asal.' : 'Ambil prakiraan dari lokasi asal.'}</p>
                </div>
                <button type="button" onClick={() => loadWeather()} disabled={weatherLoading} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950">
                  {weatherLoading ? 'Mengambil…' : weather ? 'Refresh Cuaca' : 'Ambil Cuaca Otomatis'}
                </button>
              </div>
              {weather && <WeatherBadge weather={weather} />}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Cuaca">
              <select className="input" value={form.cuaca} onChange={(event) => update('cuaca', event.target.value)}>
                <option value="cerah">Cerah</option>
                <option value="berawan">Berawan</option>
                <option value="hujan">Hujan</option>
              </select>
            </Field>
            <Field label="Suhu (°C)">
              <input className="input" type="number" value={form.suhu} onChange={(event) => update('suhu', Number(event.target.value))} />
            </Field>
            <Field label="Kelembapan (%)">
              <input className="input" type="number" min="0" max="100" value={form.kelembapan} onChange={(event) => update('kelembapan', Number(event.target.value))} />
            </Field>
          </div>
        </div>
      </Card>

      <button type="submit" disabled={loading || !canPredict} className="w-full rounded-2xl bg-indigo-600 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Menghitung prediksi…' : 'Prediksi Jam Berangkat →'}
      </button>

      <div ref={resultRef}>{result && <ResultCard result={result} />}</div>
    </form>
  )
}

function ProgressSteps({ detailDone, routeDone, conditionDone, resultDone }: { detailDone: boolean; routeDone: boolean; conditionDone: boolean; resultDone: boolean }) {
  const steps = [
    { label: 'Detail acara', done: detailDone },
    { label: 'Rute', done: routeDone },
    { label: 'Kondisi', done: conditionDone },
    { label: 'Prediksi', done: resultDone },
  ]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className={`rounded-2xl px-4 py-2 text-xs font-semibold ${step.done ? 'bg-gray-50 text-gray-700 ring-1 ring-green-100' : 'bg-gray-50 text-gray-500 ring-1 ring-zinc-100 dark:bg-white dark:ring-zinc-800'}`}>
            {index + 1}. {step.label} {step.done ? '✓' : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="px-5 py-6">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <hr className="border-gray-100" />
      <div className="px-5 py-6">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  )
}
