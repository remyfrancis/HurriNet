import { ResourceAllocator, Assignment } from '@/lib/resources/ResourceAllocation';
import { useAlerts } from '@/hooks/useAlerts';
import { useState, useEffect } from 'react';
import { Resource } from '@/lib/types';


export function AllocationDashboard() {
  const { alerts } = useAlerts();
  const [resources, setResources] = useState<Resource[]>([]);
  const allocator = new ResourceAllocator();

  const updateResourceAssignments = async (assignments: Assignment[]) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resources/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });
    } catch (error) {
      console.error('Error updating assignments:', error);
    }
  };

  useEffect(() => {
    // Fetch available resources
    const fetchResources = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resources/`);
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    if (alerts.length && resources.length) {
      const assignments = allocator.assignResources(alerts, resources);
      // Update resource assignments
      updateResourceAssignments(assignments);
    }
  }, [alerts, resources]);

  return (
    <div className="space-y-4">
      {/* Resource allocation UI */}
    </div>
  );
}