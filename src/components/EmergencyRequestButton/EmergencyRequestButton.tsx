'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export default function EmergencyRequestButton() {
  const router = useRouter()

  return (
    <Button 
      variant="destructive"
      size="lg"
      onClick={() => router.push('/emergency-request')}
      className="flex items-center gap-2"
    >
      <AlertCircle className="h-5 w-5" />
      Request Emergency Assistance
    </Button>
  )
}