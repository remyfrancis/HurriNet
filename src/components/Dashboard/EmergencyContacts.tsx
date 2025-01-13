import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall } from 'lucide-react'

async function getEmergencyContacts(location: string) {
  // TODO: Implement actual API call to fetch emergency contacts
  return [
    { id: 1, name: "Emergency Services", number: "911" },
    { id: 2, name: "Saint Lucia Met Office", number: "+1 758-454-6550" },
    { id: 3, name: "National Emergency Management Organization", number: "+1 758-452-3802" },
    { id: 4, name: "Local Police Station", number: "+1 758-456-7890" },
  ]
}

export default async function EmergencyContacts({ location }: { location: string }) {
  const contacts = await getEmergencyContacts(location)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center space-x-2">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.number}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

