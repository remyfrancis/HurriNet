
// src/app/onboarding/emergency/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
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

export default function EmergencyPersonnelOnboarding() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    badgeNumber: '',
    department: '',
    position: '',
    emergencyRole: '',
    certificationNumber: '',
    phoneNumber: '',
    address: '',
    additionalInfo: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const data = {
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      first_responder_id: formData.badgeNumber,
      medical_license_id: formData.certificationNumber,
      phone_number: formData.phoneNumber,
      address: formData.address,
      department: formData.department,
      position: formData.position,
      emergency_role: formData.emergencyRole,
      additional_info: formData.additionalInfo,
      role: 'EMERGENCY_PERSONNEL'
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/register/`
      console.log('Attempting to register at:', apiUrl)
      console.log('Registration data:', data)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || JSON.stringify(errorData.error))
        } else {
          const textError = await response.text()
          console.error('Non-JSON error response:', textError)
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
      }

      router.push('/login?verification=pending')
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
        <Shield className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold tracking-tight">Emergency Personnel Verification</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Please provide your credentials and official information for verification. 
          This helps us ensure secure access to emergency response tools.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
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
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Professional Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badgeNumber">Badge Number</Label>
              <Input
                id="badgeNumber"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Certification Number</Label>
              <Input
                id="certificationNumber"
                name="certificationNumber"
                value={formData.certificationNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyRole">Emergency Response Role</Label>
            <Select name="emergencyRole" value={formData.emergencyRole} onValueChange={(value) => handleSelectChange(value, 'emergencyRole')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_responder">First Responder</SelectItem>
                <SelectItem value="coordinator">Emergency Coordinator</SelectItem>
                <SelectItem value="team_lead">Response Team Lead</SelectItem>
                <SelectItem value="specialist">Emergency Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Emergency Contact Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              className="h-24"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Additional Information</h2>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Any additional information that may help verify your role"
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
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Are you a citizen looking to register for alerts?{" "}
          <a href="/register" className="text-primary hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
} 