'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { SelectedLocation } from '@/lib/geo'

interface InteractiveMapProps {
  from: SelectedLocation
  to: SelectedLocation
  polyline: [number, number][]
  className?: string
}

const geoKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || ''

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function FitBounds({ from, to, polyline }: InteractiveMapProps) {
  const map = useMap()

  useEffect(() => {
    const points = polyline.length > 0 ? polyline : [[from.lat, from.lon], [to.lat, to.lon]]
    const bounds = L.latLngBounds(points.map(([lat, lon]) => [lat, lon]))
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 16 })
  }, [from, map, polyline, to])

  return null
}

export default function InteractiveMap({ from, to, polyline, className = 'h-full min-h-[320px] w-full' }: InteractiveMapProps) {
  const center: [number, number] = [from.lat, from.lon]
  const tileUrl = geoKey
    ? `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${geoKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className={className} zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
        url={tileUrl}
      />
      <Polyline positions={polyline} pathOptions={{ color: '#4f46e5', weight: 5, opacity: 0.9 }} />
      <Marker position={[from.lat, from.lon]} icon={markerIcon} />
      <Marker position={[to.lat, to.lon]} icon={markerIcon} />
      <FitBounds from={from} to={to} polyline={polyline} />
    </MapContainer>
  )
}
