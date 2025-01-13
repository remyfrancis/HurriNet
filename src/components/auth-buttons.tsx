import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function AuthButtons() {
  return (
    <div className="space-x-2">
      <Button asChild variant="secondary">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/register">Register</Link>
      </Button>
    </div>
  )
}

