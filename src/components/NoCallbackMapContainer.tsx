'use client'

import { useEffect, useRef, useState } from 'react'
import { Place } from '@/types/place'
import { FallbackMap } from './FallbackMap'

interface NoCallbackMapContainerProps {
  refreshTrigger?: number
  showSidebar?: boolean
}

export function NoCallbackMapContainer({ refreshTrigger, showSidebar }: NoCallbackMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Cargar Google Maps sin callback
  useEffect(() => {
    let isMounted = true

    const loadGoogleMapsDirectly = async () => {
      try {
        // Si Google Maps ya está disponible
        if (window.google && window.google.maps) {
          if (isMounted) setIsLoaded(true)
          return
        }

        // Verificar si ya hay un script sin callback
        let existingScript = document.querySelector('script[src*="maps.googleapis.com"]:not([src*="callback="])')
        
        if (!existingScript) {
          // Limpiar cualquier script con callback primero
          const callbackScripts = document.querySelectorAll('script[src*="maps.googleapis.com"][src*="callback="]')
          callbackScripts.forEach(script => script.remove())

          // Crear nuevo script sin callback
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
          script.async = true
          script.defer = true
          script.id = 'google-maps-no-callback'
          
          document.head.appendChild(script)
          existingScript = script
        }

        // Esperar a que se cargue
        const waitForGoogleMaps = () => {
          return new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
              if (window.google && window.google.maps && window.google.maps.Map) {
                clearInterval(checkInterval)
                resolve()
              }
            }, 100)

            // Timeout después de 15 segundos
            setTimeout(() => {
              clearInterval(checkInterval)
              reject(new Error('Timeout loading Google Maps'))
            }, 15000)
          })
        }

        await waitForGoogleMaps()
        
        if (isMounted) {
          setIsLoaded(true)
          console.log('Google Maps loaded successfully without callback')
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        if (isMounted) {
          setLoadError(true)
        }
      }
    }

    loadGoogleMapsDirectly()

    // Cleanup
    return () => {
      isMounted = false
    }
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
    if (!isLoaded || !mapRef.current || !window.google) return

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 19.4326, lng: -99.1332 },
        zoom: 12,
        gestureHandling: 'greedy', // Permite arrastrar con un dedo sin el mensaje
      })
      
      setMap(mapInstance)

      // Agregar marcadores
      places.forEach(place => {
        const marker = new google.maps.Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map: mapInstance,
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

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="
              padding: 0;
              min-width: 240px;
              max-width: 280px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            ">
              <div style="
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px 8px 0 0;
                margin: -8px -8px 0 -8px;
              ">
                <h3 style="
                  margin: 0;
                  font-size: 18px;
                  font-weight: 600;
                  color: white;
                  letter-spacing: -0.01em;
                ">${place.name}</h3>
              </div>
              <div style="padding: 16px 16px 12px 16px;">
                <div style="
                  display: inline-block;
                  padding: 4px 10px;
                  background: #f3f4f6;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                  color: #6b7280;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 12px;
                ">${place.category}</div>
                <p style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #374151;
                ">${place.description}</p>
                ${place.rating ? `
                  <div style="
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  ">
                    <span style="color: #fbbf24; font-size: 16px;">★</span>
                    <span style="
                      font-size: 15px;
                      font-weight: 600;
                      color: #111827;
                    ">${place.rating}</span>
                    <span style="
                      font-size: 13px;
                      color: #9ca3af;
                    ">/5</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })
      })

      // Ajustar vista si hay lugares
      if (places.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        places.forEach(place => {
          bounds.extend({ lat: place.latitude, lng: place.longitude })
        })
        mapInstance.fitBounds(bounds)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setLoadError(true)
    }
  }, [isLoaded, places])

  // Redimensionar mapa cuando cambie el sidebar
  useEffect(() => {
    if (!map) return

    // Esperar a que termine la transición CSS antes de redimensionar
    const resizeTimer = setTimeout(() => {
      google.maps.event.trigger(map, 'resize')
      
      // Recentrar el mapa si hay lugares
      if (places.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        places.forEach(place => {
          bounds.extend({ lat: place.latitude, lng: place.longitude })
        })
        map.fitBounds(bounds)
      } else {
        // Si no hay lugares, centrar en Ciudad de México
        map.setCenter({ lat: 19.4326, lng: -99.1332 })
        map.setZoom(12)
      }
    }, 350) // Esperar un poco más que la duración de la transición (300ms)

    return () => clearTimeout(resizeTimer)
  }, [showSidebar, map, places])

  // Redimensionar mapa cuando cambie el tamaño de la ventana
  useEffect(() => {
    if (!map) return

    const handleResize = () => {
      google.maps.event.trigger(map, 'resize')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [map])

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
          <p className="mt-2 text-sm text-gray-500">Sin callbacks - Más estable</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-full" />
}
