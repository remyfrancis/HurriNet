import { apiClient } from './api';
import { IncidentData, IncidentClassification } from './incident-classification';
import { getAuthToken } from './auth-client';

export interface Incident {
  id: number;
  title: string;
  description: string;
  location: string;
  incident_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  created_by: {
    id: number;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  classification?: IncidentClassification;
}

export interface IncidentUpdate {
  id: number;
  incident: number;
  content: string;
  author: {
    id: number;
    email: string;
    role: string;
  };
  created_at: string;
}

export interface IncidentFlag {
  id: number;
  incident: number;
  reason: string;
  description: string;
  reported_by: {
    id: number;
    email: string;
    role: string;
  };
  created_at: string;
  reviewed: boolean;
}

export class IncidentService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private updateHandlers: ((incident: Incident) => void)[] = [];
  private lastPollTime: string | null = null;
  private isAuthenticated: boolean = false;
  private readonly POLLING_INTERVAL = 5000; // Poll every 5 seconds

  constructor() {
    this.initialize();
  }

  private initialize() {
    const token = getAuthToken();
    if (token) {
      this.isAuthenticated = true;
      this.startPolling();
    } else {
      console.warn('No authentication token available');
    }
  }

  private async pollForUpdates() {
    if (!this.isAuthenticated) return;

    try {
      const searchParams = new URLSearchParams({
        since: this.lastPollTime || new Date(0).toISOString()
      });

      const response = await apiClient.get(`/api/incidents/check_updates/?${searchParams.toString()}`);
      if (response.updates?.length > 0) {
        this.lastPollTime = response.timestamp;
        response.updates.forEach(incident => {
          this.notifyUpdateHandlers(incident);
        });
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  }

  private startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, this.POLLING_INTERVAL);

    // Initial poll
    this.pollForUpdates();
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  public subscribeToUpdates(handler: (incident: Incident) => void) {
    this.updateHandlers.push(handler);
  }

  public unsubscribeFromUpdates(handler: (incident: Incident) => void) {
    this.updateHandlers = this.updateHandlers.filter(h => h !== handler);
  }

  private notifyUpdateHandlers(incident: Incident) {
    this.updateHandlers.forEach(handler => handler(incident));
  }

  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public async createIncident(data: FormData | IncidentData): Promise<Incident> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    const config = data instanceof FormData 
      ? undefined  // Let browser handle FormData headers
      : { 
          headers: {
            'Content-Type': 'application/json'
          }
        };

    const response = await apiClient.post('/api/incidents/', data, config);
    return response;
  }

  public async getIncidents(params?: {
    severity?: string;
    status?: string;
    incident_type?: string;
    page?: number;
    page_size?: number;
    updated_after?: string;
  }): Promise<{ results: Incident[]; total: number }> {
    if (!this.isAuthenticated) {
      return {
        results: [],
        total: 0
      };
    }
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const response = await apiClient.get(`/api/incidents/?${searchParams.toString()}`);
    return response;
  }

  public async getIncident(id: number): Promise<Incident> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    const response = await apiClient.get(`/api/incidents/${id}/`);
    return response;
  }

  public async updateIncident(id: number, data: Partial<Incident>): Promise<Incident> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    const response = await apiClient.put(`/api/incidents/${id}/`, data);
    return response;
  }

  public async addIncidentUpdate(id: number, content: string): Promise<IncidentUpdate> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    const response = await apiClient.post(`/api/incidents/${id}/add_update/`, {
      content,
    });
    return response;
  }

  public async flagIncident(id: number, reason: string, description: string): Promise<IncidentFlag> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    const response = await apiClient.post(`/api/incidents/${id}/flag/`, {
      reason,
      description,
    });
    return response;
  }

  public async resolveIncident(id: number): Promise<Incident> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }
    const response = await apiClient.post(`/api/incidents/${id}/resolve/`, {});
    return response;
  }

  public async getIncidentUpdates(id: number): Promise<IncidentUpdate[]> {
    if (!this.isAuthenticated) {
      return [];
    }
    const response = await apiClient.get(`/api/incidents/${id}/updates/`);
    return response;
  }

  public async getIncidentFlags(id: number): Promise<IncidentFlag[]> {
    if (!this.isAuthenticated) {
      return [];
    }
    const response = await apiClient.get(`/api/incidents/${id}/flags/`);
    return response;
  }

  public async getNearbyIncidents(lat: number, lng: number, radius: number = 10): Promise<Incident[]> {
    if (!this.isAuthenticated) {
      return [];
    }
    const searchParams = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), radius: radius.toString() });
    const response = await apiClient.get(`/api/incidents/nearby/?${searchParams.toString()}`);
    return response;
  }

  public disconnect() {
    this.stopPolling();
    this.updateHandlers = [];
  }
} 