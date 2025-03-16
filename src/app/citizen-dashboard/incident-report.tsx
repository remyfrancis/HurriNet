'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, MapPin } from 'lucide-react'

interface IncidentForm {
  title: string
  description: string
  location: string
  incident_type: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  photo?: File
}

export function IncidentReport() {
  const [formData, setFormData] = useState<IncidentForm>({
    title: '',
    description: '',
    location: '',
    incident_type: '',
    severity: 'LOW',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })
      if (photo) {
        formDataToSend.append('photo', photo)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in again')
          return
        }
        throw new Error('Failed to submit incident report')
      }

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        location: '',
        incident_type: '',
        severity: 'LOW',
      })
      setPhoto(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit incident report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what happened"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location or address"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident_type">Incident Type</Label>
            <Input
              id="incident_type"
              value={formData.incident_type}
              onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
              placeholder="e.g., Flood, Power Outage, Road Block"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentForm['severity'] })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
              <option value="EXTREME">Extreme</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo/Video (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Incident report submitted successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 