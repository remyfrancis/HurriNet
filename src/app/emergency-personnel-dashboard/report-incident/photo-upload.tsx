'use client'

import { useState, useRef } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera } from 'lucide-react'
import Image from 'next/image'

export default function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Photo (optional)</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button type="button" variant="outline" onClick={handleCameraClick}>
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        {preview && (
          <div className="relative h-20 w-20">
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  )
}

