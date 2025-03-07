'use client';

import React, { useEffect, useState } from 'react';
import { IncidentService, Incident } from '@/lib/incident-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function PollingTest() {
  const [service, setService] = useState<IncidentService | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    // Initialize service
    const incidentService = new IncidentService();
    setService(incidentService);
    setStatus('Connected (Polling)');

    // Subscribe to updates
    incidentService.subscribeToUpdates((incident: Incident) => {
      const msg = `Received update: ${JSON.stringify(incident)}`;
      setMessages(prev => [...prev, msg]);
    });

    // Cleanup
    return () => {
      incidentService.disconnect();
    };
  }, []);

  const sendTestMessage = async () => {
    if (service) {
      try {
        await service.createIncident({
          title: testMessage,
          description: 'Test incident',
          incident_type: 'TEST',
          severity: 'LOW',
          location: 'Test Location'
        });
        
        const msg = `Created incident: ${testMessage}`;
        setMessages(prev => [...prev, msg]);
        setTestMessage('');
      } catch (error) {
        console.error('Error creating incident:', error);
        setMessages(prev => [...prev, `Error: ${error}`]);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Updates Test Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="p-2 rounded bg-green-100">
                {status}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test Controls</h3>
              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message"
                />
                <Button onClick={sendTestMessage}>Create Incident</Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Message Log</h3>
              <div className="h-[300px] overflow-y-auto border rounded p-2 space-y-1">
                {messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 