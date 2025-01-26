"use client"

import React, { useState, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error, 
  resetErrorBoundary: () => void 
}) {
  useEffect(() => {
    console.error('Caught error:', error);
  }, [error]);

  return (
    <div role="alert" className="p-4 bg-red-100 text-red-800 rounded-lg">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}

function BuggyComponent() {
  return (
    <div>
      <h1>Component Stability Test</h1>
      <p>This component is now stable and will not throw errors.</p>
    </div>
  )
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setBackendStatus(data.status || 'Connected')
        setError(null)
      } catch (error) {
        console.error('Backend check failed:', error)
        setBackendStatus('Backend not reachable')
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    checkBackendStatus()
    const intervalId = setInterval(checkBackendStatus, 30000) // Recheck every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        console.log('Error boundary reset')
      }}
    >
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <h1 className="text-4xl font-bold text-center">
            SMPC EigenLayer
          </h1>
          <p className="mt-4 text-center text-lg">
            Secure Multi-Party Computation Platform
          </p>
          <div className="mt-4 text-center">
            <p>Backend Status: {backendStatus}</p>
            {error && (
              <div className="text-red-500 mt-2">
                Error: {error}
              </div>
            )}
          </div>
        </div>
        <BuggyComponent />
      </main>
    </ErrorBoundary>
  )
}

