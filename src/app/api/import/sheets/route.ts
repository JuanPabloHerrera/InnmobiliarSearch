import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PropertyRow {
  Calle: string
  Colonia: string
  Alcaldía: string
  Precio?: string
  M2?: string
  Recámaras?: string
  Baños?: string
  Estacionamientos?: string
  Amenidades?: string
  Descripción?: string
  URL?: string
  Mantenimiento?: string
  Inmobiliaria?: string
}

interface GeocodeResult {
  latitude: number
  longitude: number
  formattedAddress: string
}

// Geocode address using Google Maps Geocoding API
async function geocodeAddress(calle: string, colonia: string, alcaldia: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error('Google Maps API key not configured')
    return null
  }

  // Build full address for Mexico City
  const fullAddress = `${calle}, ${colonia}, ${alcaldia}, Ciudad de México, México`
  const encodedAddress = encodeURIComponent(fullAddress)
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      }
    } else {
      console.warn(`Geocoding failed for: ${fullAddress}. Status: ${data.status}`)
      return null
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Parse CSV text into array of objects
function parseCSV(csvText: string): PropertyRow[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Get headers from first line (comma-separated)
  const headers = lines[0].split(',').map(h => h.trim())
  
  // Parse data rows
  const properties: PropertyRow[] = []
  for (let i = 1; i < lines.length; i++) {
    // Handle CSV with potential commas in quoted fields
    const values = parseCSVLine(lines[i])
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ''
    })
    
    // Only add if we have required fields
    if (row.Calle && row.Colonia && row.Alcaldía) {
      properties.push(row as PropertyRow)
    }
  }
  
  return properties
}

// Parse a CSV line handling quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

// Add delay to respect API rate limits
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  try {
    // Use the published URL if available, otherwise fall back to sheet ID
    const publishedUrl = process.env.GOOGLE_SHEET_PUBLISHED_URL
    const sheetId = process.env.GOOGLE_SHEET_ID
    const gid = process.env.GOOGLE_SHEET_GID || '0'

    let csvUrl: string
    
    if (publishedUrl) {
      csvUrl = publishedUrl
    } else if (sheetId) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    } else {
      return NextResponse.json(
        { error: 'Google Sheet URL not configured' },
        { status: 500 }
      )
    }

    console.log('Fetching from:', csvUrl)
    
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`)
    }

    const csvText = await response.text()
    
    // Check if we got HTML instead of CSV (means sheet is not public)
    if (csvText.trim().startsWith('<!DOCTYPE html') || csvText.trim().startsWith('<html')) {
      return NextResponse.json(
        { 
          error: 'Google Sheet is not public',
          details: 'The sheet returned an HTML page instead of CSV data. Please make your Google Sheet public:\n1. Open your sheet\n2. Click Share (top right)\n3. Change to "Anyone with the link" → "Viewer"\n4. Try importing again',
          helpUrl: 'https://support.google.com/drive/answer/2494822'
        },
        { status: 403 }
      )
    }

    const properties = parseCSV(csvText)
    
    console.log(`Parsed ${properties.length} properties from sheet`)

    // Process each property
    const results = {
      total: properties.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Full replace strategy: delete all existing properties first
    await prisma.property.deleteMany({})
    console.log('Cleared existing properties')

    for (const [index, prop] of properties.entries()) {
      try {
        // Skip if missing required fields
        if (!prop.Calle || !prop.Colonia || !prop.Alcaldía) {
          results.skipped++
          continue
        }

        console.log(`Processing ${index + 1}/${properties.length}: ${prop.Calle}, ${prop.Colonia}`)

        // Geocode the address
        const geocodeResult = await geocodeAddress(prop.Calle, prop.Colonia, prop.Alcaldía)
        
        if (!geocodeResult) {
          results.failed++
          results.errors.push(`Failed to geocode: ${prop.Calle}, ${prop.Colonia}`)
          continue
        }

        // Create property in database
        await prisma.property.create({
          data: {
            calle: prop.Calle,
            colonia: prop.Colonia,
            alcaldia: prop.Alcaldía,
            precio: prop.Precio || null,
            m2: prop.M2 || null,
            recamaras: prop.Recámaras || null,
            banos: prop.Baños || null,
            estacionamientos: prop.Estacionamientos || null,
            amenidades: prop.Amenidades || null,
            descripcion: prop.Descripción || null,
            url: prop.URL || null,
            mantenimiento: prop.Mantenimiento || null,
            inmobiliaria: prop.Inmobiliaria || null,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
            fullAddress: geocodeResult.formattedAddress
          }
        })

        results.success++

        // Add delay to respect Google API rate limits (50 requests per second)
        // We'll do 10 per second to be safe
        await delay(100)

      } catch (error: any) {
        results.failed++
        results.errors.push(`Error processing ${prop.Calle}: ${error.message}`)
        console.error(`Error processing property:`, error)
      }
    }

    console.log('Import completed:', results)

    return NextResponse.json({
      message: 'Import completed',
      results
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Support POST for manual triggers from admin UI
  return GET(request)
}

