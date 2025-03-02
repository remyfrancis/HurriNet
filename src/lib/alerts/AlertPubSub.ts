type Subscriber = (alert: Alert) => void;

export class AlertPubSub {
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private readonly queue: AlertPriorityQueue;

  constructor() {
    this.queue = new AlertPriorityQueue();
  }

  subscribe(district: string, callback: Subscriber) {
    if (!this.subscribers.has(district)) {
      this.subscribers.set(district, new Set());
    }
    this.subscribers.get(district)!.add(callback);

    return () => this.unsubscribe(district, callback);
  }

  unsubscribe(district: string, callback: Subscriber) {
    this.subscribers.get(district)?.delete(callback);
  }

  publish(alert: Alert) {
    this.queue.enqueue(alert);
    
    // Notify district-specific subscribers
    this.notifySubscribers(alert.district, alert);
    
    // Notify 'All' district subscribers for every alert
    if (alert.district !== 'All') {
      this.notifySubscribers('All', alert);
    }
  }

  private notifySubscribers(district: string, alert: Alert) {
    this.subscribers.get(district)?.forEach(callback => {
      setTimeout(() => callback(alert), 0);
    });
  }
}