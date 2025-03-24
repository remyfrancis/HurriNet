'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Clock, CheckCircle2, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerificationPending() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="flex-1 p-10 bg-background flex items-center justify-center">
        <div className="max-w-xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl text-center">Verification Pending</CardTitle>
              <CardDescription className="text-center">
                Your account is awaiting verification by our administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>What happens next?</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Our administrators will review your credentials and verify your account</li>
                    <li>This process typically takes 24-48 hours</li>
                    <li>You will receive an email notification once your account is verified</li>
                    <li>After verification, you can log in and access all features</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">While you wait:</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Make sure to check your email (including spam folder) for updates</li>
                  <li>Prepare any additional documentation that may be requested</li>
                  <li>You can still access public information on our platform</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Return to Login
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/')}
              >
                Go to Home Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="flex-1 bg-primary/5 hidden lg:flex flex-col items-center justify-center p-10">
        <div className="max-w-md space-y-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Shield className="h-24 w-24 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Emergency Personnel Verification
            </h2>
            <p className="text-muted-foreground">
              We take the security of our emergency response system seriously. 
              Our verification process ensures that only authorized personnel 
              have access to critical emergency response tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Review Process</h3>
                <p className="text-sm text-muted-foreground">24-48 hour verification timeline</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Thorough Verification</h3>
                <p className="text-sm text-muted-foreground">Credentials checked by administrators</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Email Notification</h3>
                <p className="text-sm text-muted-foreground">Instant alert upon verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 