'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { EmergencyHQNav } from '@/components/HQDashboard/EmergencyHQNav';
import { ArrowUpDown } from 'lucide-react';

// Define the Incident type based on the Django model
interface Incident {
  id: number;
  title: string;
  description: string;
  incident_type: string;
  severity: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  created_at: string;
  is_resolved: boolean;
  photo_url: string | null;
}

// Severity color mapping
const severityColors = {
  EXTREME: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MODERATE: 'bg-blue-500',
  LOW: 'bg-green-500',
} as const;

// Custom sorting order for severity
const severityOrder = {
  EXTREME: 0,
  HIGH: 1,
  MODERATE: 2,
  LOW: 3,
};

export default function SituationReports() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { token, logout } = useAuth();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Incident;
    direction: 'asc' | 'desc';
  }>({ key: 'severity', direction: 'asc' });

  const handleSort = (key: keyof Incident) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    if (sortConfig.key === 'severity') {
      const comparison = severityOrder[a.severity] - severityOrder[b.severity];
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
    
    if (sortConfig.key === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }

    return 0;
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        if (!token) {
          throw new Error('Not authenticated');
        }

        // Fetch incidents with authentication
        const response = await fetch('http://localhost:8000/api/incidents/', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token is invalid or expired
          logout();
          throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || 'Failed to fetch incidents');
        }

        const data = await response.json();
        
        // Map incidents from features
        const mappedIncidents = data.features.map((feature: any) => ({
          ...feature.properties,
          location: feature.geometry,
        }));
        
        setIncidents(mappedIncidents);

        // Set up WebSocket connection with authentication
        const ws = new WebSocket(`ws://localhost:8000/ws/incidents/?token=${token}`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'incident_update') {
            // Refresh incidents when we receive an update
            fetchIncidents();
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          if (event.code === 1006) {
            // Authentication failed or connection lost
            setTimeout(() => {
              fetchIncidents(); // Retry connection after 5 seconds
            }, 5000);
          }
        };

        setSocket(ws);

      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchIncidents();
    } else {
      setError('Please log in to view incidents');
      setLoading(false);
    }

    // Cleanup WebSocket connection
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [token, logout]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading situation reports...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Situation Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage incident reports sorted by severity
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="w-full overflow-x-auto" style={{ minWidth: '800px' }}>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/3"
                      onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">
                      Title
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6"
                      onClick={() => handleSort('severity')}>
                    <div className="flex items-center gap-2">
                      Severity
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6"
                      onClick={() => handleSort('incident_type')}>
                    <div className="flex items-center gap-2">
                      Type
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/6"
                      onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2">
                      Created At
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{incident.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${severityColors[incident.severity]}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {incident.incident_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(incident.created_at), 'PPp')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        incident.is_resolved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {incident.is_resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <EmergencyHQNav />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
}
