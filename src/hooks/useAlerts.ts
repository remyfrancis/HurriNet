import { useState, useEffect } from 'react';
import { AlertPubSub } from '@/lib/alerts/AlertPubSub';

type Alert = {
  id: number
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
}

const alertPubSub = new AlertPubSub();

export function useAlerts(district: string = 'All') {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const unsubscribe = alertPubSub.subscribe(district, (alert: Alert) => {

      setAlerts(prev => [alert, ...prev]);
    });

    return () => unsubscribe();
  }, [district]);

  const publishAlert = (alert: Alert) => {
    alertPubSub.publish(alert);
  };

  return { alerts, publishAlert };
}