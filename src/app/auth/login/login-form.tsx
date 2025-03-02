'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { username, password })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username,
          password: password
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      console.log('Login response:', data)

      // Store tokens
      localStorage.setItem('accessToken', `Bearer ${data.access}`)
      localStorage.setItem('refreshToken', data.refresh)
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on user type
      if (data.user.user_type === 'emergency_responder' || data.user.user_type === 'coordinator') {
        router.push('/emergency-dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
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
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="Enter your username" 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
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

