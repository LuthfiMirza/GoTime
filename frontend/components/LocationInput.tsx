'use client'

import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete'
import type { SelectedLocation } from '@/lib/geo'

interface LocationInputProps {
  label: string
  placeholder: string
  value: SelectedLocation | null
  onChange: (location: SelectedLocation | null) => void
}

interface GeoapifyFeature {
  properties?: {
    formatted?: string
    name?: string
    lat?: number
    lon?: number
  }
}

const geoKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || ''

export default function LocationInput({ label, placeholder, value, onChange }: LocationInputProps) {
  function handlePlaceSelect(feature: GeoapifyFeature | null) {
    const properties = feature?.properties
    if (!properties || typeof properties.lat !== 'number' || typeof properties.lon !== 'number') {
      onChange(null)
      return
    }

    onChange({
      name: properties.formatted || properties.name || placeholder,
      lat: properties.lat,
      lon: properties.lon,
    })
  }

  function handleUserInput(text: string) {
    if (!text.trim()) {
      onChange(null)
    }
  }

  return (
    <label className="block space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span className="flex items-center gap-2">
        {label}
        {value && <span className="text-xs text-green-600">✅ Terpilih</span>}
      </span>
      <GeoapifyContext apiKey={geoKey}>
        <div className="geoapify-input-wrap">
          <GeoapifyGeocoderAutocomplete
            placeholder={placeholder}
            value={value?.name || ''}
            placeSelect={handlePlaceSelect}
            suggestionsChange={() => undefined}
            onUserInput={handleUserInput}
            filterByCountryCode={['id']}
            debounceDelay={300}
          />
        </div>
      </GeoapifyContext>
    </label>
  )
}
