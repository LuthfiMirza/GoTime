import { Bell, CalendarClock, Clock3, Compass, History, Home, Map, Settings, Sparkles, Umbrella, UserRound } from 'lucide-react'
import PredictForm from '@/components/PredictForm'

const history = [
  { route: 'Rumah → Kampus', time: '07:10', duration: '47 min', color: 'bg-blue-50 text-blue-700' },
  { route: 'Kampus → Rumah', time: '17:20', duration: '52 min', color: 'bg-purple-50 text-purple-700' },
  { route: 'Rumah → Stasiun', time: '06:45', duration: '35 min', color: 'bg-green-50 text-green-700' },
  { route: 'Stasiun → Kampus', time: '07:25', duration: '28 min', color: 'bg-orange-50 text-orange-700' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7d7aa] p-4 text-zinc-950 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1440px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-orange-900/10">
        <Sidebar />

        <section className="flex min-w-0 flex-1 flex-col bg-[#fffaf4]">
          <Header />

          <div className="grid flex-1 gap-5 overflow-y-auto p-5 xl:grid-cols-[1.05fr_0.8fr] 2xl:grid-cols-[1.05fr_0.72fr_0.95fr]">
            <div className="space-y-5">
              <HeroCard />
              <PredictForm />
            </div>

            <aside className="space-y-5">
              <PredictionPreview />
              <WeatherTrafficCard />
              <TravelHistory />
            </aside>

            <aside className="hidden space-y-5 2xl:block">
              <MapMockup />
              <TripReadiness />
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
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-100 bg-white/80 px-5 py-5 backdrop-blur">
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
            <p className="text-sm font-bold">Luthfi</p>
            <p className="text-xs text-zinc-500">Daily traveler</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function HeroCard() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 p-6 text-white shadow-xl shadow-indigo-200">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Travel Intelligence</p>
          <h2 className="font-display text-3xl font-bold leading-tight">Your next trip is ready.</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">Isi detail perjalanan, pilih rute terbaik, lalu GoTime menghitung jam berangkat paling aman.</p>
        </div>
        <div className="rounded-3xl bg-white/15 p-4 text-right backdrop-blur">
          <p className="text-xs text-indigo-100">Recommended leave</p>
          <p className="font-mono text-4xl font-black">07:08</p>
          <p className="text-xs text-indigo-100">dummy preview</p>
        </div>
      </div>
    </section>
  )
}

function PredictionPreview() {
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
        <p className="mt-1 font-mono text-5xl font-black text-indigo-700">07:08</p>
        <p className="mt-2 text-sm text-indigo-500">42 min travel + 10 min buffer</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniMetric label="Risk" value="Medium" tone="bg-orange-50 text-orange-700" />
        <MiniMetric label="Vehicle" value="Motor" tone="bg-green-50 text-green-700" />
      </div>
    </section>
  )
}

function WeatherTrafficCard() {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Weather & Traffic</h2>
        <Umbrella className="text-blue-500" size={22} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Weather" value="Rainy" tone="bg-blue-50 text-blue-700" />
        <MiniMetric label="Temp" value="27°C" tone="bg-purple-50 text-purple-700" />
        <MiniMetric label="Humidity" value="85%" tone="bg-green-50 text-green-700" />
        <MiniMetric label="Traffic" value="Heavy" tone="bg-orange-50 text-orange-700" />
      </div>
    </section>
  )
}

function TravelHistory() {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Travel History</h2>
        <CalendarClock className="text-purple-500" size={22} />
      </div>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.route} className={`rounded-2xl p-3 ${item.color}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{item.route}</p>
              <p className="font-mono text-sm font-black">{item.duration}</p>
            </div>
            <p className="mt-1 text-xs opacity-70">Start {item.time}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MapMockup() {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#eaf3ef] p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-10 top-16 h-28 w-72 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute bottom-20 right-8 h-36 w-64 rounded-full bg-green-200/70 blur-3xl" />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Live Route</p>
          <h2 className="font-display text-2xl font-bold">Map Preview</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">Leave at 07:08</span>
      </div>
      <svg className="relative z-10 mt-10 h-[360px] w-full" viewBox="0 0 420 360" fill="none">
        <path d="M30 80 C110 120 120 240 210 210 C300 180 285 75 390 110" stroke="#d9c7a6" strokeWidth="18" strokeLinecap="round" />
        <path d="M30 80 C110 120 120 240 210 210 C300 180 285 75 390 110" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 10" />
        <circle cx="30" cy="80" r="14" fill="#ef4444" />
        <circle cx="390" cy="110" r="14" fill="#22c55e" />
      </svg>
      <div className="absolute bottom-6 left-6 z-20 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold text-zinc-500">ETA</p>
        <p className="font-mono text-3xl font-black text-indigo-600">42 min</p>
      </div>
    </section>
  )
}

function TripReadiness() {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/60">
      <h2 className="font-display text-xl font-bold">Trip Readiness</h2>
      <div className="mt-4 space-y-3">
        <Readiness label="Route Forecast" value="Ready" />
        <Readiness label="Weather Check" value="Synced" />
        <Readiness label="Late Risk Score" value="Medium" />
      </div>
    </section>
  )
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <p className="text-xs font-semibold opacity-70">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  )
}

function Readiness({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3">
      <span className="text-sm font-semibold text-zinc-600">{label}</span>
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{value}</span>
    </div>
  )
}
