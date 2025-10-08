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
                background-color: #f5f5f5;
                border-radius: 10px;
              ">
                <div style="
                  font-size: 13px;
                  font-weight: 700;
                  color: #09090b;
                  line-height: 1.6;
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
                  background-color: #f5f5f5;
                  border-radius: 10px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="flex-shrink: 0;">
                    <path fill="none" stroke="#71717a" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 17v-5.548c0-.534 0-.801-.065-1.05a1.998 1.998 0 0 0-.28-.617c-.145-.213-.345-.39-.748-.741l-4.8-4.2c-.746-.653-1.12-.98-1.54-1.104c-.37-.11-.764-.11-1.135 0c-.42.124-.792.45-1.538 1.102L5.093 9.044c-.402.352-.603.528-.747.74a2 2 0 0 0-.281.618C4 10.65 4 10.918 4 11.452V17c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.082 1.083C5.602 20 6.068 20 7 20s1.398 0 1.766-.152a2 2 0 0 0 1.082-1.083C10 18.398 10 17.932 10 17v-1a2 2 0 1 1 4 0v1c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.082 1.083C15.602 20 16.068 20 17 20s1.398 0 1.766-.152a2 2 0 0 0 1.082-1.083C20 18.398 20 17.932 20 17Z"/>
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
                  background-color: #f5f5f5;
                  border-radius: 10px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" style="flex-shrink: 0;">
                    <path fill="#71717a" d="M6 6C4.355 6 3 7.355 3 9v6.78c-.61.552-1 1.342-1 2.22v9h5v-2h18v2h5v-9c0-.878-.39-1.668-1-2.22V9c0-1.645-1.355-3-3-3H6zm0 2h20c.555 0 1 .445 1 1v6h-2v-1c0-1.645-1.355-3-3-3h-4c-.767 0-1.467.3-2 .78a2.985 2.985 0 0 0-2-.78h-4c-1.645 0-3 1.355-3 3v1H5V9c0-.555.445-1 1-1zm4 5h4c.555 0 1 .445 1 1v1H9v-1c0-.555.445-1 1-1zm8 0h4c.555 0 1 .445 1 1v1h-6v-1c0-.555.445-1 1-1zM5 17h22c.555 0 1 .445 1 1v7h-1v-2H5v2H4v-7c0-.555.445-1 1-1z"/>
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.recamaras} ${property.recamaras === '1' ? 'recámara' : 'recámaras'}</span>
                </div>
              ` : ''}
              ${property.banos ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #f5f5f5;
                  border-radius: 10px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="flex-shrink: 0;">
                    <path fill="#71717a" d="M8 18q-.425 0-.713-.288T7 17q0-.425.288-.713T8 16q.425 0 .713.288T9 17q0 .425-.288.713T8 18Zm4 0q-.425 0-.713-.288T11 17q0-.425.288-.713T12 16q.425 0 .713.288T13 17q0 .425-.288.713T12 18Zm4 0q-.425 0-.713-.288T15 17q0-.425.288-.713T16 16q.425 0 .713.288T17 17q0 .425-.288.713T16 18ZM5 14v-2q0-2.65 1.7-4.6T11 5.1V3h2v2.1q2.6.35 4.3 2.3T19 12v2H5Zm2-2h10q0-2.075-1.463-3.538T12 7Q9.925 7 8.462 8.463T7 12Zm1 9q-.425 0-.713-.288T7 20q0-.425.288-.713T8 19q.425 0 .713.288T9 20q0 .425-.288.713T8 21Zm4 0q-.425 0-.713-.288T11 20q0-.425.288-.713T12 19q.425 0 .713.288T13 20q0 .425-.288.713T12 21Zm4 0q-.425 0-.713-.288T15 20q0-.425.288-.713T16 19q.425 0 .713.288T17 20q0 .425-.288.713T16 21Zm-4-9Z"/>
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.banos} ${property.banos === '1' ? 'baño' : 'baños'}</span>
                </div>
              ` : ''}
              ${property.estacionamientos ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 10px;
                  background-color: #f5f5f5;
                  border-radius: 10px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" style="flex-shrink: 0;">
                    <path fill="#71717a" d="M9.5 6c-1.32 0-2.496.86-2.875 2.125L5.25 12.719l-1.938-.656l-.624 1.874l1.968.657l-.625 2.125A.972.972 0 0 0 4 17v8c0 .55.45 1 1 1h3l.344-1h15.312L24 26h3c.55 0 1-.45 1-1v-.844c.004-.05.004-.105 0-.156v-7a.972.972 0 0 0-.031-.281l-.625-2.125l1.968-.656l-.625-1.876l-1.937.657l-1.375-4.594A2.997 2.997 0 0 0 22.5 6zm0 2h13c.445 0 .84.293.969.719L24.75 13H7.25l1.281-4.281c.13-.43.524-.719.969-.719zm-2.844 7h18.688L26 17.188V23H6v-5.813zM8.5 16a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3zm15 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3zM12 19l-1.25 3h2.156l.438-1h5.312l.438 1h2.156L20 19z"/>
                  </svg>
                  <span style="font-size: 13px; color: #52525b; line-height: 1.6;">${property.estacionamientos} ${property.estacionamientos === '1' ? 'estacionamiento' : 'estacionamientos'}</span>
                </div>
              ` : ''}
            </div>
            
            ${property.amenidades ? `
              <div style="
                margin-bottom: 16px;
                padding: 12px;
                background-color: #f5f5f5;
                border-radius: 10px;
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
                    background: #f5f5f5;
                    border: none;
                    color: #52525b;
                    font-size: 13px;
                    font-weight: 400;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.15s ease;
                  "
                  onmouseover="this.style.backgroundColor='#e5e5e5'"
                  onmouseout="this.style.backgroundColor='#f5f5f5'"
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
                  background-color: #f5f5f5;
                  border-radius: 10px;
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

