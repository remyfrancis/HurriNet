'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Flag, Calendar, Heart } from 'lucide-react'

interface User {
  id: number
  email: string
  avatar_url?: string
  first_name?: string
  last_name?: string
}

interface Reaction {
  id: number
  reaction_type: string
  user: User
}

interface Post {
  id: number
  content: string
  image_url?: string
  created_at: string
  post_type: string
  post_type_display: string
  author: User
  reactions: Reaction[]
}

// Map post types to colors for badges
const POST_TYPE_COLORS: Record<string, string> = {
  'UPDATE': 'bg-blue-500',
  'HELP_REQUEST': 'bg-red-500',
  'OFFER_HELP': 'bg-green-500',
  'INFO': 'bg-purple-500',
  'WARNING': 'bg-yellow-500',
}

export function HighlightedPosts() {
  const [mostImportantPost, setMostImportantPost] = useState<Post | null>(null)
  const [mostFlaggedPost, setMostFlaggedPost] = useState<Post | null>(null)
  const [mostHelpfulPost, setMostHelpfulPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHighlightedPosts()
  }, [])

  const fetchHighlightedPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/posts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in again')
          return
        }
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      
      // Find post with most "IMPORTANT" reactions
      const importantPosts = [...data].sort((a, b) => {
        const aCount = a.reactions?.filter((r: Reaction) => r.reaction_type === 'IMPORTANT').length || 0
        const bCount = b.reactions?.filter((r: Reaction) => r.reaction_type === 'IMPORTANT').length || 0
        return bCount - aCount
      })
      
      // Find post with most "FLAG" reactions
      const flaggedPosts = [...data].sort((a, b) => {
        const aCount = a.reactions?.filter((r: Reaction) => r.reaction_type === 'FLAG').length || 0
        const bCount = b.reactions?.filter((r: Reaction) => r.reaction_type === 'FLAG').length || 0
        return bCount - aCount
      })
      
      // Find post with most "HELPFUL" reactions
      const helpfulPosts = [...data].sort((a, b) => {
        const aCount = a.reactions?.filter((r: Reaction) => r.reaction_type === 'HELPFUL').length || 0
        const bCount = b.reactions?.filter((r: Reaction) => r.reaction_type === 'HELPFUL').length || 0
        return bCount - aCount
      })
      
      if (importantPosts.length > 0 && importantPosts[0].reactions?.some((r: Reaction) => r.reaction_type === 'IMPORTANT')) {
        setMostImportantPost(importantPosts[0])
      }
      
      if (flaggedPosts.length > 0 && flaggedPosts[0].reactions?.some((r: Reaction) => r.reaction_type === 'FLAG')) {
        setMostFlaggedPost(flaggedPosts[0])
      }
      
      if (helpfulPosts.length > 0 && helpfulPosts[0].reactions?.some((r: Reaction) => r.reaction_type === 'HELPFUL')) {
        setMostHelpfulPost(helpfulPosts[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to count reactions by type
  const countReactionsByType = (reactions: Reaction[] | undefined, type: string): number => {
    return reactions?.filter((reaction: Reaction) => reaction.reaction_type === type).length || 0
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {mostImportantPost && (
        <Card className="border-yellow-500 border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Most Important Post
              <Badge className="ml-auto bg-yellow-500">
                {countReactionsByType(mostImportantPost.reactions, 'IMPORTANT')} Marked Important
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={mostImportantPost.author.avatar_url} />
                <AvatarFallback>
                  {mostImportantPost.author.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{mostImportantPost.author.email}</p>
                    <Badge 
                      className={`${POST_TYPE_COLORS[mostImportantPost.post_type] || 'bg-gray-500'} text-white`}
                    >
                      {mostImportantPost.post_type_display}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(mostImportantPost.created_at).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm">{mostImportantPost.content}</p>
                {mostImportantPost.image_url && (
                  <img
                    src={mostImportantPost.image_url}
                    alt="Post content"
                    className="rounded-lg max-h-[150px] object-cover"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mostHelpfulPost && (
        <Card className="border-green-500 border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" />
              Most Helpful Post
              <Badge className="ml-auto bg-green-500">
                {countReactionsByType(mostHelpfulPost.reactions, 'HELPFUL')} Marked Helpful
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={mostHelpfulPost.author.avatar_url} />
                <AvatarFallback>
                  {mostHelpfulPost.author.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{mostHelpfulPost.author.email}</p>
                    <Badge 
                      className={`${POST_TYPE_COLORS[mostHelpfulPost.post_type] || 'bg-gray-500'} text-white`}
                    >
                      {mostHelpfulPost.post_type_display}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(mostHelpfulPost.created_at).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm">{mostHelpfulPost.content}</p>
                {mostHelpfulPost.image_url && (
                  <img
                    src={mostHelpfulPost.image_url}
                    alt="Post content"
                    className="rounded-lg max-h-[150px] object-cover"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mostFlaggedPost && (
        <Card className="border-red-500 border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Most Flagged Post
              <Badge className="ml-auto bg-red-500">
                {countReactionsByType(mostFlaggedPost.reactions, 'FLAG')} Flags
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={mostFlaggedPost.author.avatar_url} />
                <AvatarFallback>
                  {mostFlaggedPost.author.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{mostFlaggedPost.author.email}</p>
                    <Badge 
                      className={`${POST_TYPE_COLORS[mostFlaggedPost.post_type] || 'bg-gray-500'} text-white`}
                    >
                      {mostFlaggedPost.post_type_display}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(mostFlaggedPost.created_at).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm">{mostFlaggedPost.content}</p>
                {mostFlaggedPost.image_url && (
                  <img
                    src={mostFlaggedPost.image_url}
                    alt="Post content"
                    className="rounded-lg max-h-[150px] object-cover"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!mostImportantPost && !mostHelpfulPost && !mostFlaggedPost && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              No highlighted posts available yet. Posts with "Important", "Helpful", or "Flag" reactions will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 