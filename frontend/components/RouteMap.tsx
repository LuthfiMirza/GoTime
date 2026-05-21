'use client'

import dynamic from 'next/dynamic'
import type { RouteResult, SelectedLocation } from '@/lib/geo'

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl bg-gray-50 text-sm font-semibold text-gray-400">
      Memuat peta interaktif...
    </div>
  ),
})

interface RouteMapProps {
  from: SelectedLocation
  to: SelectedLocation
  routeResult: RouteResult
  mapUrl: string
  routeLabel: string
}

export default function RouteMap({ from, to, routeResult, routeLabel }: RouteMapProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">Peta rute perjalanan</p>
        <span className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
          Mode: {routeLabel}
        </span>
      </div>

      <div className="min-h-[320px] overflow-hidden rounded-2xl border border-gray-100">
        <InteractiveMap from={from} to={to} polyline={routeResult.polyline} />
      </div>

      <div className="space-y-2 text-sm">
        <p className="flex gap-2 text-gray-700"><span>📍</span><span>{from.name}</span></p>
        <p className="pl-1 text-gray-400">↓</p>
        <p className="flex gap-2 text-gray-700"><span>📍</span><span>{to.name}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">Jarak</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.jarak_km} km</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">Est. waktu</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-600">{routeResult.durasi_api_menit} menit</p>
        </div>
      </div>
    </section>
  )
}
