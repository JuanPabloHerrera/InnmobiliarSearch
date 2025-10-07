import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdatePlaceData } from '@/types/place'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const place = await prisma.place.findUnique({
      where: {
        id: params.id
      }
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Lugar no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(place)
  } catch (error) {
    console.error('Error fetching place:', error)
    return NextResponse.json(
      { error: 'Error al obtener el lugar' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data: Omit<UpdatePlaceData, 'id'> = body

    const place = await prisma.place.update({
      where: {
        id: params.id
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(place)
  } catch (error) {
    console.error('Error updating place:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lugar' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.place.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting place:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lugar' },
      { status: 500 }
    )
  }
}
