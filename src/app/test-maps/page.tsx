'use client'

import { useEffect, useState } from 'react'
import { cleanupGoogleMapsScripts } from '@/lib/cleanupGoogleMaps'

export default function TestMaps() {
  const [status, setStatus] = useState('Iniciando prueba...')
  const [apiKey, setApiKey] = useState('')
  const [manualTestInProgress, setManualTestInProgress] = useState(false)

  useEffect(() => {
    const checkGoogleMapsStatus = () => {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      setApiKey(key || 'No configurado')
      
      if (!key || key === 'your_google_maps_api_key_here') {
        setStatus('❌ API Key no configurado en .env.local')
        return
      }

      // Verificar si Google Maps ya está cargado desde otra página
      if (window.google && window.google.maps) {
        setStatus('✅ Google Maps está cargado y funcionando!')
        return
      }

      // Verificar si hay un script de Google Maps cargándose
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        setStatus('🔄 Google Maps se está cargando desde la página principal...')
        
        // Monitorear si se carga exitosamente
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            setStatus('✅ Google Maps cargado exitosamente!')
            clearInterval(checkInterval)
          }
        }, 1000)
        
        // Timeout después de 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval)
          if (!window.google) {
            setStatus('❌ Google Maps no se cargó. Verifica tu configuración.')
          }
        }, 10000)
        return
      }

      // No hay script y API key está configurado
      setStatus('⚠️ API Key configurado pero Google Maps no se ha intentado cargar aún. Ve a la página principal.')
    }

    checkGoogleMapsStatus()
  }, [])

  const runManualTest = () => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!key || key === 'your_google_maps_api_key_here') {
      setStatus('❌ Configura tu API Key primero')
      return
    }

    setManualTestInProgress(true)
    setStatus('🔄 Iniciando prueba manual de Google Maps...')
    
    // Limpiar cualquier script anterior
    cleanupGoogleMapsScripts()
    
    // Crear callback único para esta prueba
    const testCallbackName = 'manualTest_' + Date.now()
    
    // Callback que persiste hasta que termine la prueba
    window[testCallbackName] = () => {
      setStatus('✅ ¡Prueba exitosa! Google Maps se cargó correctamente.')
      setManualTestInProgress(false)
      // No eliminar el callback inmediatamente para evitar errores
      setTimeout(() => {
        try { delete window[testCallbackName] } catch(e) {}
      }, 5000)
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=${testCallbackName}`
    script.id = 'manual-test-script'
    
    script.onerror = () => {
      setStatus('❌ Error al cargar Google Maps. API Key inválida o sin permisos.')
      setManualTestInProgress(false)
      try { delete window[testCallbackName] } catch(e) {}
    }
    
    document.head.appendChild(script)
    
    // Timeout de 15 segundos
    setTimeout(() => {
      if (manualTestInProgress && !window.google) {
        setStatus('❌ Timeout: Google Maps no se cargó en 15 segundos.')
        setManualTestInProgress(false)
        try { 
          document.getElementById('manual-test-script')?.remove()
          delete window[testCallbackName] 
        } catch(e) {}
      }
    }, 15000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Diagnóstico de Google Maps</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Estado actual:</h2>
            <p className="text-lg">{status}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-700">API Key:</h2>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {apiKey}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="font-semibold text-gray-700 mb-2">Pasos para configurar Google Maps API:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Selecciona o crea un proyecto</li>
              <li>
                <strong>Habilita las APIs necesarias:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Maps JavaScript API</li>
                  <li>Places API (opcional)</li>
                  <li>Geocoding API (opcional)</li>
                </ul>
              </li>
              <li>Ve a "Credenciales" → "Crear credenciales" → "Clave de API"</li>
              <li>
                <strong>Configura restricciones (recomendado):</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Restricciones de aplicación: "Referentes HTTP"</li>
                  <li>Agrega: localhost:3000/*, tu-dominio.com/*</li>
                  <li>Restricciones de API: Selecciona solo las APIs que necesitas</li>
                </ul>
              </li>
              <li>Copia la API Key</li>
              <li>Actualiza .env.local: <code className="bg-gray-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_clave_aqui"</code></li>
              <li>Reinicia la aplicación: <code className="bg-gray-100 px-1">npm run dev</code></li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Importante:</strong> Si acabas de crear la API Key, puede tomar unos minutos en propagarse. 
                También verifica que tengas cuota disponible en tu proyecto de Google Cloud.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4">
            <button 
              onClick={runManualTest}
              disabled={manualTestInProgress}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {manualTestInProgress ? 'Probando...' : '🧪 Probar API Key'}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Actualizar estado
            </button>
            <a 
              href="/setup"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center"
            >
              🔧 Configurar API
            </a>
            <a 
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              ← Volver a la app
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
