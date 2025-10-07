'use client'

import { useEffect, useState } from 'react'
import { Place } from '@/types/place'

interface FallbackMapProps {
  refreshTrigger?: number
}

export function FallbackMap({ refreshTrigger }: FallbackMapProps) {
  const [places, setPlaces] = useState<Place[]>([])

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

  const openInGoogleMaps = (place: Place) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Mapa no disponible
        </h2>
        <p className="text-gray-600 mb-6">
          Para ver el mapa interactivo, necesitas configurar tu API Key de Google Maps.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Lugares disponibles ({places.length})
          </h3>
          
          {places.length === 0 ? (
            <p className="text-gray-500">No hay lugares registrados aún.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800">{place.name}</h4>
                    <p className="text-sm text-gray-600">{place.category}</p>
                    <p className="text-xs text-gray-500">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => openInGoogleMaps(place)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Ver en Maps
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 justify-center">
          <a
            href="/setup"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            🔧 Configurar Google Maps
          </a>
          <a
            href="/test-maps"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            🧪 Probar API
          </a>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    </div>
  )
}
