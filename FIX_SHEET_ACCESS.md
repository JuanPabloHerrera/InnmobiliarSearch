# 🔒 Fix: Google Sheet Access Issue

## Problem
Your import is failing because the Google Sheet is not publicly accessible. The API is getting a login page instead of your data.

## Solution: Make Sheet Public

### Step-by-Step Instructions

1. **Open your Google Sheet:**
   https://docs.google.com/spreadsheets/d/1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE/edit

2. **Click the "Share" button** (top right corner)

3. **Under "General access"**, change from:
   - ❌ "Restricted" (only people with access can open)
   
   To:
   - ✅ "Anyone with the link" (Viewer)

4. **Select "Viewer" role** (not Editor)

5. **Click "Done"**

6. **Verify it worked** by opening this URL in an incognito/private browser window:
   ```
   https://docs.google.com/spreadsheets/d/1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE/export?format=csv&gid=0
   ```
   
   You should see CSV data (tab-separated values), NOT a login page.

## After Making Public

1. Go back to: http://localhost:3000/admin
2. Click "Sincronizar Ahora" again
3. Import should now work! ✅

---

## Security Note

Making the sheet public means anyone with the link can VIEW (not edit) your data. If you have sensitive information:

- Remove sensitive columns before making public
- Use a separate sheet for public data
- Or implement Google OAuth (more complex)

For real estate listings, public viewing is usually fine since they're meant to be advertised.

