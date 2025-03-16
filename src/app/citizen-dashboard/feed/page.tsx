'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { CitizenFeed } from '../citizen-feed'
import { HighlightedPosts } from '../highlighted-posts'
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
          
          <div className="flex gap-8">
            {/* Left sidebar with highlighted posts */}
            <div className="w-1/4">
              <h2 className="text-xl font-bold mb-4">Highlighted Posts</h2>
              <HighlightedPosts />
            </div>
            
            {/* Main feed */}
            <div className="flex-1">
              <CitizenFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 