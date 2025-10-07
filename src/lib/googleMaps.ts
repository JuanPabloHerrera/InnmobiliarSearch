// Utility para cargar Google Maps de forma singleton SIN CALLBACK
let googleMapsPromise: Promise<void> | null = null
let isLoading = false

export function loadGoogleMaps(): Promise<void> {
  // Si ya está cargado, resolver inmediatamente
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve()
  }

  // Si ya hay una promesa en curso, devolverla
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  // Si está cargando pero no hay promesa (caso de reinicio)
  if (isLoading) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          isLoading = false
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        isLoading = false
        reject(new Error('Timeout loading Google Maps'))
      }, 15000)
    })
    return googleMapsPromise
  }

  // Si ya existe un script, esperar a que termine
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
  if (existingScript) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
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
    return googleMapsPromise
  }

  // Crear nueva promesa para cargar Google Maps SIN CALLBACK
  isLoading = true
  googleMapsPromise = new Promise((resolve, reject) => {
    // Crear y cargar el script sin callback
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.id = 'google-maps-script'
    
    script.onload = () => {
      // Esperar a que Google Maps esté completamente disponible
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          isLoading = false
          resolve()
        } else {
          setTimeout(checkGoogleMaps, 50)
        }
      }
      checkGoogleMaps()
    }
    
    script.onerror = () => {
      isLoading = false
      reject(new Error('Failed to load Google Maps'))
      googleMapsPromise = null // Permitir reintentos
      // Limpiar script fallido
      script.remove()
    }

    document.head.appendChild(script)
    
    // Timeout de seguridad
    setTimeout(() => {
      if (isLoading) {
        isLoading = false
        reject(new Error('Timeout loading Google Maps'))
        googleMapsPromise = null
        script.remove()
      }
    }, 15000)
  })

  return googleMapsPromise
}

declare global {
  interface Window {
    google: any
    [key: string]: any
  }
}
