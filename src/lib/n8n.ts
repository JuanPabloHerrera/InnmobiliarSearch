// Configuration for n8n chatbot integration
export interface N8nConfig {
  webhookUrl: string
  apiKey?: string
}

// Message types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface N8nResponse {
  message: string
  data?: any
}

/**
 * Send a message to the n8n chatbot webhook
 * @param message - The user's message
 * @param config - n8n configuration (webhook URL and optional API key)
 * @returns The chatbot's response
 */
export async function sendMessageToN8n(
  message: string,
  config: N8nConfig
): Promise<N8nResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add API key if provided
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      message: data.message || data.output || data.response || 'No response',
      data: data,
    }
  } catch (error) {
    console.error('Error calling n8n webhook:', error)
    throw error
  }
}

/**
 * Get n8n configuration from environment variables
 */
export function getN8nConfig(): N8nConfig {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
  const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL environment variable is not set')
  }

  return {
    webhookUrl,
    apiKey,
  }
}

