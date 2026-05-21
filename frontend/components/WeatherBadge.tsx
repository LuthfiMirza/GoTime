import type { WeatherResponse } from '@/lib/types'

function iconFor(weather: string | null) {
  if (weather === 'cerah') return '☀️'
  if (weather === 'hujan') return '🌧️'
  return '☁️'
}

export default function WeatherBadge({ weather }: { weather: WeatherResponse }) {
  const isApi = weather.source === 'api'
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm dark:border-gray-100 dark:bg-white">
      <span className="text-lg">{iconFor(weather.cuaca)}</span>
      <span className="font-medium capitalize">{weather.cuaca ?? 'Cuaca manual'}</span>
      {weather.suhu !== null && <span>{weather.suhu}°C</span>}
      {weather.kelembapan !== null && <span>{weather.kelembapan}% RH</span>}
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isApi ? 'bg-green-600 text-white' : 'bg-zinc-200 text-gray-700'}`}>
        {isApi ? 'Otomatis' : 'Isi Manual'}
      </span>
      <span className="basis-full text-xs text-gray-500">{weather.deskripsi}</span>
    </div>
  )
}
