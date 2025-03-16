'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, MapPin, Phone, Mail, Save } from 'lucide-react'

interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  address: string
  emergency_contacts: string
  avatar_url?: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken')
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          address: profile.address,
          emergency_contacts: profile.emergency_contacts
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || loading) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your personal information and emergency contacts.
          </p>
          
          <div className="max-w-3xl mx-auto">
            {profile && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Summary Card */}
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Profile Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {profile.first_name && profile.last_name 
                            ? `${profile.first_name[0]}${profile.last_name[0]}`
                            : profile.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <div className="mt-2 inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {profile.role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Details Card */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input 
                              id="first_name" 
                              value={profile.first_name || ''} 
                              onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input 
                              id="last_name" 
                              value={profile.last_name || ''} 
                              onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input id="email" value={profile.email} disabled />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input 
                            id="phone" 
                            value={profile.phone_number || ''} 
                            onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input 
                            id="address" 
                            value={profile.address || ''} 
                            onChange={(e) => setProfile({...profile, address: e.target.value})}
                            placeholder="Your address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contacts">Emergency Contacts</Label>
                        <Textarea 
                          id="emergency_contacts" 
                          value={profile.emergency_contacts || ''} 
                          onChange={(e) => setProfile({...profile, emergency_contacts: e.target.value})}
                          placeholder="Name and contact information for emergency contacts"
                          rows={4}
                        />
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert>
                          <AlertDescription>Profile updated successfully!</AlertDescription>
                        </Alert>
                      )}

                      <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                        <Save className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 