export interface Place {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  category: string
  imageUrl?: string
  rating?: number
  address?: string
  website?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePlaceData {
  name: string
  description: string
  latitude: number
  longitude: number
  category: string
  imageUrl?: string
  rating?: number
  address?: string
  website?: string
  phoneNumber?: string
}

export interface UpdatePlaceData extends Partial<CreatePlaceData> {
  id: string
}

export const PLACE_CATEGORIES = [
  'Restaurante',
  'Café',
  'Parque',
  'Museo',
  'Tienda',
  'Hotel',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Servicios',
  'Otro'
] as const

export type PlaceCategory = typeof PLACE_CATEGORIES[number]
