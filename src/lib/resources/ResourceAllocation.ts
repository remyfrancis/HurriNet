type Alert = {
  id: number
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
}

interface Resource {
    id: string;
    type: 'ambulance' | 'fire_truck' | 'police' | 'rescue_team';
    location: {
      lat: number;
      lng: number;
    };
    capacity: number;
    currentWorkload: number;
    status: 'available' | 'assigned' | 'unavailable';
  }
  
  export interface Assignment {
    resourceId: string;
    incidentId: string;
    cost: number;
  }
  
  export class ResourceAllocator {
    private resources: Map<string, Resource> = new Map();
    
    // Hungarian Algorithm implementation for optimal assignment
    assignResources(incidents: Alert[], availableResources: Resource[]): Assignment[] {
      const costMatrix = this.buildCostMatrix(incidents, availableResources);
      const assignments = this.hungarianAlgorithm(costMatrix);
      
      return assignments.map(([incidentIndex, resourceIndex]) => ({
        resourceId: availableResources[resourceIndex].id,
        incidentId: incidents[incidentIndex].id.toString(),
        cost: costMatrix[incidentIndex][resourceIndex]
      }));
    }
  
    private buildCostMatrix(incidents: Alert[], resources: Resource[]): number[][] {
      return incidents.map(incident => 
        resources.map(resource => this.calculateAssignmentCost(incident, resource))
      );
    }
  
    private calculateAssignmentCost(incident: Alert, resource: Resource): number {
      const distance = this.calculateDistance(
        { lat: resource.location.lat, lng: resource.location.lng },
        this.getIncidentLocation(incident)
      );
  
      const workloadFactor = resource.currentWorkload / resource.capacity;
      const priorityFactor = this.getIncidentPriorityScore(incident);
      
      return (
        distance * 0.4 +          // 40% weight for distance
        workloadFactor * 0.3 +    // 30% weight for workload
        priorityFactor * 0.3      // 30% weight for incident priority
      );
    }
  
    private hungarianAlgorithm(costMatrix: number[][]): [number, number][] {
      const n = Math.max(costMatrix.length, costMatrix[0].length);
      const normalized = this.normalizeMatrix(costMatrix, n);
      
      // Step 1: Row reduction
      for (let i = 0; i < n; i++) {
        const minVal = Math.min(...normalized[i]);
        for (let j = 0; j < n; j++) {
          normalized[i][j] -= minVal;
        }
      }
  
      // Step 2: Column reduction
      for (let j = 0; j < n; j++) {
        const minVal = Math.min(...normalized.map(row => row[j]));
        for (let i = 0; i < n; i++) {
          normalized[i][j] -= minVal;
        }
      }
  
      // Find optimal assignment
      const assignments: [number, number][] = [];
      const used = new Set<number>();
  
      for (let i = 0; i < costMatrix.length; i++) {
        for (let j = 0; j < costMatrix[0].length; j++) {
          if (normalized[i][j] === 0 && !used.has(j)) {
            assignments.push([i, j]);
            used.add(j);
            break;
          }
        }
      }
  
      return assignments;
    }
  
    private normalizeMatrix(matrix: number[][], n: number): number[][] {
      const normalized = Array(n).fill(0).map(() => Array(n).fill(Infinity));
      
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
          normalized[i][j] = matrix[i][j];
        }
      }
      
      return normalized;
    }
  
    private calculateDistance(point1: {lat: number, lng: number}, point2: {lat: number, lng: number}): number {
      const R = 6371; // Earth's radius in km
      const dLat = this.toRad(point2.lat - point1.lat);
      const dLon = this.toRad(point2.lng - point1.lng);
      const lat1 = this.toRad(point1.lat);
      const lat2 = this.toRad(point2.lat);
  
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    private toRad(value: number): number {
      return value * Math.PI / 180;
    }
  
    private getIncidentPriorityScore(incident: Alert): number {
      const severityScores = {
        'High': 1.0,
        'Medium': 0.6,
        'Low': 0.3
      };
      return severityScores[incident.severity];
    }
  
    private getIncidentLocation(incident: Alert): {lat: number, lng: number} {
      // Reference the district coordinates from EmergencyShelterMap
      const districtCoords = {
        'Castries': { lat: 14.0101, lng: -60.9875 },
        'Gros Islet': { lat: 14.0722, lng: -60.9498 },
        // ... other districts
      };
      return districtCoords[incident.district as keyof typeof districtCoords];
    }
  }