'use client'

import { useEffect, useState } from 'react'
import { Place } from '@/types/place'

interface PlacesListProps {
  refreshTrigger?: number
}

export function PlacesList({ refreshTrigger }: PlacesListProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const loadPlaces = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/places')
      if (response.ok) {
        const placesData = await response.json()
        setPlaces(placesData)
      } else {
        console.error('Error fetching places')
      }
    } catch (error) {
      console.error('Error loading places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlaces()
  }, [refreshTrigger])

  const filteredPlaces = places.filter(place => {
    const matchesText = place.name.toLowerCase().includes(filter.toLowerCase()) ||
                       place.description.toLowerCase().includes(filter.toLowerCase()) ||
                       place.address?.toLowerCase().includes(filter.toLowerCase())
    
    const matchesCategory = !categoryFilter || place.category === categoryFilter
    
    return matchesText && matchesCategory
  })

  const categories = [...new Set(places.map(place => place.category))].sort()

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Buscar lugares..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {places.length === 0 ? (
              <>
                <p className="text-lg mb-2">¡No hay lugares aún!</p>
                <p className="text-sm">Agrega tu primer lugar usando el botón de arriba.</p>
              </>
            ) : (
              <p>No se encontraron lugares con esos filtros.</p>
            )}
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // Scroll to place on map (could be implemented later)
                // For now, just show an alert with coordinates
                alert(`${place.name}\nLat: ${place.latitude}, Lng: ${place.longitude}`)
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">{place.name}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(place.createdAt)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {place.category}
                </span>
                {place.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-medium">{place.rating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {place.description}
              </p>
              
              {place.address && (
                <p className="text-gray-500 text-xs truncate">
                  📍 {place.address}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {filteredPlaces.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {filteredPlaces.length} de {places.length} lugares
        </div>
      )}
    </div>
  )
}
