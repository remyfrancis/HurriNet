'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  ThumbsUp, 
  Heart, 
  Flag, 
  AlertTriangle,
  Calendar,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Reaction {
  id: number
  reaction_type: string
  user: {
    id: number
    email: string
  }
}

interface Post {
  id: number
  content: string
  image_url?: string
  created_at: string
  post_type: string
  post_type_display: string
  author: {
    id: number
    email: string
    avatar_url?: string
  }
  reactions: Reaction[]
  reaction_count?: number
}

// Define reaction types based on the backend model
const REACTION_TYPES = [
  { key: 'LIKE', label: 'Like', icon: ThumbsUp, color: 'text-blue-500' },
  { key: 'HELPFUL', label: 'Helpful', icon: Heart, color: 'text-green-500' },
  { key: 'IMPORTANT', label: 'Important', icon: AlertTriangle, color: 'text-yellow-500' },
  { key: 'FLAG', label: 'Flag', icon: Flag, color: 'text-red-500' },
]

// Map post types to colors for badges
const POST_TYPE_COLORS: Record<string, string> = {
  'UPDATE': 'bg-blue-500',
  'HELP_REQUEST': 'bg-red-500',
  'OFFER_HELP': 'bg-green-500',
  'INFO': 'bg-purple-500',
  'WARNING': 'bg-yellow-500',
}

export function CitizenFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
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
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() && !image) return

    setPosting(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const formData = new FormData()
      formData.append('content', newPost)
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/posts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in again')
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'Failed to create post')
      }

      const newPostData = await response.json()
      setPosts([newPostData, ...posts])
      setNewPost('')
      setImage(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/social/posts/${postId}/react/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in again')
          return
        }
        throw new Error('Failed to add reaction')
      }

      // Refresh posts to show updated reactions
      fetchPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction')
    } finally {
      setOpenDropdown(null)
    }
  }

  // Helper function to count reactions by type
  const countReactionsByType = (reactions: Reaction[], type: string): number => {
    return reactions?.filter(reaction => reaction.reaction_type === type).length || 0
  }

  // Helper function to check if current user has reacted with a specific type
  const hasUserReacted = (reactions: Reaction[], type: string): boolean => {
    const userId = localStorage.getItem('userId')
    if (!userId) return false
    
    return reactions?.some(reaction => 
      reaction.reaction_type === type && reaction.user.id.toString() === userId
    ) || false
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts or updates..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <Button type="submit" disabled={posting || (!newPost.trim() && !image)}>
                {posting ? 'Posting...' : 'Post'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 h-[calc(100vh-400px)] overflow-y-auto pr-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback>
                    {post.author.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{post.author.email}</p>
                        <Badge 
                          className={`${POST_TYPE_COLORS[post.post_type] || 'bg-gray-500'} text-white`}
                        >
                          {post.post_type_display}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu 
                        open={openDropdown === post.id}
                        onOpenChange={(open: boolean) => {
                          if (open) setOpenDropdown(post.id)
                          else setOpenDropdown(null)
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="p-2">
                          <div className="flex items-center gap-2">
                            {REACTION_TYPES.map((reaction) => (
                              <Button
                                key={reaction.key}
                                variant="ghost"
                                size="sm"
                                className="flex flex-col items-center p-2"
                                onClick={() => handleReaction(post.id, reaction.key)}
                              >
                                <reaction.icon className="h-5 w-5 mb-1" />
                                <span className="text-xs">{reaction.label}</span>
                              </Button>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post content"
                      className="rounded-lg max-h-[300px] object-cover"
                    />
                  )}
                  
                  {/* Reaction indicators */}
                  {post.reactions && post.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                      {REACTION_TYPES.map(reaction => {
                        const count = countReactionsByType(post.reactions, reaction.key);
                        const userReacted = hasUserReacted(post.reactions, reaction.key);
                        
                        if (count > 0) {
                          return (
                            <div 
                              key={reaction.key}
                              className={`flex items-center ${userReacted ? reaction.color : 'text-gray-500'} bg-gray-100 rounded-full px-3 py-1`}
                            >
                              <reaction.icon className="h-3 w-3 mr-1" />
                              <span className="text-xs font-medium">{count}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 