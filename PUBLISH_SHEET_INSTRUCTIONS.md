# 📤 How to Publish Your Google Sheet for API Access

## The Issue

Your sheet is **shared** but not **published**. These are different:

- **Share:** Allows people to view/edit via browser (requires Google account context)
- **Publish to Web:** Makes raw data accessible to APIs without authentication ✅

## Solution: Publish to Web

### Step-by-Step Instructions

1. **Open your Google Sheet:**
   https://docs.google.com/spreadsheets/d/1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE/edit

2. **Go to File → Share → Publish to web**

3. **In the dialog that opens:**
   - **Link:** Select "Entire document" (or specific sheet if you prefer)
   - **Embed:** Choose "Web page" or "Comma-separated values (.csv)"
   - Click **"Publish"**

4. **Confirm** when it asks "Are you sure you want to publish this selection?"

5. **Click "OK"** - You'll get a URL, but we'll use the programmatic one

### Verify It Works

After publishing, test this URL in your browser:
```
https://docs.google.com/spreadsheets/d/1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE/export?format=csv&gid=0
```

**You should see:** Plain text data (tab-separated values)  
**NOT:** An HTML login page

### Then Try Import Again

1. Go to http://localhost:3000/admin
2. Click "Sincronizar Ahora"
3. It should work now! 🎉

---

## Alternative: Use Google Sheets API

If you don't want to publish the sheet publicly, we can implement Google OAuth and use the Google Sheets API instead. This is more secure but more complex to set up.

Let me know if you'd prefer this approach!

