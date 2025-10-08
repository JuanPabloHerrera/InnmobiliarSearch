# 🏠 Homa - Real Estate Map Setup Guide

## Overview
Homa is a real estate property mapping application that automatically syncs property listings from a Google Sheet and displays them on an interactive Google Maps interface with geocoding.

---

## 📋 Prerequisites

1. **Google Maps API Key** with the following APIs enabled:
   - Maps JavaScript API
   - Geocoding API
   - Places API

2. **PostgreSQL Database** (Vercel Postgres recommended for production)

3. **Public Google Sheet** with property data

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/homa?schema=public"

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# Google Sheets Integration
GOOGLE_SHEET_ID="1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE"
GOOGLE_SHEET_GID="0"

# n8n Chatbot (optional)
NEXT_PUBLIC_N8N_WEBHOOK_URL="your_n8n_webhook_url_here"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Or push schema directly
npx prisma db push
```

### 4. Make Your Google Sheet Public

1. Open your Google Sheet
2. Click **Share** (top right)
3. Change to **"Anyone with the link"** → **"Viewer"**
4. This allows the API to fetch data without authentication

### 5. Google Sheet Format

Your sheet should have these columns (tab-separated):

```
Calle | Colonia | Alcaldía | Precio | M2 | Recámaras | Baños | Estacionamientos | Amenidades | Descripción | URL | Mantenimiento | Inmobiliaria
```

**Required columns:**
- `Calle` (Street)
- `Colonia` (Neighborhood)
- `Alcaldía` (Borough)

**Optional columns:**
- `Precio` (Price)
- `M2` (Square meters)
- `Recámaras` (Bedrooms)
- `Baños` (Bathrooms)
- `Estacionamientos` (Parking spots)
- `Amenidades` (Amenities)
- `Descripción` (Description)
- `URL` (Property link)
- `Mantenimiento` (Maintenance fee)
- `Inmobiliaria` (Real estate agency)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔄 Syncing Properties

### Manual Sync

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Click **"Sincronizar Ahora"** (Sync Now)
3. Wait for the import to complete (can take several minutes)
4. View the results summary

### Automatic Daily Sync (Production Only)

When deployed to Vercel:
- Automatic sync runs daily at **2:00 AM** (configurable in `vercel.json`)
- Uses Vercel Cron Jobs
- No manual intervention needed

To change the schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/import/sheets",
      "schedule": "0 2 * * *"  // Daily at 2 AM (UTC)
    }
  ]
}
```

Cron schedule format:
- `0 2 * * *` = 2:00 AM daily
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 1` = Every Monday at midnight

---

## 🗺️ How It Works

### Import Flow

```
Google Sheet → Fetch CSV → Parse Rows →
For each property:
  ├─ Combine: Calle + Colonia + Alcaldía + "Ciudad de México, México"
  ├─ Geocode via Google Maps API
  ├─ Extract latitude/longitude
  └─ Save to PostgreSQL
→ Display on map
```

### Geocoding
- Addresses are automatically converted to GPS coordinates
- Rate limited to ~10 requests/second to respect Google API limits
- Failed geocoding results are logged but don't stop the import

### Data Strategy
- **Full Replace**: Each sync deletes all existing properties and reimports
- Ensures data consistency with the Google Sheet
- Unique constraint: `calle + colonia + alcaldia` (prevents duplicates)

---

## 📦 API Endpoints

### Properties

**GET** `/api/properties`
- Returns all properties as JSON
- Used by the map to display markers

### Import

**GET/POST** `/api/import/sheets`
- Triggers import from Google Sheets
- Geocodes all addresses
- Returns import summary

**Response:**
```json
{
  "message": "Import completed",
  "results": {
    "total": 50,
    "success": 48,
    "failed": 2,
    "skipped": 0,
    "errors": [...]
  }
}
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main map page
│   ├── admin/page.tsx              # Admin sync page
│   └── api/
│       ├── properties/route.ts     # Properties API
│       └── import/sheets/route.ts  # Import API
├── components/
│   ├── PropertyMapContainer.tsx    # Real estate map
│   ├── NoCallbackMapContainer.tsx  # Original map (legacy)
│   └── N8nChat.tsx                 # Chat widget
└── types/
    └── place.ts                    # TypeScript types

prisma/
└── schema.prisma                   # Database schema
```

---

## 🔧 Troubleshooting

### Import Fails

**Issue:** "Google Sheet ID not configured"
- **Fix:** Add `GOOGLE_SHEET_ID` to `.env.local`

**Issue:** "Failed to fetch Google Sheet"
- **Fix:** Ensure sheet is set to "Anyone with the link" can view

**Issue:** Geocoding fails for all properties
- **Fix:** Check that Geocoding API is enabled in Google Cloud Console
- **Fix:** Verify API key has no restrictions blocking Geocoding API

### No Markers on Map

**Issue:** Map loads but no pins appear
- **Fix:** Run import first: go to `/admin` and sync
- **Fix:** Check browser console for API errors
- **Fix:** Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set

### Rate Limiting

**Issue:** "OVER_QUERY_LIMIT" errors during import
- **Fix:** Import has built-in delays (100ms between requests)
- **Fix:** For large datasets, consider increasing delay in `/api/import/sheets/route.ts`

---

## 🚀 Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Set up real estate map"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL` (use Vercel Postgres)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_GID`

### 3. Set Up Database

```bash
# In Vercel project settings, add Postgres
# Then run migrations
npx prisma migrate deploy
```

### 4. Enable Cron Jobs

- Cron jobs are automatically enabled via `vercel.json`
- View cron logs in Vercel Dashboard → Cron Jobs

---

## 💡 Customization

### Change Map Center/Zoom

Edit `PropertyMapContainer.tsx`:

```typescript
const mapInstance = new google.maps.Map(mapRef.current, {
  center: { lat: 19.4326, lng: -99.1332 }, // Change these
  zoom: 12, // Adjust zoom level
  ...
})
```

### Customize Marker Icon

Edit the marker creation in `PropertyMapContainer.tsx`:

```typescript
icon: {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg><!-- Your custom SVG --></svg>
  `),
  scaledSize: new google.maps.Size(36, 36),
}
```

### Change Info Window Design

Modify the `infoContent` variable in `PropertyMapContainer.tsx`.

---

## 📊 Monitoring

### View Import Logs

**Development:**
```bash
npm run dev
# Check terminal for logs during import
```

**Production (Vercel):**
1. Vercel Dashboard → Your Project
2. Functions tab → View logs
3. Filter by `/api/import/sheets`

### Database Queries

```bash
# View all properties
npx prisma studio

# Or direct SQL
psql $DATABASE_URL -c "SELECT COUNT(*) FROM properties;"
```

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs in Vercel
3. Verify Google Sheet is accessible
4. Confirm all environment variables are set

---

## 📝 License

ISC

