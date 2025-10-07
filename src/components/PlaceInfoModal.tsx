'use client'

import { Place } from '@/types/place'
import { useState } from 'react'

interface PlaceInfoModalProps {
  place: Place
  onClose: () => void
  onUpdate: () => void
}

export function PlaceInfoModal({ place, onClose, onUpdate }: PlaceInfoModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lugar?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/places/${place.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        alert('Error al eliminar el lugar')
      }
    } catch (error) {
      console.error('Error deleting place:', error)
      alert('Error al eliminar el lugar')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{place.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image */}
          {place.imageUrl && (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {/* Category and Rating */}
          <div className="flex justify-between items-center">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {place.category}
            </span>
            {place.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{place.rating}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
            <p className="text-gray-600">{place.description}</p>
          </div>

          {/* Address */}
          {place.address && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Dirección</h3>
              <p className="text-gray-600">{place.address}</p>
            </div>
          )}

          {/* Contact Info */}
          {(place.phoneNumber || place.website) && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Contacto</h3>
              <div className="space-y-2">
                {place.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">📞</span>
                    <a
                      href={`tel:${place.phoneNumber}`}
                      className="text-blue-600 hover:underline"
                    >
                      {place.phoneNumber}
                    </a>
                  </div>
                )}
                {place.website && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">🌐</span>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Sitio web
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Ubicación</h3>
            <p className="text-gray-600 text-sm">
              Lat: {place.latitude.toFixed(6)}, Lng: {place.longitude.toFixed(6)}
            </p>
          </div>

          {/* Dates */}
          <div className="text-sm text-gray-500">
            <p>Creado: {formatDate(place.createdAt)}</p>
            {place.updatedAt !== place.createdAt && (
              <p>Actualizado: {formatDate(place.updatedAt)}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex space-x-3">
          <button
            onClick={openInGoogleMaps}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver en Google Maps
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
