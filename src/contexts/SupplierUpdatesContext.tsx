'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SupplierUpdate = {
  id: string
  supplier: string
  item: string
  status: 'pending' | 'shipped' | 'delivered'
  timestamp: string
  message: string
}

interface SupplierUpdatesContextType {
  updates: SupplierUpdate[]
  lastUpdate: SupplierUpdate | null
}

const SupplierUpdatesContext = createContext<SupplierUpdatesContextType | undefined>(undefined)

export function SupplierUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<SupplierUpdate[]>([])
  const [lastUpdate, setLastUpdate] = useState<SupplierUpdate | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/supplier-updates/`)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setUpdates(prev => [update, ...prev].slice(0, 50)) // Keep last 50 updates
      setLastUpdate(update)
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <SupplierUpdatesContext.Provider value={{ updates, lastUpdate }}>
      {children}
    </SupplierUpdatesContext.Provider>
  )
}

export const useSupplierUpdates = () => {
  const context = useContext(SupplierUpdatesContext)
  if (context === undefined) {
    throw new Error('useSupplierUpdates must be used within a SupplierUpdatesProvider')
  }
  return context
}