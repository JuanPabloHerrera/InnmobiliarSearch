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
          <div style="
            min-width: 240px;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            color: #000000 !important;
            text-align: center !important;
          ">
            <div style="
              margin: 0 0 12px 0 !important;
              padding: 0 0 12px 0 !important;
              border-bottom: 1px solid hsl(0, 0%, 90%);
            ">
              <h3 style="
                margin: 0 !important;
                padding: 0 !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                color: #000000 !important;
                line-height: 1.3 !important;
                letter-spacing: -0.025em !important;
                -webkit-text-fill-color: #000000 !important;
              ">${place.name}</h3>
            </div>
            <div style="
              margin: 0 0 12px 0 !important;
              padding: 0 !important;
            ">
              <span style="
                display: inline-flex;
                align-items: center;
                font-size: 11px !important;
                font-weight: 500 !important;
                color: hsl(0, 0%, 45%) !important;
                text-transform: uppercase;
                letter-spacing: 0.1em !important;
                -webkit-text-fill-color: hsl(0, 0%, 45%) !important;
              ">${place.category}</span>
            </div>
            <p style="
              margin: 0 0 12px 0 !important;
              padding: 0 !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
              color: hsl(0, 0%, 25%) !important;
              -webkit-text-fill-color: hsl(0, 0%, 25%) !important;
            ">${place.description}</p>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}" 
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-block;
                margin: 0 !important;
                padding: 0 !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                color: #2563eb !important;
                -webkit-text-fill-color: #2563eb !important;
                text-decoration: underline !important;
                cursor: pointer !important;
              "
            >View on Google Maps</a>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map: map,
          shouldFocus: false
        })
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

