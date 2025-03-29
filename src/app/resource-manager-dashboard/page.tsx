'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Boxes, ClipboardList, AlertTriangle, ShieldCheck, Share2, ShoppingCart, PhoneCall, Truck, RefreshCw, MapPin } from 'lucide-react'
import { ResourceManagerNav } from './resource-manager-nav'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'
import { DashboardResourceMap } from '@/components/DashboardResourceMap'

// export const metadata: Metadata = {
//   title: 'Resource Manager Dashboard',
//   description: 'Resource management and distribution dashboard',
// }

interface StockLevel {
  quantity: number;
  capacity: number;
  status: 'Low' | 'Moderate' | 'Sufficient';
  percentage: number;
}

interface LocationStockLevels {
  resource_name: string;
  stock_levels: {
    [key: string]: StockLevel;
  };
}

export default function ResourceManagerDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [stockLevels, setStockLevels] = useState<LocationStockLevels | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const fetchStockLevels = async (resourceId: number) => {
    console.log('Fetching stock levels for resource:', resourceId);
    if (!resourceId) {
      console.log('No resource ID provided');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Making API request to:', `/api/inventory/stock-status/?resource_id=${resourceId}`);
      const response = await fetch(`/api/inventory/stock-status/?resource_id=${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stock levels');
      const data = await response.json();
      console.log('Received stock levels:', data);
      setStockLevels(data);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      setStockLevels(null); // Reset stock levels on error
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (resourceId: number) => {
    console.log('Location selected:', resourceId);
    setSelectedLocation(resourceId);
    fetchStockLevels(resourceId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'low':
        return 'text-red-600'
      case 'moderate':
        return 'text-yellow-600'
      case 'sufficient':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const mainPanel = { 
    title: "Resource Locations", 
    icon: MapPin,
    content: (
      <div className="h-[300px]">
        <DashboardResourceMap 
          onLocationSelect={(id) => {
            console.log('Map location selected:', id);
            handleLocationSelect(id);
          }} 
        />
      </div>
    )
  }

  const sidePanels = [
    { 
      title: stockLevels ? `Stock Assessment - ${stockLevels.resource_name}` : "Stock Assessment", 
      icon: ClipboardList,
      content: (
        <div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading stock levels...</p>
          ) : stockLevels ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(stockLevels.stock_levels).map(([itemType, data]) => (
                <li key={itemType} className={getStatusColor(data.status)}>
                  {itemType.replace('_', ' ').toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}: {data.status}
                  <div className="ml-4 text-xs text-gray-500">
                    {data.quantity}/{data.capacity} ({data.percentage.toFixed(1)}%)
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Select a location to view stock levels</p>
          )}
        </div>
      )
    },
    { 
      title: "Distribution", 
      icon: Share2,
      content: (
        <div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Castries: Water</li>
            <li>Gros Islet: Medical</li>
            <li>Vieux Fort: Food</li>
          </ul>
        </div>
      )
    },
    { 
      title: "Delivery Tracking", 
      icon: Truck,
      content: (
        <div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Water: ETA 2 days</li>
            <li>Medical: ETA 1 week</li>
          </ul>
        </div>
      )
    },
  ]

  const mainPanels = [
    { 
      title: "Emergency Request", 
      icon: AlertTriangle,
      content: (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="mb-2">Submit urgent request:</p>
          </div>
          <Button className="w-full">New Emergency Request</Button>
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
  ]

  const halfWidthPanels = [
    { 
      title: "Inventory Update", 
      icon: RefreshCw,
      content: (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="mb-2">Last update: 2023-06-20</p>
          </div>
          <Button className="w-full">Update Inventory</Button>
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
  ]

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Resource Manager Dashboard</h1>
          
          <div className="space-y-6">
            {/* Top section with main panel and side panels */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Main map panel */}
              <Card className="lg:col-span-3 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{mainPanel.title}</CardTitle>
                  <mainPanel.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {mainPanel.content}
                </CardContent>
              </Card>

              {/* Side panels stack */}
              <div className="space-y-4">
                {sidePanels.map((panel, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
                      <panel.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {panel.content}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main panels section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainPanels.map((panel, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
                    <panel.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)] flex flex-col">
                    {panel.content}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Half width panels section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {halfWidthPanels.map((panel, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
                    <panel.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)] flex flex-col">
                    {panel.content}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}