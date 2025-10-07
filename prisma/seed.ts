import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Crear lugares de ejemplo en Ciudad de México
  const places = [
    {
      name: 'Museo Frida Kahlo',
      description: 'La Casa Azul donde vivió la famosa pintora mexicana Frida Kahlo. Un museo dedicado a su vida y obra.',
      latitude: 19.3554,
      longitude: -99.1625,
      category: 'Museo',
      address: 'Londres 247, Del Carmen, Coyoacán, 04100 Ciudad de México, CDMX',
      rating: 4.6,
      website: 'https://www.museofridakahlo.org.mx/',
      phoneNumber: '+52 55 5554 5999'
    },
    {
      name: 'Mercado de San Juan',
      description: 'Mercado gourmet famoso por sus ingredientes exóticos y alta calidad. Un paraíso para los amantes de la gastronomía.',
      latitude: 19.4267,
      longitude: -99.1419,
      category: 'Tienda',
      address: 'Ernesto Pugibet 21, Centro Histórico, 06000 Ciudad de México, CDMX',
      rating: 4.3,
      phoneNumber: '+52 55 5512 0575'
    },
    {
      name: 'Parque México',
      description: 'Hermoso parque en el corazón de la Condesa con arquitectura art déco y ambiente bohemio.',
      latitude: 19.4110,
      longitude: -99.1696,
      category: 'Parque',
      address: 'Av. México, Hipódromo Condesa, 06100 Ciudad de México, CDMX',
      rating: 4.4
    },
    {
      name: 'Azul Histórico',
      description: 'Restaurante de alta cocina mexicana ubicado en un hermoso patio colonial en el Centro Histórico.',
      latitude: 19.4285,
      longitude: -99.1332,
      category: 'Restaurante',
      address: 'Isabel la Católica 30, Centro Histórico, 06000 Ciudad de México, CDMX',
      rating: 4.5,
      website: 'https://azulhistorico.com/',
      phoneNumber: '+52 55 5510 1316'
    },
    {
      name: 'Roma Norte',
      description: 'Barrio trendy conocido por sus cafeterías, galerías de arte, boutiques y vida nocturna vibrante.',
      latitude: 19.4145,
      longitude: -99.1565,
      category: 'Entretenimiento',
      address: 'Roma Norte, Ciudad de México, CDMX',
      rating: 4.7
    }
  ]

  for (const place of places) {
    const created = await prisma.place.create({
      data: place
    })
    console.log(`✅ Created place: ${created.name}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
