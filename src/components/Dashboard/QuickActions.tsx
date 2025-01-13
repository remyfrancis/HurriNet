import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, FileText, MapPin, Phone } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { icon: AlertTriangle, label: "Report Incident", href: "/dashboard/report-incident" },
    { icon: MapPin, label: "Evacuation Routes", href: "/dashboard/evacuation-routes" },
    { icon: FileText, label: "Preparedness Checklist", href: "/dashboard/preparedness-checklist" },
    { icon: Phone, label: "Request Assistance", href: "/dashboard/request-assistance" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button key={action.label} asChild variant="outline" className="h-20 w-full">
              <Link href={action.href} className="flex flex-col items-center justify-center space-y-2">
                <action.icon className="h-5 w-5" />
                <span>{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

