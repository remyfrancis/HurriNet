'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function MedicalPersonnelOnboarding() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      medical_license: formData.get('medicalLicense'),
      specialization: formData.get('specialization'),
      facility_name: formData.get('facilityName'),
      position: formData.get('position'),
      medical_role: formData.get('medicalRole'),
      years_experience: formData.get('yearsExperience'),
      phone_number: formData.get('phoneNumber'),
      additional_info: formData.get('additionalInfo'),
      user_type: 'medical_personnel'
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/register/medical/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || JSON.stringify(errorData.error))
      }

      router.push('/auth/login?verification=pending')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="space-y-6 text-center mb-10">
        <Stethoscope className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold tracking-tight">Medical Personnel Verification</h1>
        <p className="text-muted-foreground">
          Please provide your medical credentials for verification. 
          This ensures proper access to emergency medical response tools.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalLicense">Medical License Number</Label>
              <Input
                id="medicalLicense"
                name="medicalLicense"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Medical Specialization</Label>
            <Select name="specialization" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Emergency Medicine</SelectItem>
                <SelectItem value="trauma">Trauma Care</SelectItem>
                <SelectItem value="general">General Practice</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="paramedic">Paramedic</SelectItem>
                <SelectItem value="other">Other Medical Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalRole">Emergency Response Role</Label>
            <Select name="medicalRole" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_responder">Medical First Responder</SelectItem>
                <SelectItem value="coordinator">Medical Coordinator</SelectItem>
                <SelectItem value="team_lead">Medical Team Lead</SelectItem>
                <SelectItem value="support">Medical Support Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilityName">Medical Facility</Label>
            <Input
              id="facilityName"
              name="facilityName"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Emergency Contact Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Any additional information about your medical qualifications or experience"
              className="h-24"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit for Verification'}
        </Button>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Your information will be verified by NEMO administrators. 
          You will receive an email once your account is approved.
        </p>
      </form>
    </div>
  )
} 