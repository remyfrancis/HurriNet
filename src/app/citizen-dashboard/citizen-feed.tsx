'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Send, Image as ImageIcon } from 'lucide-react'

interface Post {
  id: number
  content: string
  image_url?: string
  created_at: string
  author: {
    id: number
    email: string
    avatar_url?: string
  }
}

export function CitizenFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          'Authorization': token,
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
          'Authorization': token,
        },
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in again')
          return
        }
        throw new Error('Failed to create post')
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

      <div className="space-y-4">
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
                      <p className="font-semibold">{post.author.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post content"
                      className="rounded-lg max-h-[300px] object-cover"
                    />
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