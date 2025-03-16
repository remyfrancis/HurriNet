'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminNav } from '../../admin-nav'
import { ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateAlertForm {
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
}

const initialForm: CreateAlertForm = {
  title: '',
  type: '',
  severity: 'Medium',
  district: 'All',
  active: true,
}

export default function CreateAlertPage() {
  const router = useRouter()
  const [form, setForm] = useState<CreateAlertForm>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to create alert')
      }

      router.push('/admin-dashboard/alerts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav className="w-64 border-r bg-background hidden md:block" />
      
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Alert</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alert Details</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter alert title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g., Weather, Medical, Emergency"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={form.severity}
                  onValueChange={(value) =>
                    setForm({ ...form, severity: value as 'High' | 'Medium' | 'Low' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={form.district}
                  onValueChange={(value) => setForm({ ...form, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Districts</SelectItem>
                    <SelectItem value="Castries">Castries</SelectItem>
                    <SelectItem value="Gros Islet">Gros Islet</SelectItem>
                    <SelectItem value="Vieux Fort">Vieux Fort</SelectItem>
                    <SelectItem value="Soufriere">Soufriere</SelectItem>
                    <SelectItem value="Micoud">Micoud</SelectItem>
                    <SelectItem value="Dennery">Dennery</SelectItem>
                    <SelectItem value="Laborie">Laborie</SelectItem>
                    <SelectItem value="Choiseul">Choiseul</SelectItem>
                    <SelectItem value="Anse La Raye">Anse La Raye</SelectItem>
                    <SelectItem value="Canaries">Canaries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={form.active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, active: checked as boolean })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Alert'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 