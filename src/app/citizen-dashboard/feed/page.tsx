'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { CitizenFeed } from '../citizen-feed'
import { useRouter } from 'next/navigation'

export default function FeedPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Community Feed</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with your community, share updates, and stay informed about local developments.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <CitizenFeed />
          </div>
        </div>
      </main>
    </div>
  )
} 