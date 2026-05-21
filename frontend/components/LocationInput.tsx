'use client'

import { useState } from 'react'
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
  const [isSearching, setIsSearching] = useState(false)
  const [hasSuggestions, setHasSuggestions] = useState(false)

  function handlePlaceSelect(feature: GeoapifyFeature | null) {
    setIsSearching(false)
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
    const trimmedText = text.trim()
    setHasSuggestions(false)
    setIsSearching(trimmedText.length >= 3)

    if (!trimmedText) {
      setIsSearching(false)
      onChange(null)
    }
  }

  function handleSuggestionsChange(suggestions: unknown[]) {
    setHasSuggestions(suggestions.length > 0)
    setIsSearching(false)
  }

  const helperText = value
    ? value.name
    : isSearching
      ? 'Mencari lokasi...'
      : hasSuggestions
        ? 'Pilih salah satu rekomendasi agar koordinat terkunci.'
        : 'Ketik minimal 3 huruf, lalu pilih dari dropdown.'

  return (
    <label className="block space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span className="flex items-center gap-2">
        {label}
        {value && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">✅ Terpilih</span>}
      </span>
      <GeoapifyContext apiKey={geoKey}>
        <div className="geoapify-input-wrap">
          <GeoapifyGeocoderAutocomplete
            placeholder={placeholder}
            value={value?.name || ''}
            placeSelect={handlePlaceSelect}
            suggestionsChange={handleSuggestionsChange}
            onUserInput={handleUserInput}
            filterByCountryCode={['id']}
            biasByCountryCode={['id']}
            limit={5}
            debounceDelay={180}
          />
        </div>
      </GeoapifyContext>
      <span className={`block text-xs font-normal ${value ? 'text-green-600' : 'text-zinc-500'}`}>{helperText}</span>
    </label>
  )
}
