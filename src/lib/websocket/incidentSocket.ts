export class IncidentWebSocket {
    private ws: WebSocket;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
    constructor() {
      this.ws = this.connect();
    }
  
    private connect(): WebSocket {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/incidents/`);
      
      ws.onopen = () => {
        console.log('Connected to incident websocket');
        this.reconnectAttempts = 0;
      };
  
      ws.onclose = () => {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.ws = this.connect();
          }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
      };
  
      return ws;
    }
  
    public reportIncident(incidentData: IncidentReport) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(incidentData));
      }
    }
  }