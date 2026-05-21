const GEO_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY!

export interface SelectedLocation {
  name: string
  lat: number
  lon: number
}

export interface RouteResult {
  jarak_km: number
  durasi_api_menit: number
  polyline: [number, number][]
}

export async function getRoute(from: SelectedLocation, to: SelectedLocation): Promise<RouteResult | null> {
  if (!GEO_KEY || GEO_KEY === 'your_geoapify_api_key_here') {
    return null
  }

  const url = new URL('https://api.geoapify.com/v1/routing')
  url.searchParams.set('waypoints', `${from.lat},${from.lon}|${to.lat},${to.lon}`)
  url.searchParams.set('mode', 'drive')
  url.searchParams.set('apiKey', GEO_KEY)

  try {
    const response = await fetch(url.toString())
    if (!response.ok) return null

    const data = await response.json()
    const feature = data?.features?.[0]
    const distance = feature?.properties?.distance
    const time = feature?.properties?.time
    const coordinates = feature?.geometry?.coordinates?.[0]

    if (typeof distance !== 'number' || typeof time !== 'number' || !Array.isArray(coordinates)) {
      return null
    }

    return {
      jarak_km: Math.round((distance / 1000) * 10) / 10,
      durasi_api_menit: Math.round(time / 60),
      polyline: coordinates
        .filter((coordinate: unknown) => Array.isArray(coordinate) && coordinate.length >= 2)
        .map(([lon, lat]: [number, number]) => [lat, lon]),
    }
  } catch {
    return null
  }
}

export function buildStaticMapUrl(
  from: SelectedLocation,
  to: SelectedLocation,
  polyline: [number, number][],
): string {
  const url = new URL('https://maps.geoapify.com/v1/staticmap')
  const marker = `lonlat:${from.lon},${from.lat};type:material;color:red;size:large|lonlat:${to.lon},${to.lat};type:material;color:green;size:large`
  const simplifiedPolyline = simplifyPolyline(polyline)
  const route = simplifiedPolyline.map(([lat, lon]) => `${lon},${lat}`).join(',')

  url.searchParams.set('style', 'osm-carto')
  url.searchParams.set('width', '600')
  url.searchParams.set('height', '300')
  url.searchParams.set('marker', marker)
  url.searchParams.set('geometry', `polyline:${route};linewidth:3;linecolor:#0066ff`)
  url.searchParams.set('apiKey', GEO_KEY)

  return url.toString()
}


function simplifyPolyline(polyline: [number, number][]): [number, number][] {
  if (polyline.length <= 80) return polyline

  const step = Math.ceil(polyline.length / 80)
  const simplified = polyline.filter((_, index) => index % step === 0)
  const last = polyline[polyline.length - 1]
  const simplifiedLast = simplified[simplified.length - 1]

  if (last && simplifiedLast && (last[0] !== simplifiedLast[0] || last[1] !== simplifiedLast[1])) {
    simplified.push(last)
  }

  return simplified
}
