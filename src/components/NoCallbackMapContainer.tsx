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
        zoomControl: false, // Deshabilitar botones de zoom
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        panControl: false,
      })
      
      // Crear botón de geolocalización personalizado
      const locationButton = document.createElement('button')
      locationButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#666" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      `
      locationButton.title = 'Go to your location'
      locationButton.style.cssText = `
        background-color: #fff;
        border: 0;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,.3);
        cursor: pointer;
        margin: 10px 10px 40px 10px;
        padding: 0;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      `

      locationButton.addEventListener('mouseover', () => {
        locationButton.style.backgroundColor = '#f8f9fa'
        locationButton.style.transform = 'scale(1.05)'
      })

      locationButton.addEventListener('mouseout', () => {
        locationButton.style.backgroundColor = '#fff'
        locationButton.style.transform = 'scale(1)'
      })

      locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
          locationButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2" fill="none" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          `
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              mapInstance.setCenter(pos)
              mapInstance.setZoom(15)
              
              // Agregar marcador temporal en la ubicación del usuario
              new google.maps.Marker({
                position: pos,
                map: mapInstance,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                },
                title: 'Your Location',
              })
              
              locationButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#666" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              `
            },
            () => {
              alert('Error: The Geolocation service failed.')
              locationButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#666" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              `
            }
          )
        } else {
          alert('Error: Your browser doesn\'t support geolocation.')
        }
      })

      // Agregar botón al mapa
      mapInstance.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton)
      
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
              min-width: 240px;
              max-width: 300px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
              color: #000000 !important;
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
                display: flex;
                align-items: center;
                gap: 8px;
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
