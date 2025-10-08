# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your real estate map is ready to use! Here's what has been set up:

### What We Built

1. ✅ **Property Database Model** - SQLite database with property table
2. ✅ **Google Sheets Import API** - `/api/import/sheets`
3. ✅ **Properties API** - `/api/properties`
4. ✅ **Property Map Component** - Interactive map with real estate markers
5. ✅ **Admin Panel** - `/admin` page for managing imports
6. ✅ **Auto Geocoding** - Converts addresses to GPS coordinates
7. ✅ **Daily Auto-Sync** - Vercel cron job (when deployed)

---

## 🎯 Next Steps

### 1. Make Your Google Sheet Public

Your sheet: https://docs.google.com/spreadsheets/d/1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE/edit

**Steps:**
1. Open the sheet
2. Click **Share** (top right)
3. Change to **"Anyone with the link"** → **"Viewer"**
4. Save

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Import Your First Properties

1. Go to: http://localhost:3000/admin
2. Click **"Sincronizar Ahora"** (Sync Now)
3. Wait for the import to complete
4. Go back to: http://localhost:3000
5. See your properties on the map! 🗺️

---

## 📊 Expected Sheet Format

Your Google Sheet should have these columns (tab-separated):

```
Calle | Colonia | Alcaldía | Precio | M2 | Recámaras | Baños | Estacionamientos | Amenidades | Descripción | URL | Mantenimiento | Inmobiliaria
```

**Required:**
- `Calle` (Street address)
- `Colonia` (Neighborhood)
- `Alcaldía` (Borough/Municipality)

All other columns are optional but will be displayed on the map.

---

## 🗺️ Using the App

### Main Map (`/`)
- View all properties on an interactive map
- Click markers to see property details
- Use the location button to find your current location
- Access admin panel via the gear icon (top right)

### Admin Panel (`/admin`)
- Sync properties from Google Sheet
- View import statistics
- See error logs
- Link to edit your Google Sheet

---

## ⚙️ How It Works

1. **Import Triggered** (Manual or automatic via cron)
2. **Fetch Data** - Downloads CSV from your public Google Sheet
3. **Parse Rows** - Extracts property information
4. **Geocode** - Converts each address to GPS coordinates using Google Maps API
   - Example: "Insurgentes Sur 1234, Del Valle, Benito Juárez, Ciudad de México, México"
5. **Save to Database** - Stores in SQLite with lat/lng
6. **Display** - Map fetches properties and shows markers

---

## 🔧 Configuration Files

### Environment Variables (`.env.local`)
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key-here"
GOOGLE_SHEET_ID="1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE"
GOOGLE_SHEET_GID="0"
```

### Cron Job (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/import/sheets",
    "schedule": "0 2 * * *"  // Daily at 2 AM UTC
  }]
}
```

---

## 🚨 Troubleshooting

### Import Fails
- ✅ Check that Google Sheet is public
- ✅ Verify sheet has required columns: `Calle`, `Colonia`, `Alcaldía`
- ✅ Check browser console for errors

### No Markers on Map
- ✅ Run import first via `/admin`
- ✅ Check that properties have valid addresses
- ✅ Look for geocoding errors in import results

### Geocoding Errors
- ✅ Ensure addresses are complete and valid
- ✅ Check Google Maps API key has Geocoding API enabled
- ✅ Verify you're within API quota (2,500 free requests/day)

---

## 📈 API Rate Limits

**Google Geocoding API:**
- Free tier: 2,500 requests/day
- The import has built-in delays (100ms between requests)
- For 100 properties = ~10 seconds
- For 500 properties = ~50 seconds

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Real estate map ready for production"
git push origin main

# 2. Deploy on Vercel
# - Connect your GitHub repo
# - Add environment variables
# - Deploy!
```

### Option 2: Other Platforms

Works on any Node.js hosting platform:
- Netlify
- Railway
- Render
- DigitalOcean

**Note:** For production with many properties, consider upgrading to PostgreSQL instead of SQLite.

---

## 📚 Documentation

See `SETUP_GUIDE.md` for comprehensive documentation.

---

## 🎉 You're All Set!

Start your development server and import your first properties:

```bash
npm run dev
```

Then visit:
- **Main Map:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin

Happy mapping! 🏠🗺️

