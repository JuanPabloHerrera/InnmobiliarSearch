import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    console.log('📨 Received chat message:', message)

    if (!message) {
      console.error('❌ No message provided')
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get n8n webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

    console.log('🔗 Webhook URL configured:', webhookUrl ? 'Yes' : 'No')

    if (!webhookUrl) {
      console.error('❌ Webhook URL not configured')
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 Sending to n8n:', webhookUrl)

    // Forward request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
      }),
    })

    console.log('📡 n8n response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ n8n webhook error:', response.status, errorText)
      throw new Error(`n8n webhook error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ n8n response data:', JSON.stringify(data, null, 2))

    // Return the response from n8n
    return NextResponse.json({
      message: data.message || data.output || data.response || 'No response',
      data: data,
    })
  } catch (error) {
    console.error('❌ Error in chat API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

