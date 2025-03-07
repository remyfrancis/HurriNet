import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncidentList } from './components/IncidentList';
import { CreateIncidentForm } from './components/CreateIncidentForm';

export default function IncidentManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incident Management</h1>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Incident List</TabsTrigger>
          <TabsTrigger value="create">Create Incident</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <IncidentList />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateIncidentForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 