'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

export function CreateWeatherAlert() {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alert_type: 'SEVERE_WEATHER',
    severity: 'MODERATE',
    area_affected: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    // Get the token from localStorage when component mounts
    const storedToken = localStorage.getItem('accessToken');
    console.log('Authentication Status:', {
      hasToken: !!storedToken,
      tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : 'No token found'
    });
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Submitting form with auth status:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (!token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create alerts.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Making API request with headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      });

      const response = await fetch('http://localhost:8000/api/weather/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        if (response.status === 401) {
          // Token might be expired
          localStorage.removeItem('accessToken');
          setToken(null);
          throw new Error('Please log in again to continue.');
        }
        throw new Error(errorData.detail || errorData.message || 'Failed to create alert');
      }

      toast({
        title: 'Success',
        description: 'Weather alert has been created successfully.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        alert_type: 'SEVERE_WEATHER',
        severity: 'MODERATE',
        area_affected: '',
        start_time: '',
        end_time: '',
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create weather alert. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get CSRF token from cookies
  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Create Weather Alert</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alert Type</label>
          <select
            value={formData.alert_type}
            onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2"
            required
          >
            <option value="HURRICANE_WATCH">Hurricane Watch</option>
            <option value="HURRICANE_WARNING">Hurricane Warning</option>
            <option value="FLOOD_WATCH">Flood Watch</option>
            <option value="FLOOD_WARNING">Flood Warning</option>
            <option value="SEVERE_WEATHER">Severe Weather</option>
            <option value="TORNADO_WATCH">Tornado Watch</option>
            <option value="TORNADO_WARNING">Tornado Warning</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2"
            required
          >
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="EXTREME">Extreme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Area Affected</label>
          <Input
            value={formData.area_affected}
            onChange={(e) => setFormData({ ...formData, area_affected: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <Input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <Input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Weather Alert'}
        </Button>
      </form>
    </div>
  );
} 