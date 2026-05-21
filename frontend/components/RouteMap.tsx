import type { RouteResult, SelectedLocation } from '@/lib/geo'

interface RouteMapProps {
  from: SelectedLocation
  to: SelectedLocation
  routeResult: RouteResult
  mapUrl: string
  routeLabel: string
}

export default function RouteMap({ from, to, routeResult, mapUrl, routeLabel }: RouteMapProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-100 dark:bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-700">Peta rute perjalanan</p>
        <span className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white dark:bg-gray-50 dark:text-gray-700">
          Mode: {routeLabel}
        </span>
      </div>

      {mapUrl ? (
        <img src={mapUrl} className="w-full rounded-lg border border-gray-100 dark:border-gray-100" loading="lazy" alt="Peta rute perjalanan" />
      ) : (
        <div className="flex h-48 animate-pulse items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <span className="text-sm text-gray-400">Memuat peta...</span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p className="flex gap-2 text-gray-700 dark:text-gray-700"><span>📍</span><span>{from.name}</span></p>
        <p className="pl-1 text-gray-400">↓</p>
        <p className="flex gap-2 text-gray-700 dark:text-gray-700"><span>📍</span><span>{to.name}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-100 dark:bg-white">
          <p className="text-sm text-gray-500">Jarak</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.jarak_km} km</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-100 dark:bg-white">
          <p className="text-sm text-gray-500">Est. waktu</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.durasi_api_menit} menit</p>
        </div>
      </div>
    </section>
  )
}
