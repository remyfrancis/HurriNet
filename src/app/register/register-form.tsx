'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      email: formData.get('email'),
      password: formData.get('password'),
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      user_type: 'public', // Default to public user type for citizens
      username: formData.get('email')?.toString().split('@')[0] || ''
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
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-background p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold">Join HurriNet as a Citizen</h3>
        <p className="text-sm text-muted-foreground">
          Create your account to receive alerts and stay prepared during hurricane season
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a secure password"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last name"
              required
            />
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating your account...' : 'Create Citizen Account'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p>Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>Are you an emergency responder or coordinator?{" "}
          <a href="/contact" className="text-primary hover:underline">
            Contact the Administrator
          </a>
        </p>
      </div>
    </div>
  )
}

