'use client'

import { useSupplierUpdates } from '@/contexts/SupplierUpdatesContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
  pending: 'bg-yellow-500',
  shipped: 'bg-blue-500',
  delivered: 'bg-green-500'
}

export default function SupplierUpdates() {
  const { updates } = useSupplierUpdates()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{update.supplier}</p>
                  <p className="text-sm text-gray-500">{update.item}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusColors[update.status]}>
                    {update.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}