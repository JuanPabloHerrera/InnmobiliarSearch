'use client'

export default function Setup() {
  const currentApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Configuración de Google Maps API</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Estado actual */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado Actual</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">API Key:</h3>
                <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                  {currentApiKey || 'No configurado'}
                </p>
                <div className="mt-3">
                  {currentApiKey && currentApiKey !== 'your_google_maps_api_key_here' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⚠️ API Key configurado pero con errores
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      ❌ API Key no configurado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Mientras configuras</h3>
              <p className="text-blue-700 text-sm">
                La aplicación funciona en modo fallback, mostrando una lista de lugares 
                con enlaces directos a Google Maps web.
              </p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Pasos de Configuración</h2>
            
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</span>
                <div>
                  <p className="font-medium">Accede a Google Cloud Console</p>
                  <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline text-sm">
                    console.cloud.google.com
                  </a>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</span>
                <div>
                  <p className="font-medium">Crea o selecciona un proyecto</p>
                  <p className="text-gray-600 text-sm">Si no tienes uno, crea un nuevo proyecto</p>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</span>
                <div>
                  <p className="font-medium">Habilita las APIs necesarias</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1">
                    <li>• Maps JavaScript API (requerido)</li>
                    <li>• Places API (opcional)</li>
                    <li>• Geocoding API (opcional)</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-1">Ve a &quot;APIs y servicios&quot; → &quot;Biblioteca&quot;</p>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</span>
                <div>
                  <p className="font-medium">Crea una API Key</p>
                  <p className="text-gray-600 text-sm">Ve a &quot;Credenciales&quot; → &quot;Crear credenciales&quot; → &quot;Clave de API&quot;</p>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">5</span>
                <div>
                  <p className="font-medium">Configura restricciones (recomendado)</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1">
                    <li>• Tipo: &quot;Referentes HTTP&quot;</li>
                    <li>• Agrega: <code className="bg-gray-100 px-1">localhost:3000/*</code></li>
                    <li>• Agrega tu dominio de producción</li>
                  </ul>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">6</span>
                <div>
                  <p className="font-medium">Actualiza tu archivo .env.local</p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono mt-2">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=&quot;tu_clave_aqui&quot;
                  </div>
                </div>
              </li>

              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">7</span>
                <div>
                  <p className="font-medium">Reinicia la aplicación</p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono mt-2">
                    npm run dev
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Advertencias importantes */}
        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Las API Keys nuevas pueden tardar unos minutos en activarse</li>
              <li>• Verifica que tengas cuota disponible en tu cuenta de Google Cloud</li>
              <li>• Google Maps requiere una cuenta de facturación (hay créditos gratuitos)</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">💰 Costos</h3>
            <p className="text-green-700 text-sm">
              Google ofrece $200 USD en créditos gratuitos mensuales para Maps API, 
              lo que es suficiente para desarrollo y aplicaciones pequeñas.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center space-x-4 mt-8">
          <a 
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver a la aplicación
          </a>
          <a 
            href="/test-maps"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Probar configuración →
          </a>
        </div>
      </div>
    </div>
  )
}
