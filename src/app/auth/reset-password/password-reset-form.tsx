'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from './actions'

export default function PasswordResetForm() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const result = await resetPassword(formData)
    if (result.error) {
      setError(result.error)
      setMessage(null)
    } else {
      setMessage('Password reset instructions have been sent to your email.')
      setError(null)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="mt-1" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-500 text-sm">{message}</p>}
      <Button type="submit" className="w-full">Reset Password</Button>
    </form>
  )
}

