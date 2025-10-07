'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface N8nChatProps {
  chatUrl: string
}

export function N8nChat({ chatUrl }: N8nChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate session ID on mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Hi there! 👋 How can I help you find your perfect place?',
        sender: 'bot',
        timestamp: new Date()
      }])
    }
  }, [isOpen, messages.length])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    // Open chat window when sending first message
    if (!isOpen) {
      setIsOpen(true)
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/n8n-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatUrl,
          message: text.trim(),
          sessionId,
          action: 'sendMessage'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.output || data.message || 'I received your message.',
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <>
      {/* Chat Window - appears above input bar */}
      {isOpen && (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-40 h-[500px] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Minimalist Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-black" style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.01em'
              }}>Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    letterSpacing: '-0.01em'
                  }}>{message.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Always-visible Input Bar at Bottom - transparent, floating on map */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 px-4 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg px-5 py-3 hover:shadow-xl transition-shadow">
              {/* Search Icon */}
              <svg 
                className="w-5 h-5 text-gray-400 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>

              {/* Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Where are you looking for rent or buy?"
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none text-black placeholder-gray-400 disabled:opacity-50"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              />

              {/* Send Button - only shows when there's text */}
              {inputValue.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-shrink-0 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
