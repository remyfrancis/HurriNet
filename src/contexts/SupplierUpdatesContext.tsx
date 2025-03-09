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
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

const SupplierUpdatesContext = createContext<SupplierUpdatesContextType | undefined>(undefined)

export function SupplierUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<SupplierUpdate[]>([])
  const [lastUpdate, setLastUpdate] = useState<SupplierUpdate | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setConnectionStatus('disconnected');
          return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        // Add token as a query parameter
        ws = new WebSocket(`${wsUrl}/ws/incidents/?token=${token}`);
        setConnectionStatus('connecting');

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);
            setUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50 updates
            setLastUpdate(update);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          // Try to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionStatus('disconnected');
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <SupplierUpdatesContext.Provider value={{ updates, lastUpdate, connectionStatus }}>
      {children}
    </SupplierUpdatesContext.Provider>
  );
}

export const useSupplierUpdates = () => {
  const context = useContext(SupplierUpdatesContext)
  if (context === undefined) {
    throw new Error('useSupplierUpdates must be used within a SupplierUpdatesProvider')
  }
  return context
}