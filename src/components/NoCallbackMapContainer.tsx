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
              padding: 20px;
              min-width: 260px;
              max-width: 320px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
              background: white !important;
              border-radius: 12px;
              color: #000000 !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            ">
              <div style="
                margin-bottom: 12px !important;
                padding-bottom: 12px !important;
                border-bottom: 1px solid hsl(0, 0%, 90%);
              ">
                <h3 style="
                  margin: 0 !important;
                  font-size: 18px !important;
                  font-weight: 600 !important;
                  color: #000000 !important;
                  line-height: 1.3 !important;
                  letter-spacing: -0.025em !important;
                  -webkit-text-fill-color: #000000 !important;
                ">${place.name}</h3>
              </div>
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px !important;
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
                ${place.rating ? `
                  <span style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                  ">
                    <span style="color: hsl(47, 96%, 53%) !important;">★</span>
                    ${place.rating}
                  </span>
                ` : ''}
              </div>
              <p style="
                margin: 0 !important;
                font-size: 14px !important;
                line-height: 1.6 !important;
                color: hsl(0, 0%, 25%) !important;
                -webkit-text-fill-color: hsl(0, 0%, 25%) !important;
              ">${place.description}</p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map: mapInstance,
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
