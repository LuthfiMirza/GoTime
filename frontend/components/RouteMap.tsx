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
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Peta rute perjalanan</p>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-100">
          Mode: {routeLabel}
        </span>
      </div>

      {mapUrl ? (
        <img src={mapUrl} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800" loading="lazy" alt="Peta rute perjalanan" />
      ) : (
        <div className="flex h-48 animate-pulse items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <span className="text-sm text-zinc-400">Memuat peta...</span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p className="flex gap-2 text-zinc-700 dark:text-zinc-200"><span>📍</span><span>{from.name}</span></p>
        <p className="pl-1 text-zinc-400">↓</p>
        <p className="flex gap-2 text-zinc-700 dark:text-zinc-200"><span>📍</span><span>{to.name}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Jarak</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.jarak_km} km</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Est. waktu</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.durasi_api_menit} menit</p>
        </div>
      </div>
    </section>
  )
}
