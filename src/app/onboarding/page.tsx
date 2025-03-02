'use client'

import { useState } from 'react'
import { Shield, Stethoscope, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: 'emergency',
      title: 'Emergency Personnel',
      description: 'First responders, emergency coordinators, and disaster management teams',
      icon: Shield,
      path: '/onboarding/emergency'
    },
    {
      id: 'resource',
      title: 'Resource Manager',
      description: 'Manage and coordinate emergency supplies, equipment, and facilities',
      icon: Building2,
      path: '/onboarding/resource'
    },
    {
      id: 'medical',
      title: 'Medical Personnel',
      description: 'Healthcare providers, medical coordinators, and emergency medical staff',
      icon: Stethoscope,
      path: '/onboarding/medical'
    }
  ]

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
  }

  const handleContinue = () => {
    const selectedRoleData = roles.find(role => role.id === selectedRole)
    if (selectedRoleData) {
      router.push(selectedRoleData.path)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="space-y-6 text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to HurriNet Personnel Onboarding</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select your role to begin the verification process. This helps us ensure the right access 
          and tools are provided to authorized emergency response personnel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedRole === role.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          size="lg"
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Continue with Verification
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Are you a citizen looking to register for alerts?{" "}
          <a href="/auth/register" className="text-primary hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
} 