'use client'

import { NoCallbackMapContainer } from '@/components/NoCallbackMapContainer'
import { N8nChat } from '@/components/N8nChat'
import { useState } from 'react'

export default function Home() {
  const [refreshPlaces] = useState(0)

  return (
    <main className="h-screen relative overflow-hidden">
      {/* Full Screen Map - extends to bottom */}
      <div className="absolute inset-0">
        <NoCallbackMapContainer refreshTrigger={refreshPlaces} showSidebar={false} />
      </div>

      {/* N8n Chat with Input Bar - floats on top */}
      <N8nChat chatUrl="https://jpinnmobiliar.app.n8n.cloud/webhook/499666c3-d807-4bb7-8195-43932f64a91f/chat" />
    </main>
  )
}
