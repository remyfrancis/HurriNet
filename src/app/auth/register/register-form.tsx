'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      user_type: formData.get('userType') || 'public',
      location: formData.get('location'),
      phone_number: formData.get('phoneNumber') || '',
      organization: formData.get('organization') || ''
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/register/`, {
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

      const result = await response.json()
      console.log('Registration successful:', result)
      
      // Store tokens if provided
      if (result.access) {
        localStorage.setItem('accessToken', `Bearer ${result.access}`)
      }
      if (result.refresh) {
        localStorage.setItem('refreshToken', result.refresh)
      }

      router.push('/auth/login?registered=true')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          name="username"
          type="text"
          placeholder="Username"
          required
        />
      </div>
      <div>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
        />
      </div>
      <div>
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <div>
        <Input
          name="firstName"
          type="text"
          placeholder="First Name"
          required
        />
      </div>
      <div>
        <Input
          name="lastName"
          type="text"
          placeholder="Last Name"
          required
        />
      </div>
      <div>
        <Select name="userType" defaultValue="public">
          <SelectTrigger>
            <SelectValue placeholder="Select User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public User</SelectItem>
            <SelectItem value="emergency_responder">Emergency Responder</SelectItem>
            <SelectItem value="coordinator">Emergency Coordinator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          name="location"
          type="text"
          placeholder="Location"
          required
        />
      </div>
      <div>
        <Input
          name="phoneNumber"
          type="tel"
          placeholder="Phone Number (optional)"
        />
      </div>
      <div>
        <Input
          name="organization"
          type="text"
          placeholder="Organization (optional)"
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </Button>
    </form>
  )
}

