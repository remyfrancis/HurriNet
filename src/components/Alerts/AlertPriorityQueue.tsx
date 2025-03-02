type Alert = {
  id: number
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
}

class AlertNode {
    constructor(
      public alert: Alert,
      public priority: number,
      public timestamp: number = Date.now()
    ) {}
  }
  
  export class AlertPriorityQueue {
    private queue: AlertNode[] = [];
  
    calculatePriority(alert: Alert): number {
      const severityWeights = {
        'High': 100,
        'Medium': 50,
        'Low': 10
      };
  
      const typeWeights = {
        'Hurricane': 2.0,
        'Flood': 1.8,
        'Landslide': 1.8,
        'Storm Surge': 1.6,
        'High Wind': 1.4,
        'Heavy Rain': 1.2,
        'Other': 1.0
      };
  
      const baseScore = severityWeights[alert.severity] * 
                       (typeWeights[alert.type as keyof typeof typeWeights] || 1.0);
  
      // Increase priority for 'All' district alerts
      const districtMultiplier = alert.district === 'All' ? 1.5 : 1.0;
  
      return baseScore * districtMultiplier;
    }
  
    enqueue(alert: Alert) {
      const priority = this.calculatePriority(alert);
      const node = new AlertNode(alert, priority);
      
      // Add to queue and sort by priority
      this.queue.push(node);
      this.queue.sort((a, b) => b.priority - a.priority);
      
      // Remove duplicates and group similar alerts
      this.deduplicateAndGroup();
    }
  
    private deduplicateAndGroup() {
      const grouped = new Map<string, AlertNode[]>();
      
      this.queue.forEach(node => {
        const key = `${node.alert.type}-${node.alert.district}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(node);
      });
  
      // Deduplicate within groups
      this.queue = Array.from(grouped.values()).map(group => {
        if (group.length === 1) return group[0];
        
        // Combine similar alerts
        const highestPriority = Math.max(...group.map(n => n.priority));
        const latest = group.reduce((a, b) => 
          a.timestamp > b.timestamp ? a : b
        );
  
        return new AlertNode(
          {
            ...latest.alert,
            title: `${group.length} ${latest.alert.type} alerts in ${latest.alert.district}`,
            severity: latest.alert.severity
          },
          highestPriority,
          latest.timestamp
        );
      });
    }
  
    dequeue(): Alert | null {
      const node = this.queue.shift();
      return node ? node.alert : null;
    }
  
    peek(): Alert | null {
      return this.queue[0]?.alert || null;
    }
  
    get length(): number {
      return this.queue.length;
    }
  }