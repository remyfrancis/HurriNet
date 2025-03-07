# Incident Management System

The Incident Management System (IMS) represents a core component of HurriNet, designed to facilitate rapid response to emergencies through real-time incident reporting and tracking. This system implements a WebSocket-based architecture to ensure immediate communication between field reporters and emergency response coordinators.
 
## Real-time Communication Architecture

At the heart of the IMS lies a robust WebSocket implementation that enables bidirectional communication between clients and the server. The system utilizes a class-based architecture for managing WebSocket connections, incorporating sophisticated error handling and automatic reconnection logic. This approach is particularly crucial for maintaining system reliability during emergency situations when network connectivity may be unstable.

The following code excerpt demonstrates the implementation of the WebSocket connection manager:

```typescript
export class IncidentWebSocket {
    private ws: WebSocket;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
   
    constructor() {
        this.ws = this.connect();
    }
}
```
 
The system employs an exponential backoff strategy for connection retries, a critical feature that helps prevent network congestion during large-scale incidents when multiple clients might simultaneously attempt to reconnect:
 
```typescript
ws.onclose = () => {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
            this.reconnectAttempts++;
            this.ws = this.connect();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
};
```
 
## Incident Classification and Routing

The IMS incorporates an automated classification system that categorizes incoming incidents based on severity, type, and location. This classification process is fundamental to ensuring appropriate resource allocation and response prioritization. The system utilizes predefined criteria to assign priority levels and automatically routes incidents to relevant emergency response teams.
 
 
## System Reliability and Performance
 
To maintain system reliability, the WebSocket implementation includes several key features:
 
1. Connection state monitoring
2. Automatic reconnection with exponential backoff
3. Maximum retry limits to prevent endless reconnection attempts
4. Data validation before transmission
 
This careful attention to connection management and data integrity ensures that the incident reporting system remains operational even under challenging network conditions, a crucial requirement for emergency response applications.
 
 
## Resource Allocation Engine
 
The Resource Allocation Engine represents a crucial component of HurriNet, implementing sophisticated algorithms for optimal resource distribution during emergency situations. This system employs the Hungarian Algorithm for assignment optimization while maintaining comprehensive resource status tracking capabilities.
 
## Resource Data Model
 
The engine's foundation rests on a robust data model that captures essential attributes of emergency resources. The implementation utilizes Django's Object-Relational Mapping (ORM) to define a comprehensive Resource model:
 
```python
class Resource(models.Model):
    RESOURCE_TYPES = [
        ('SHELTER', 'Shelter'),
        ('MEDICAL', 'Medical'),
        ('SUPPLIES', 'Supplies'),
        ('WATER', 'Water'),
    ]
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('LIMITED', 'Limited'),
        ('UNAVAILABLE', 'Unavailable'),
        ('ASSIGNED', 'Assigned'),
    ]
```
 
This model implementation supports four distinct resource types, each crucial for emergency response operations. The status tracking system employs a state machine approach, allowing resources to transition between availability states based on current conditions and assignments.