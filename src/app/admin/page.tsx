'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ImportResults {
  total: number
  success: number
  failed: number
  skipped: number
  errors: string[]
}

export default function AdminPage() {
  const [isImporting, setIsImporting] = useState(false)
  const [results, setResults] = useState<ImportResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/import/sheets', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
      } else {
        // Format error message with details if available
        let errorMsg = data.error || 'Error al importar'
        if (data.details) {
          errorMsg = `${errorMsg}\n\n${data.details}`
        }
        if (data.helpUrl) {
          errorMsg += `\n\nMás información: ${data.helpUrl}`
        }
        setError(errorMsg)
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al mapa
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Sincroniza propiedades desde Google Sheets
          </p>
        </div>

        {/* Sync Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sincronizar Propiedades
              </h2>
              <p className="text-gray-600">
                Importa las propiedades más recientes desde tu Google Sheet
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="
                px-6 py-3 
                bg-blue-600 hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed
                text-white font-semibold rounded-lg
                transition-all duration-200
                shadow-md hover:shadow-lg
                flex items-center gap-2
              "
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar Ahora
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Cómo funciona:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las propiedades se importan desde tu Google Sheet</li>
                  <li>Las direcciones se convierten automáticamente a coordenadas GPS</li>
                  <li>Los datos existentes se reemplazan completamente</li>
                  <li>El proceso puede tardar varios minutos dependiendo de la cantidad de propiedades</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-900">
                  Importación Completada
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{results.success}</p>
                  <p className="text-sm text-gray-600">Exitosas</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                  <p className="text-sm text-gray-600">Fallidas</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{results.skipped}</p>
                  <p className="text-sm text-gray-600">Omitidas</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <p className="font-semibold text-red-900 mb-2">Errores:</p>
                  <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                    <ul className="text-sm text-red-800 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-800 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Google Sheet Link */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Google Sheet de Origen
          </h3>
          <a
            href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '1hPB1MWFJlf9H_tDLAKS5UdJLiAwWCwxmqtHsQ7woSnE'}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Abrir Google Sheet
          </a>
        </div>
      </div>
    </div>
  )
}

