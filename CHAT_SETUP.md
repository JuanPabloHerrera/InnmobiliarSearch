# Chat Integration Setup

## Overview
The chat input bar at the bottom of the app is connected to your n8n chatbot through a secure backend API route. This avoids CORS issues and keeps your webhook URL secure.

## Architecture

The chat system uses a secure backend API route to communicate with n8n:

1. **User sends message** → Frontend (`ChatInput` component)
2. **POST to `/api/chat`** → Backend API route (`src/app/api/chat/route.ts`)
3. **API route forwards** → n8n webhook
4. **n8n processes** → Returns response
5. **Backend forwards** → Frontend
6. **Display in chat** → `ChatWindow` component

This architecture:
- ✅ Avoids CORS issues
- ✅ Keeps webhook URL secure (server-side only)
- ✅ Allows for additional processing/validation
- ✅ Can add rate limiting if needed

## Configuration

### 1. Set up Environment Variables

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
NEXT_PUBLIC_N8N_API_KEY=your-api-key-here  # Optional
```

Note: Even though it starts with `NEXT_PUBLIC_`, the webhook is only called from the backend API route, not directly from the browser.

### 2. n8n Webhook Setup

Your n8n webhook should:

1. **Accept POST requests** with the following JSON structure:
   ```json
   {
     "message": "user's message here",
     "timestamp": "2025-10-07T12:00:00.000Z"
   }
   ```

2. **Return a JSON response** in one of these formats:
   
   **Simple text response:**
   ```json
   {
     "message": "response from chatbot"
   }
   ```
   
   Or:
   ```json
   {
     "output": "response from chatbot"
   }
   ```
   
   Or:
   ```json
   {
     "response": "response from chatbot"
   }
   ```

   **Response with property listings (optional):**
   ```json
   {
     "message": "I've found several options for you in Condesa, Mexico City, with 2 bedroom, for rent, here are the results.",
     "properties": [
       {
         "price": "$1,850/mo",
         "title": "Modern Downtown Apartment",
         "details": "2 bed • 2 bath • 1,200 sq ft",
         "location": "Downtown District, City Center",
         "type": "For Rent",
         "image": "https://example.com/image.jpg"
       },
       {
         "price": "$450,000",
         "title": "Family House with Garden",
         "details": "3 bed • 2 bath • 1,600 sq ft",
         "location": "Suburban Area, Green Valley",
         "type": "For Sale",
         "image": "https://example.com/image2.jpg"
       }
     ]
   }
   ```

### 3. Example n8n Workflow

Here's a basic n8n workflow structure:

1. **Webhook Node** - Receives the POST request
   - Method: POST
   - Path: `/webhook/homa-chat` (or your custom path)
   - Response Mode: "Using 'Respond to Webhook' Node"

2. **Function/AI Node** - Process the message
   - Extract the message: `{{ $json.body.message }}`
   - Use OpenAI, Google AI, or any LLM to process the request
   - Format the response with property data if needed

3. **Respond to Webhook** - Send back the response
   - Response Body:
   ```json
   {
     "message": "{{ $json.response }}",
     "properties": [
       {
         "price": "$1,850/mo",
         "title": "Modern Apartment",
         "details": "2 bed • 2 bath • 1,200 sq ft",
         "location": "City Center",
         "type": "For Rent",
         "image": "https://example.com/image.jpg"
       }
     ]
   }
   ```

**Quick Start Workflow (Simple Echo Bot):**
1. Webhook (POST)
2. Respond to Webhook with:
   ```json
   {
     "message": "You said: {{ $json.body.message }}"
   }
   ```

## Features

- ✅ Fixed bottom input bar with transparent/blur background
- ✅ Conversation window that appears when sending messages
- ✅ Beautiful chat bubbles (user messages in blue, assistant in white)
- ✅ Property card display support (images, prices, details, locations)
- ✅ Search icon on the left
- ✅ Send button appears when typing
- ✅ Loading state with animated dots
- ✅ Auto-scroll to latest messages
- ✅ Timestamp display for each message
- ✅ Mobile responsive design
- ✅ Configurable placeholder text
- ✅ Close button to minimize chat window

## Customization

### Change Placeholder Text

Edit the `ChatInput` component in `page.tsx`:

```tsx
<ChatInput 
  onSendMessage={handleChatMessage}
  placeholder="Your custom placeholder here"
/>
```

### Customize Chat Window Appearance

Edit the `ChatWindow` component (`src/components/ChatWindow.tsx`) to:

- Change the assistant avatar (currently shows "H")
- Modify colors and styles
- Adjust the window size and position
- Customize the property card layout

### Customize Bot Name and Description

In `ChatWindow.tsx`, update the header:

```tsx
<h3 className="font-semibold text-gray-800">Your Bot Name</h3>
<p className="text-xs text-gray-500">Your Description</p>
```

### Add Custom Data Rendering

The chat window supports custom data rendering. In your n8n response, you can include any additional data structure and handle it in the `ChatWindow` component.

## Testing

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Open your browser and you should see the chat input bar at the bottom

3. Type a message and press send:
   - The conversation window will appear automatically
   - Your message appears on the right in blue
   - The bot's response appears on the left in white
   - If your n8n response includes property data, property cards will be displayed
   - You can close the chat window by clicking the X button
   - The conversation persists even when the window is closed

## Troubleshooting

- **"Chat is not configured yet" message in chat**: Make sure you've set `NEXT_PUBLIC_N8N_WEBHOOK_URL` in your `.env.local` file and restart your dev server
- **CORS errors**: Should no longer occur since we're using a backend API route. If you see CORS errors, make sure you're on the latest code
- **500 errors**: Check the server console (terminal) for detailed error messages from the API route
- **No response**: Verify your n8n workflow is returning data in the expected format (see webhook setup above)
- **Property cards not showing**: Ensure your n8n response includes a `properties` array with the correct structure
- **Chat window not appearing**: Check browser console for errors and verify the message was sent successfully
- **API route errors**: Check terminal logs for detailed error messages from `/api/chat`

## Next Steps

Consider adding:
- [x] Chat history display ✅
- [x] Message bubbles UI ✅
- [x] Typing indicators ✅
- [x] Error messages display ✅
- [ ] Session management (save conversations to database)
- [ ] Message persistence (localStorage for offline access)
- [ ] Voice input support
- [ ] File/image sharing
- [ ] Quick reply buttons
- [ ] Chat export functionality

