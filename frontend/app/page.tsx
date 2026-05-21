'use client'

import { useState } from 'react'
import { Bell, CalendarClock, Clock3, Compass, History, Home, Map, Settings, Sparkles, Umbrella, UserRound } from 'lucide-react'
import PredictForm, { DashboardSnapshot } from '@/components/PredictForm'

const historyItems = [
  { route: 'Belum ada histori', time: '-', duration: 'Mulai prediksi pertama', color: 'bg-blue-50 text-blue-700' },
]

const initialSnapshot: DashboardSnapshot = {
  origin: '',
  destination: '',
  eventTime: '08:00',
  vehicle: 'motor',
  distanceKm: 0,
  durationMinutes: 0,
  bufferMinutes: 10,
  recommendedDeparture: '',
  risk: '',
  weather: null,
  temperature: null,
  humidity: null,
  routeMode: 'Motor — Hindari tol',
  mapUrl: '',
}

export default function HomePage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(initialSnapshot)

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col bg-[#fffaf4]">
          <Header />

          <div className="grid flex-1 gap-5 overflow-y-auto p-5 xl:grid-cols-[1.08fr_0.82fr] 2xl:grid-cols-[1.05fr_0.72fr_0.95fr]">
            <div className="space-y-5">
              <HeroCard snapshot={snapshot} />
              <PredictForm onDashboardChange={setSnapshot} />
            </div>

            <aside className="space-y-5">
              <PredictionPreview snapshot={snapshot} />
              <WeatherTrafficCard snapshot={snapshot} />
              <TravelHistory snapshot={snapshot} />
            </aside>

            <aside className="hidden space-y-5 2xl:block">
              <MapPanel snapshot={snapshot} />
              <TripReadiness snapshot={snapshot} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}

function Sidebar() {
  const icons = [Home, Map, Compass, History, Settings]
  return (
    <aside className="hidden w-[76px] flex-col items-center gap-4 border-r border-orange-100 bg-white py-6 md:flex">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
        <Sparkles size={20} />
      </div>
      {icons.map((Icon, index) => (
        <button
          key={index}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${index === 0 ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400 hover:bg-zinc-50 hover:text-indigo-600'}`}
          type="button"
        >
          <Icon size={20} />
        </button>
      ))}
    </aside>
  )
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-100 bg-white/90 px-5 py-5 backdrop-blur">
      <div>
        <p className="text-sm font-semibold text-indigo-600">GoTime Dashboard</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Smart Departure & Travel Planner</h1>
        <p className="mt-1 text-sm text-zinc-500">Prediksi waktu berangkat berbasis rute, cuaca, dan machine learning.</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500 ring-1 ring-zinc-100">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <UserRound size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold">Traveler</p>
            <p className="text-xs text-zinc-500">Daily planner</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function HeroCard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const departure = snapshot.recommendedDeparture || '--:--'
  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 p-6 text-white shadow-xl shadow-indigo-200">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Travel Intelligence</p>
          <h2 className="font-display text-3xl font-bold leading-tight">{snapshot.origin && snapshot.destination ? 'Your next trip is ready.' : 'Plan your next trip.'}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">
            {snapshot.origin && snapshot.destination ? `${shortName(snapshot.origin)} menuju ${shortName(snapshot.destination)}` : 'Pilih asal dan tujuan untuk melihat estimasi rute, cuaca, dan jam berangkat.'}
          </p>
        </div>
        <div className="rounded-3xl bg-white/15 p-4 text-right backdrop-blur">
          <p className="text-xs text-indigo-100">Recommended leave</p>
          <p className="font-mono text-4xl font-black">{departure}</p>
          <p className="text-xs text-indigo-100">{snapshot.durationMinutes ? `${snapshot.durationMinutes} min + ${snapshot.bufferMinutes} min buffer` : 'menunggu prediksi'}</p>
        </div>
      </div>
    </section>
  )
}

function PredictionPreview({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Smart Departure</p>
          <h2 className="font-display text-xl font-bold">Leave-Time Prediction</h2>
        </div>
        <Clock3 className="text-indigo-500" size={22} />
      </div>
      <div className="rounded-3xl bg-indigo-50 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Recommended Departure</p>
        <p className="mt-1 font-mono text-5xl font-black text-indigo-700">{snapshot.recommendedDeparture || '--:--'}</p>
        <p className="mt-2 text-sm text-indigo-500">{snapshot.durationMinutes ? `${snapshot.durationMinutes} min travel + ${snapshot.bufferMinutes} min buffer` : 'Hasil muncul setelah prediksi'}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniMetric label="Risk" value={snapshot.risk || '-'} tone="bg-orange-50 text-orange-700" />
        <MiniMetric label="Vehicle" value={vehicleLabel(snapshot.vehicle)} tone="bg-green-50 text-green-700" />
      </div>
    </section>
  )
}

function WeatherTrafficCard({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Weather & Traffic</h2>
        <Umbrella className="text-blue-500" size={22} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Weather" value={snapshot.weather || '-'} tone="bg-blue-50 text-blue-700" />
        <MiniMetric label="Temp" value={snapshot.temperature !== null ? `${snapshot.temperature}°C` : '-'} tone="bg-purple-50 text-purple-700" />
        <MiniMetric label="Humidity" value={snapshot.humidity !== null ? `${snapshot.humidity}%` : '-'} tone="bg-green-50 text-green-700" />
        <MiniMetric label="Route" value={snapshot.routeMode} tone="bg-orange-50 text-orange-700" />
      </div>
    </section>
  )
}

function TravelHistory({ snapshot }: { snapshot: DashboardSnapshot }) {
  const activeTrip = snapshot.origin && snapshot.destination
    ? [{ route: `${shortName(snapshot.origin)} → ${shortName(snapshot.destination)}`, time: snapshot.eventTime, duration: snapshot.durationMinutes ? `${snapshot.durationMinutes} min` : 'estimasi belum ada', color: 'bg-indigo-50 text-indigo-700' }]
    : historyItems

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Trip Summary</h2>
        <CalendarClock className="text-purple-500" size={22} />
      </div>
      <div className="space-y-3">
        {activeTrip.map((item) => (
          <div key={item.route} className={`rounded-2xl p-3 ${item.color}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{item.route}</p>
              <p className="font-mono text-sm font-black">{item.duration}</p>
            </div>
            <p className="mt-1 text-xs opacity-70">Event {item.time}</p>
          </div>
        ))}
        <MiniMetric label="Distance" value={snapshot.distanceKm ? `${snapshot.distanceKm} km` : '-'} tone="bg-zinc-50 text-zinc-700" />
      </div>
    </section>
  )
}

function MapPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#eaf3ef] p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Live Route</p>
          <h2 className="font-display text-2xl font-bold">Map Preview</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">Leave at {snapshot.recommendedDeparture || '--:--'}</span>
      </div>
      {snapshot.mapUrl ? (
        <img src={snapshot.mapUrl} alt="Peta rute perjalanan" className="relative z-10 mt-6 h-[390px] w-full rounded-3xl object-cover shadow-inner" />
      ) : (
        <div className="relative z-10 mt-6 flex h-[390px] items-center justify-center rounded-3xl bg-white/60 text-center text-sm font-semibold text-zinc-500">
          Pilih asal dan tujuan untuk menampilkan peta asli.
        </div>
      )}
      <div className="absolute bottom-6 left-6 z-20 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold text-zinc-500">ETA</p>
        <p className="font-mono text-3xl font-black text-indigo-600">{snapshot.durationMinutes || '-'} min</p>
      </div>
    </section>
  )
}

function TripReadiness({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <h2 className="font-display text-xl font-bold">Trip Readiness</h2>
      <div className="mt-4 space-y-3">
        <Readiness label="Route Forecast" value={snapshot.distanceKm ? 'Ready' : 'Waiting'} />
        <Readiness label="Weather Check" value={snapshot.weather ? 'Synced' : 'Waiting'} />
        <Readiness label="Late Risk Score" value={snapshot.risk || 'Waiting'} />
      </div>
    </section>
  )
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <p className="text-xs font-semibold opacity-70">{label}</p>
      <p className="mt-1 font-bold capitalize">{value}</p>
    </div>
  )
}

function Readiness({ label, value }: { label: string; value: string }) {
  const ready = !['Waiting', '-', ''].includes(value)
  return (
    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3">
      <span className="text-sm font-semibold text-zinc-600">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${ready ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{value}</span>
    </div>
  )
}

function shortName(name: string): string {
  return name.split(',')[0] || name
}

function vehicleLabel(vehicle: string): string {
  if (vehicle === 'transportasi_umum') return 'Umum'
  return vehicle || '-'
}
