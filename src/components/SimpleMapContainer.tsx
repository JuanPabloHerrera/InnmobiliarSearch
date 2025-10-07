'use client'

import { useEffect, useRef, useState } from 'react'
import { Place } from '@/types/place'
import { loadGoogleMaps } from '@/lib/googleMaps'
import { cleanupGoogleMapsScripts } from '@/lib/cleanupGoogleMaps'
import { FallbackMap } from './FallbackMap'

interface SimpleMapContainerProps {
  refreshTrigger?: number
}

export function SimpleMapContainer({ refreshTrigger }: SimpleMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])

  // Cargar Google Maps usando la utilidad singleton
  useEffect(() => {
    // Limpiar scripts duplicados primero
    cleanupGoogleMapsScripts()
    
    loadGoogleMaps()
      .then(() => {
        console.log('Google Maps loaded successfully')
        setIsLoaded(true)
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
        setLoadError(true)
      })
  }, [])

  // Cargar lugares
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await fetch('/api/places')
        if (response.ok) {
          const placesData = await response.json()
          setPlaces(placesData)
        }
      } catch (error) {
        console.error('Error loading places:', error)
      }
    }
    loadPlaces()
  }, [refreshTrigger])

  // Inicializar mapa cuando esté listo
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 19.4326, lng: -99.1332 },
      zoom: 12,
      gestureHandling: 'greedy', // Permite arrastrar con un dedo sin el mensaje
    })

    // Agregar marcadores
    places.forEach(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 10px 0; font-weight: bold;">${place.name}</h3>
            <p style="margin: 0 0 5px 0; color: #666;">${place.category}</p>
            <p style="margin: 0;">${place.description}</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })
    })

    // Ajustar vista si hay lugares
    if (places.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      places.forEach(place => {
        bounds.extend({ lat: place.latitude, lng: place.longitude })
      })
      map.fitBounds(bounds)
    }
  }, [isLoaded, places])

  // Si hay error, mostrar fallback
  if (loadError) {
    return <FallbackMap refreshTrigger={refreshTrigger} />
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando mapa...</p>
          <p className="mt-2 text-sm text-gray-500">Verificando API Key...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-full" />
}

