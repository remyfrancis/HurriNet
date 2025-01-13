'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Boxes, ClipboardList, AlertTriangle, ShieldCheck, Share2, ShoppingCart, PhoneCall, Truck, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)

  const panels = [
    { 
      title: "Inventory Monitoring", 
      icon: Boxes,
      content: (
        <div>
          <p className="mb-2">Current stock levels:</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Water</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Food</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Medical Supplies</span>
                <span>40%</span>
              </div>
              <Progress value={40} className="w-full" />
            </div>
          </div>
        </div>
      )
    },
    { 
      title: "Stock Assessment", 
      icon: ClipboardList,
      content: (
        <div>
          <p className="mb-2">Stock adequacy:</p>
          <ul className="list-disc list-inside space-y-1">
            <li className="text-green-600">Water: Sufficient</li>
            <li className="text-yellow-600">Food: Moderate</li>
            <li className="text-red-600">Medical Supplies: Low</li>
          </ul>
        </div>
      )
    },
    { 
      title: "Emergency Request", 
      icon: AlertTriangle,
      content: (
        <div>
          <p className="mb-2">Submit urgent request:</p>
          <Button className="w-full">New Emergency Request</Button>
        </div>
      )
    },
    { 
      title: "Resource Validation", 
      icon: ShieldCheck,
      content: (
        <div>
          <p className="mb-2">Last validation:</p>
          <p className="font-semibold">2023-06-15</p>
          <Button className="w-full mt-2">Start New Validation</Button>
        </div>
      )
    },
    { 
      title: "Distribution", 
      icon: Share2,
      content: (
        <div>
          <p className="mb-2">Active distributions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Castries: Water, Food</li>
            <li>Gros Islet: Medical Supplies</li>
            <li>Vieux Fort: Food</li>
          </ul>
        </div>
      )
    },
    { 
      title: "Procurement", 
      icon: ShoppingCart,
      content: (
        <div>
          <p className="mb-2">Pending orders:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Medical Supplies: 500 units</li>
            <li>Non-perishable Food: 1000 kg</li>
          </ul>
          <Button className="w-full mt-2">New Procurement</Button>
        </div>
      )
    },
    { 
      title: "Supplier Contact", 
      icon: PhoneCall,
      content: (
        <div>
          <p className="mb-2">Key suppliers:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>St. Lucia Medical Supplies Ltd.</li>
            <li>Caribbean Food Distributors</li>
            <li>Island Water Company</li>
          </ul>
          <Button className="w-full mt-2">Contact Supplier</Button>
        </div>
      )
    },
    { 
      title: "Delivery Tracking", 
      icon: Truck,
      content: (
        <div>
          <p className="mb-2">Incoming deliveries:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Water: ETA 2 days</li>
            <li>Medical Supplies: ETA 1 week</li>
          </ul>
        </div>
      )
    },
    { 
      title: "Inventory Update", 
      icon: RefreshCw,
      content: (
        <div>
          <p className="mb-2">Last update: 2023-06-20</p>
          <Button className="w-full">Update Inventory</Button>
        </div>
      )
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Saint Lucia Emergency Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {panels.map((panel, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer ${selectedPanel === panel.title ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedPanel(panel.title)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
              <panel.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {selectedPanel === panel.title ? (
                panel.content
              ) : (
                <>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Click to view details
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}