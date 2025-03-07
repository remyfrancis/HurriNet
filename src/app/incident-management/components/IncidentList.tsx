"use client";

import React, { useEffect, useState } from 'react';
import { IncidentService, Incident, IncidentUpdate } from '@/lib/incident-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, AlertCircle, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function IncidentList() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    incident_type: '',
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [updateContent, setUpdateContent] = useState('');
  const [incidentService, setIncidentService] = useState<IncidentService | null>(null);

  useEffect(() => {
    const service = new IncidentService();
    setIncidentService(service);
    
    if (service.isUserAuthenticated()) {
      service.subscribeToUpdates(handleIncidentUpdate);
    }

    return () => {
      service.unsubscribeFromUpdates(handleIncidentUpdate);
      service.disconnect();
    };
  }, []);

  useEffect(() => {
    if (incidentService?.isUserAuthenticated()) {
      loadIncidents();
    } else {
      setLoading(false);
      router.push('/auth/login');
    }
  }, [filters, incidentService, router]);

  const loadIncidents = async () => {
    if (!incidentService) return;
    
    try {
      setLoading(true);
      const response = await incidentService.getIncidents(filters);
      setIncidents(response.results);
    } catch (error) {
      console.error('Error loading incidents:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentUpdate = (incident: Incident) => {
    setIncidents(prev => 
      prev.map(i => i.id === incident.id ? incident : i)
    );
  };

  const handleAddUpdate = async () => {
    if (!selectedIncident || !updateContent.trim() || !incidentService) return;

    try {
      await incidentService.addIncidentUpdate(selectedIncident.id, updateContent);
      setUpdateContent('');
      // Refresh incident details
      const updated = await incidentService.getIncident(selectedIncident.id);
      setSelectedIncident(updated);
    } catch (error) {
      console.error('Error adding update:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        router.push('/auth/login');
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MODERATE':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Loading incidents...</p>
      </div>
    );
  }

  if (!incidentService?.isUserAuthenticated()) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Please log in to view incidents</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={filters.severity}
            onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Severities</SelectItem>
              <SelectItem value="EXTREME">Extreme</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MODERATE">Moderate</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card
                key={incident.id}
                className={`cursor-pointer transition-colors ${
                  selectedIncident?.id === incident.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedIncident(incident)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {incident.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {selectedIncident && (
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>

              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-sm text-muted-foreground">{selectedIncident.location}</p>
              </div>

              <div>
                <h3 className="font-semibold">Classification</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedIncident.classification?.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Add Update</h3>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={updateContent}
                    onChange={(e) => setUpdateContent(e.target.value)}
                    placeholder="Enter update..."
                  />
                  <Button onClick={handleAddUpdate}>Add</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 