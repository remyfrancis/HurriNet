import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall } from 'lucide-react'

const emergencyContacts = [
  { id: 1, name: "Emergency Services", number: "911" },
  { id: 2, name: "Saint Lucia Met Office", number: "+1 758-454-6550" },
  { id: 3, name: "National Emergency Management Organization", number: "+1 758-452-3802" },
]

export default function EmergencyContacts() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Emergency Contact Numbers</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {emergencyContacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{contact.name}</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contact.number}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

