import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatUrl, message, sessionId, action } = body

    console.log('📨 N8n Chat Request:', { message, sessionId, action })

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    if (!chatUrl) {
      return NextResponse.json(
        { error: 'Chat URL not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 Sending to n8n chat:', chatUrl)

    // Send message to n8n chat webhook
    const response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action || 'sendMessage',
        sessionId: sessionId,
        chatInput: message,
      }),
    })

    console.log('📡 n8n response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ n8n chat error:', response.status, errorText)
      throw new Error(`n8n chat error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ n8n response:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in n8n chat API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

