'use client'

import { useEffect, useRef, useState } from 'react'
import { FallbackMap } from './FallbackMap'

interface Property {
  id: string
  calle: string
  colonia: string
  alcaldia: string
  precio?: string
  m2?: string
  recamaras?: string
  banos?: string
  estacionamientos?: string
  amenidades?: string
  descripcion?: string
  url?: string
  mantenimiento?: string
  inmobiliaria?: string
  latitude: number
  longitude: number
  fullAddress: string
}

interface PropertyMapContainerProps {
  refreshTrigger?: number
  showSidebar?: boolean
}

export function PropertyMapContainer({ refreshTrigger, showSidebar }: PropertyMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Load Google Maps
  useEffect(() => {
    let isMounted = true

    const loadGoogleMapsDirectly = async () => {
      try {
        if (window.google && window.google.maps) {
          if (isMounted) setIsLoaded(true)
          return
        }

        let existingScript = document.querySelector('script[src*="maps.googleapis.com"]:not([src*="callback="])')
        
        if (!existingScript) {
          const callbackScripts = document.querySelectorAll('script[src*="maps.googleapis.com"][src*="callback="]')
          callbackScripts.forEach(script => script.remove())

          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
          script.async = true
          script.defer = true
          script.id = 'google-maps-no-callback'
          
          document.head.appendChild(script)
          existingScript = script
        }

        const waitForGoogleMaps = () => {
          return new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
              if (window.google && window.google.maps && window.google.maps.Map) {
                clearInterval(checkInterval)
                resolve()
              }
            }, 100)

            setTimeout(() => {
              clearInterval(checkInterval)
              reject(new Error('Timeout loading Google Maps'))
            }, 15000)
          })
        }

        await waitForGoogleMaps()
        
        if (isMounted) {
          setIsLoaded(true)
          console.log('Google Maps loaded successfully')
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        if (isMounted) {
          setLoadError(true)
        }
      }
    }

    loadGoogleMapsDirectly()

    return () => {
      isMounted = false
    }
  }, [])

  // Load properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const propertiesData = await response.json()
          setProperties(propertiesData)
          console.log(`Loaded ${propertiesData.length} properties`)
        }
      } catch (error) {
        console.error('Error loading properties:', error)
      }
    }
    loadProperties()
  }, [refreshTrigger])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 19.4326, lng: -99.1332 }, // Mexico City
        zoom: 12,
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })
      
      // Create location button
      const locationButton = document.createElement('button')
      locationButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#666" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      `
      locationButton.title = 'Ir a tu ubicación'
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
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              mapInstance.setCenter(pos)
              mapInstance.setZoom(15)
              
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
                title: 'Tu ubicación',
              })
            },
            () => {
              alert('Error: El servicio de geolocalización falló.')
            }
          )
        }
      })

      mapInstance.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton)
      
      setMap(mapInstance)

      // Keep track of currently open info window
      let currentInfoWindow: google.maps.InfoWindow | null = null

      // Add property markers
      properties.forEach(property => {
        const marker = new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.calle,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.5C9.313 1.5 5.5 5.313 5.5 10c0 6 8.5 15 8.5 15s8.5-9 8.5-15c0-4.687-3.813-8.5-8.5-8.5z" fill="#DC2626" stroke="#991B1B" stroke-width="1.5"/>
                <circle cx="14" cy="10" r="3.5" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(28, 28),
            anchor: new google.maps.Point(14, 28)
          }
        })

        // Create info window content with shadcn-inspired styling
        const infoContent = `
          <div style="
            min-width: 300px;
            max-width: 360px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #09090b;
            padding: 4px;
          ">
            <div style="margin-bottom: 16px;">
              <h3 style="
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #09090b;
                line-height: 1.4;
                letter-spacing: -0.01em;
              ">${property.calle}</h3>
              <p style="
                margin: 0;
                font-size: 13px;
                color: #52525b;
                line-height: 1.6;
              ">${property.colonia}, ${property.alcaldia}</p>
            </div>
            
            ${property.precio ? `
              <div style="
                margin-bottom: 16px;
                padding: 12px;
                background-color: #fafafa;
                border: 1px solid #e4e4e7;
                border-radius: 6px;
              ">
                <div style="
                  font-size: 20px;
                  font-weight: 600;
                  color: #09090b;
                  letter-spacing: -0.01em;
                ">${property.precio}</div>
              </div>
            ` : ''}
            
            <div style="
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 16px;
            ">
              ${property.m2 ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 16px; height: 16px; color: #71717a; flex-shrink: 0;">
                    <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z" clip-rule="evenodd" />
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.m2} m²</span>
                </div>
              ` : ''}
              ${property.recamaras ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 16px; height: 16px; color: #71717a; flex-shrink: 0;">
                    <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.recamaras} rec</span>
                </div>
              ` : ''}
              ${property.banos ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 16px; height: 16px; color: #71717a; flex-shrink: 0;">
                    <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM15 5.75a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5zm-8.5 6a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zm3.5-3a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clip-rule="evenodd" />
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.banos} baños</span>
                </div>
              ` : ''}
              ${property.estacionamientos ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 16px; height: 16px; color: #71717a; flex-shrink: 0;">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-3 0h-3a1.5 1.5 0 01-3 0h-1A1.5 1.5 0 013 12.5v-9A1.5 1.5 0 014.5 2H6v1.5a1.5 1.5 0 001 1.415V6.5h2V4.915A1.5 1.5 0 007 3.5z" />
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.estacionamientos} est</span>
                </div>
              ` : ''}
            </div>
            
            ${property.amenidades ? `
              <div style="
                margin-bottom: 16px;
                padding: 12px;
                background-color: #fafafa;
                border: 1px solid #e4e4e7;
                border-radius: 6px;
              ">
                <p style="
                  margin: 0 0 6px 0;
                  font-size: 11px;
                  font-weight: 600;
                  color: #71717a;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                ">Amenidades</p>
                <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
                  ${property.amenidades}
                </p>
              </div>
            ` : ''}
            
            ${property.descripcion ? `
              <div style="margin-bottom: 0;">
                <button 
                  onclick="
                    const desc = this.nextElementSibling;
                    const icon = this.querySelector('.toggle-icon');
                    const isHidden = desc.style.display === 'none';
                    desc.style.display = isHidden ? 'block' : 'none';
                    icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                    this.querySelector('.toggle-text').textContent = isHidden ? 'Ocultar' : 'Ver descripción';
                  "
                  style="
                    width: 100%;
                    background: transparent;
                    border: 1px solid #e4e4e7;
                    color: #52525b;
                    font-size: 13px;
                    font-weight: 400;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.15s ease;
                  "
                  onmouseover="this.style.backgroundColor='#f4f4f5'"
                  onmouseout="this.style.backgroundColor='transparent'"
                >
                  <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 14px; height: 14px; transition: transform 0.2s ease;">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                  </svg>
                  <span class="toggle-text">Ver descripción</span>
                </button>
                <div style="
                  display: none;
                  margin-top: 10px;
                  padding: 12px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                  max-height: 180px;
                  overflow-y: auto;
                ">
                  <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
                    ${property.descripcion}
                  </p>
                </div>
              </div>
            ` : ''}
          </div>
        `

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        })

        marker.addListener('click', () => {
          // Close previously opened info window
          if (currentInfoWindow) {
            currentInfoWindow.close()
          }
          
          // Open new info window
          infoWindow.open({
            anchor: marker,
            map: mapInstance,
            shouldFocus: false
          })
          
          // Update reference to current info window
          currentInfoWindow = infoWindow
        })
      })

      // Close info window when clicking on the map
      mapInstance.addListener('click', () => {
        if (currentInfoWindow) {
          currentInfoWindow.close()
          currentInfoWindow = null
        }
      })

      // Fit bounds if there are properties
      if (properties.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        properties.forEach(property => {
          bounds.extend({ lat: property.latitude, lng: property.longitude })
        })
        mapInstance.fitBounds(bounds)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setLoadError(true)
    }
  }, [isLoaded, properties])

  // Resize map when sidebar changes
  useEffect(() => {
    if (!map) return

    const resizeTimer = setTimeout(() => {
      google.maps.event.trigger(map, 'resize')
      
      if (properties.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        properties.forEach(property => {
          bounds.extend({ lat: property.latitude, lng: property.longitude })
        })
        map.fitBounds(bounds)
      } else {
        map.setCenter({ lat: 19.4326, lng: -99.1332 })
        map.setZoom(12)
      }
    }, 350)

    return () => clearTimeout(resizeTimer)
  }, [showSidebar, map, properties])

  // Resize map on window resize
  useEffect(() => {
    if (!map) return

    const handleResize = () => {
      google.maps.event.trigger(map, 'resize')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [map])

  if (loadError) {
    return <FallbackMap refreshTrigger={refreshTrigger} />
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Cargando mapa...</p>
          <p className="mt-2 text-sm text-gray-500">Propiedades en CDMX</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-full" />
}

