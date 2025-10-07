import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreatePlaceData } from '@/types/place'

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(places)
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json(
      { error: 'Error al obtener los lugares' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data: CreatePlaceData = body

    // Validación básica
    if (!data.name || !data.description || !data.latitude || !data.longitude || !data.category) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const place = await prisma.place.create({
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        imageUrl: data.imageUrl,
        rating: data.rating,
        address: data.address,
        website: data.website,
        phoneNumber: data.phoneNumber,
      }
    })

    return NextResponse.json(place, { status: 201 })
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json(
      { error: 'Error al crear el lugar' },
      { status: 500 }
    )
  }
}
