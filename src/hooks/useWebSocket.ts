import { useEffect, useRef, useState } from 'react'

interface WebSocketHook {
  lastMessage: MessageEvent | null
  sendMessage: (message: string | object) => void
  readyState: number
}

export function useWebSocket(url: string): WebSocketHook {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket Connected')
        setReadyState(WebSocket.OPEN)
      }

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected')
        setReadyState(WebSocket.CLOSED)
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error)
      }

      ws.current.onmessage = (message) => {
        setLastMessage(message)
      }
    }

    connect()

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  const sendMessage = (message: string | object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === 'string' ? message : JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  return {
    lastMessage,
    sendMessage,
    readyState
  }
} 