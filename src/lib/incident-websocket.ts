import { getAuthToken } from './auth-client';

export interface IncidentWebSocketMessage {
  type: 'incident_update' | 'incident_create' | 'incident_resolve' | 'incident_flag';
  data: any;
}

export class IncidentWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second
  private isConnecting = false;
  private messageQueue: string[] = [];
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime: number = Date.now();

  constructor(private url: string) {
    this.connect();
    this.setupPingPong();
  }

  private setupPingPong() {
    // Send ping every 30 seconds
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

  private handleError(event: Event) {
    console.error('WebSocket error occurred:', event);
    if (this.ws?.readyState === WebSocket.CLOSED) {
      this.reconnect();
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: IncidentWebSocketMessage = JSON.parse(event.data);
      
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

  private reconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connect();
  }

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

  public subscribe(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  public unsubscribe(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

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