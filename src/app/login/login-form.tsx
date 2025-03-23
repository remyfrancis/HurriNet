'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Get JWT tokens using the token endpoint
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password
        }),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok) {
        throw new Error(tokenData.detail || 'Login failed')
      }

      // Now fetch the user data using the access token
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await userResponse.json()
      
      // Use AuthContext login
      login(tokenData.access, userData)

      toast({
        title: "Success",
        description: "Successfully logged in",
      })

      // Redirect based on user role
      switch (userData.role) {
        case 'ADMINISTRATOR':
          router.push('/admin-dashboard')
          break
        case 'EMERGENCY_PERSONNEL':
          router.push('/emergency-hq')
          break
        case 'RESOURCE_MANAGER':
          router.push('/resource-manager-dashboard')
          break
        case 'MEDICAL_PERSONNEL':
          router.push('/medical-dashboard')
          break
        default:
          router.push('/citizen-dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Login failed',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-background p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold">Log in</h3>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            placeholder="Enter your email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isLoading} 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-xs text-primary underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isLoading} 
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p>Need emergency assistance during a hurricane?</p>
        <p className="font-medium text-red-600">Call the NEMO hotline: 758-452-3802</p>
      </div>
    </div>
  )
}

