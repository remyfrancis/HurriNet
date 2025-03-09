import { getAuthToken } from './auth-client';

// Define the types of messages that can be received from the WebSocket
export interface IncidentWebSocketMessage {
  type: 'incident_update' | 'incident_create' | 'incident_resolve' | 'incident_flag' | 'ping' | 'pong';
  data: any;
}

/**
 * WebSocket client for handling real-time incident updates
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message queueing when disconnected
 * - Ping/pong heartbeat to detect connection issues
 * - Subscription-based message handling
 */
export class IncidentWebSocket {
  private ws: WebSocket | null = null;                    // WebSocket instance
  private reconnectAttempts = 0;                         // Number of reconnection attempts
  private readonly MAX_RECONNECT_ATTEMPTS = 5;           // Maximum number of reconnection attempts
  private readonly INITIAL_RETRY_DELAY = 1000;           // Initial delay between reconnection attempts (1 second)
  private isConnecting = false;                          // Flag to prevent multiple simultaneous connections
  private messageQueue: string[] = [];                   // Queue for messages when disconnected
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();  // Message handlers by type
  private pingInterval: NodeJS.Timeout | null = null;    // Interval for sending ping messages
  private lastPongTime: number = Date.now();            // Timestamp of last received pong

  constructor(private url: string) {
    this.connect();
    this.setupPingPong();
  }

  /**
   * Sets up ping/pong heartbeat mechanism
   * - Sends ping every 30 seconds
   * - Checks for pong response within 45 seconds
   * - Initiates reconnection if no pong received
   */
  private setupPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
        
        // Check if we haven't received a pong in 45 seconds
        if (Date.now() - this.lastPongTime > 45000) {
          console.warn('No pong received, reconnecting...');
          this.reconnect();
        }
      }
    }, 30000);
  }

  /**
   * Establishes WebSocket connection
   * - Retrieves authentication token
   * - Converts HTTP URL to WebSocket URL
   * - Sets up event handlers
   * @returns WebSocket instance or null if connection fails
   */
  private connect(): WebSocket | null {
    if (this.isConnecting) {
      console.log('Connection already in progress');
      return null;
    }

    this.isConnecting = true;
    const token = getAuthToken();
    
    if (!token) {
      console.error('No authentication token available');
      this.isConnecting = false;
      return null;
    }

    try {
      // Convert http to ws protocol and construct URL
      const wsUrl = this.url.replace(/^http/, 'ws');
      const fullUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;
      
      console.log('Connecting to WebSocket:', fullUrl);
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

      return this.ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      return null;
    }
  }

  /**
   * Handles successful WebSocket connection
   * - Resets connection flags
   * - Sends any queued messages
   */
  private handleOpen() {
    console.log('WebSocket connected successfully');
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Send any queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
  }

  /**
   * Handles WebSocket connection closure
   * - Implements exponential backoff for reconnection
   * - Limits maximum reconnection attempts
   */
  private handleClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnecting = false;
    this.ws = null;

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, this.reconnectAttempts);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Handles WebSocket errors
   * - Initiates reconnection if connection is closed
   */
  private handleError(event: Event) {
    console.error('WebSocket error occurred:', event);
    if (this.ws?.readyState === WebSocket.CLOSED) {
      this.reconnect();
    }
  }

  /**
   * Processes incoming WebSocket messages
   * - Handles ping/pong heartbeat
   * - Routes messages to appropriate handlers
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message: IncidentWebSocketMessage & { type: string } = JSON.parse(event.data);
      
      // Handle pong messages
      if (message.type === 'pong') {
        this.lastPongTime = Date.now();
        return;
      }

      // Handle regular messages
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Initiates reconnection process
   * - Closes existing connection
   * - Starts new connection
   */
  private reconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connect();
  }

  /**
   * Sends a message through the WebSocket
   * - Queues message if connection is not open
   * - Initiates connection if not already connecting
   */
  public send(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      if (!this.isConnecting) {
        this.connect();
      }
    }
  }

  /**
   * Subscribes to a specific message type
   * @param type Message type to subscribe to
   * @param handler Function to handle messages of this type
   */
  public subscribe(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  /**
   * Unsubscribes from a specific message type
   * @param type Message type to unsubscribe from
   * @param handler Handler function to remove
   */
  public unsubscribe(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Cleans up WebSocket connection and resources
   * - Clears ping interval
   * - Closes connection
   * - Clears message handlers and queue
   */
  public disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.isConnecting = false;
  }

  /**
   * Returns current connection state
   * @returns String representation of WebSocket state
   */
  public getState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
} 