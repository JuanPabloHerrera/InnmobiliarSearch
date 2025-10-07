// Utility para limpiar scripts duplicados de Google Maps
export function cleanupGoogleMapsScripts() {
  if (typeof window === 'undefined') return

  // Buscar todos los scripts de Google Maps
  const googleMapsScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
  
  // Si hay más de uno, eliminar los extras
  if (googleMapsScripts.length > 1) {
    console.log(`Found ${googleMapsScripts.length} Google Maps scripts, cleaning up duplicates`)
    
    // Mantener solo el primero que funcione
    let keepFirst = true
    googleMapsScripts.forEach((script) => {
      const src = script.getAttribute('src') || ''
      
      // Si no es el primero O si tiene callback en la URL, eliminarlo
      if (!keepFirst || src.includes('callback=')) {
        script.remove()
        console.log('Removed duplicate/callback script:', src)
      } else {
        keepFirst = false
      }
    })
  }

  // Limpiar callbacks huérfanos en el objeto window
  Object.keys(window).forEach(key => {
    if (key.startsWith('initGoogleMaps') || 
        key.startsWith('testMapCallback') || 
        key.startsWith('manualTest_') ||
        key.startsWith('globalMapTestCallback')) {
      try {
        delete window[key]
        console.log('Cleaned up callback:', key)
      } catch (e) {
        // Ignorar errores al eliminar propiedades no configurables
      }
    }
  })
}
