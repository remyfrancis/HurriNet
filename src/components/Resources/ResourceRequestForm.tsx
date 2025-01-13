// src/components/Resources/ResourceRequestForm.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import LocationSelector from '@/app/emergency-personnel-dashboard/report-incident/location-selector'

export default function ResourceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Implement form submission
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Emergency Resources</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What do you need?</Label>
            <Textarea 
              placeholder="Describe what resources you need..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of People</Label>
              <Input type="number" min="1" required />
            </div>
            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <select className="w-full border rounded-md p-2">
                <option value="low">Low - Within 24 hours</option>
                <option value="medium">Medium - Within 12 hours</option>
                <option value="high">High - Within 6 hours</option>
                <option value="critical">Critical - Immediate</option>
              </select>
            </div>
          </div>

          <LocationSelector />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            Submit Request
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}