'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast, useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import LocationSelector from './location-selector'
import PhotoUpload from './photo-upload'
import { reportIncident } from './actions'

export default function ReportIncidentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    
    try {
      const result = await reportIncident(formData)
      if (result.success) {
        toast({
          title: "Incident Reported",
          description: "Your incident has been successfully reported. Tracking ID: " + result.trackingId,
        })
        router.push(`/dashboard/incident-status/${result.trackingId}`)
      } else {
        throw new Error(result.error || 'Failed to report incident')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incidentType">Incident Type</Label>
            <Select name="incidentType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flooding">Flooding</SelectItem>
                <SelectItem value="landslide">Landslide</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="powerOutage">Power Outage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the incident..."
              required
            />
          </div>
          <LocationSelector />
          <PhotoUpload />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

