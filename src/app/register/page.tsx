import Image from "next/image"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import RegisterForm from './register-form'
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Registration Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-muted">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex items-center gap-2">
            <Image 
              src="/hurrinet_logo.png" 
              alt="HurriNet Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold">HurriNet</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Join Saint Lucia's Hurricane Network and stay prepared
            </p>
          </div>
          <RegisterForm />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Hero Content */}
      <div className="relative hidden lg:flex items-center bg-gradient-to-b from-blue-50 to-blue-100 p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm mb-8">
            <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
            <span className="text-blue-800">Saint Lucia's Official Hurricane Network</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Stay Informed and Prepared
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get real-time alerts, access evacuation routes, and connect with emergency services.
          </p>
          <div className="space-y-4">
            <div className="rounded-lg border bg-background/60 backdrop-blur p-4">
              <h3 className="font-semibold mb-2">Why Register?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Receive personalized alerts based on your location</li>
                <li>• Access detailed evacuation routes and shelter information</li>
                <li>• Connect with local emergency response teams</li>
                <li>• Get real-time updates during emergencies</li>
              </ul>
            </div>
            <div className="mt-8 flex items-center text-sm">
              <Image 
                src="/hurrinet_logo.png" 
                alt="HurriNet Logo" 
                width={16} 
                height={16} 
                className="h-4 w-4 mr-2"
              />
              <span>Trusted by NEMO and local emergency response teams</span>
            </div>
          </div>
        </div>
        
        <div 
          style={{ 
            backgroundImage: "url('/hurricane.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }} 
          className="absolute inset-0" 
        />
      </div>
    </div>
  )
}

