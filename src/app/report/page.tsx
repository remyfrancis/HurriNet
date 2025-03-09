'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IncidentReportForm } from '@/components/IncidentReportForm';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // If not authenticated, don't render the form
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <IncidentReportForm />
      </main>
      <Toaster />
    </div>
  );
} 