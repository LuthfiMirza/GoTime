import type { WeatherResponse } from '@/lib/types'

function iconFor(weather: string | null) {
  if (weather === 'cerah') return '☀️'
  if (weather === 'hujan') return '🌧️'
  return '☁️'
}

export default function WeatherBadge({ weather }: { weather: WeatherResponse }) {
  const isApi = weather.source === 'api'
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
      <span className="text-lg">{iconFor(weather.cuaca)}</span>
      <span className="font-medium capitalize">{weather.cuaca ?? 'Cuaca manual'}</span>
      {weather.suhu !== null && <span>{weather.suhu}°C</span>}
      {weather.kelembapan !== null && <span>{weather.kelembapan}% RH</span>}
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isApi ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-700'}`}>
        {isApi ? 'Otomatis' : 'Isi Manual'}
      </span>
      <span className="basis-full text-xs text-zinc-500">{weather.deskripsi}</span>
    </div>
  )
}
