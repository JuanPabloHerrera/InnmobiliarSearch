'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Place } from '@/types/place'
import { PlaceInfoModal } from './PlaceInfoModal'

interface MapContainerProps {
  refreshTrigger?: number
}

export function MapContainer({ refreshTrigger }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Cargar Google Maps API
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const loadGoogleMaps = () => {
      // Verificar si ya está cargado
      if (typeof window.google !== 'undefined') {
        console.log('Google Maps API already loaded')
        setIsLoaded(true)
        return
      }

      // Verificar si ya existe un script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...')
        existingScript.addEventListener('load', () => setIsLoaded(true))
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        const errorMsg = 'Google Maps API key not configured. Please add your API key to .env.local'
        console.error(errorMsg)
        setLoadError(errorMsg)
        return
      }

      console.log('Loading Google Maps API...')
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully')
        clearTimeout(timeoutId)
        setIsLoaded(true)
      }
      
      script.onerror = (error) => {
        const errorMsg = 'Error loading Google Maps. Please check:\n1. Your API key is valid\n2. Maps JavaScript API is enabled\n3. You have sufficient quota'
        console.error('Error loading Google Maps API:', error)
        console.error('API Key being used:', apiKey)
        clearTimeout(timeoutId)
        setLoadError(errorMsg)
      }
      
      // Timeout para evitar carga infinita
      timeoutId = setTimeout(() => {
        console.error('Google Maps loading timeout')
        setLoadError('Timeout loading Google Maps. Please check your internet connection and API key.')
      }, 15000) // 15 segundos
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  // Inicializar el mapa
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    })

    setMap(mapInstance)
  }, [isLoaded])

  // Cargar lugares desde la API
  const loadPlaces = useCallback(async () => {
    try {
      const response = await fetch('/api/places')
      if (response.ok) {
        const placesData = await response.json()
        setPlaces(placesData)
      } else {
        console.error('Error fetching places')
      }
    } catch (error) {
      console.error('Error loading places:', error)
    }
  }, [])

  // Cargar lugares al montar el componente y cuando se actualice refreshTrigger
  useEffect(() => {
    loadPlaces()
  }, [loadPlaces, refreshTrigger])

  // Limpiar marcadores existentes
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }, [])

  // Agregar marcadores al mapa
  useEffect(() => {
    if (!map || places.length === 0) return

    clearMarkers()

    const newMarkers = places.map(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })

      marker.addListener('click', () => {
        setSelectedPlace(place)
      })

      return marker
    })

    markersRef.current = newMarkers

    // Ajustar el mapa para mostrar todos los marcadores
    if (places.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      places.forEach(place => {
        bounds.extend({ lat: place.latitude, lng: place.longitude })
      })
      map.fitBounds(bounds)
    }
  }, [map, places, clearMarkers])

  // Limpiar marcadores al desmontar
  useEffect(() => {
    return () => {
      clearMarkers()
    }
  }, [clearMarkers])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Error cargando Google Maps</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Pasos para solucionarlo:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Ve a <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
              <li>2. Habilita &quot;Maps JavaScript API&quot;</li>
              <li>3. Crea/verifica tu API Key</li>
              <li>4. Actualiza .env.local con tu API Key</li>
              <li>5. Reinicia la aplicación</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando Google Maps...</p>
          <p className="mt-2 text-sm text-gray-500">Esto puede tomar unos segundos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
      {selectedPlace && (
        <PlaceInfoModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onUpdate={loadPlaces}
        />
      )}
    </>
  )
}
