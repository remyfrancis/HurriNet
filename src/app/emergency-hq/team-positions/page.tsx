'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicalTeams } from "@/components/HQDashboard/MedicalTeams"
import { EmergencyTeams } from "@/components/HQDashboard/EmergencyTeams"
import { EmergencyHQNav } from "@/components/HQDashboard/EmergencyHQNav"
export default function TeamsPage() {
  return (
    <div className="flex min-h-screen">
        <EmergencyHQNav />
        <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Team Management</h1>
        
        <Tabs defaultValue="medical" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="medical">Medical Teams</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Response Teams</TabsTrigger>
            </TabsList>
            <TabsContent value="medical">
            <MedicalTeams />
            </TabsContent>
            <TabsContent value="emergency">
            <EmergencyTeams />
            </TabsContent>
        </Tabs>
        </div>
    </div>
  )
} 