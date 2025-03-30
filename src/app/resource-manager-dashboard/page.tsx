'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Boxes, ClipboardList, AlertTriangle, ShieldCheck, Share2, ShoppingCart, PhoneCall, Truck, RefreshCw, MapPin } from 'lucide-react'
import { ResourceManagerNav } from './resource-manager-nav'
import { useRouter } from 'next/navigation'
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

// Minimal Distribution interface for this component
interface DashboardDistribution {
  id: number;
  resource_name: string;
  completion_rate: number;
  // Add other fields if needed for display
}

export default function ResourceManagerDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [stockLevels, setStockLevels] = useState<LocationStockLevels | null>(null)
  const [loadingStockLevels, setLoadingStockLevels] = useState(false)
  const [lastInventoryUpdate, setLastInventoryUpdate] = useState<string | null>(null)
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // State for dashboard distributions
  const [dashboardDistributions, setDashboardDistributions] = useState<DashboardDistribution[]>([]);
  const [loadingDistributions, setLoadingDistributions] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      setLoadingInitialData(true)
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('Authentication token not found.')
        }

        // Fetch last inventory update time
        const resLastUpdate = await fetch('/api/resource-management/inventory/last-update/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!resLastUpdate.ok) throw new Error('Failed to fetch last inventory update time')
        const dataLastUpdate = await resLastUpdate.json()
        if (dataLastUpdate.last_update) {
          // Format the date
          const date = new Date(dataLastUpdate.last_update)
          const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          setLastInventoryUpdate(formattedDate)
        } else {
          setLastInventoryUpdate('N/A')
        }

        // Fetch distributions in parallel
        await fetchDashboardDistributions(token);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err)
      } finally {
        setLoadingInitialData(false)
      }
    }

    fetchData()
  }, [])

  // Fetch distributions for the dashboard panel
  const fetchDashboardDistributions = async (token: string) => {
    setLoadingDistributions(true);
    try {
      console.log('Fetching distributions for dashboard...');
      const response = await fetch('/api/resource-management/distributions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error fetching distributions: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard Distributions data received:', data);

      let processedDistributions: DashboardDistribution[] = [];

      // Adapt processing logic from distribution/page.tsx if necessary
      // Assuming data might be GeoJSON FeatureCollection or direct array
      if (data.features) {
        processedDistributions = data.features.map((feature: any) => ({
          id: feature.id || feature.properties.id,
          resource_name: feature.properties.resource_name,
          completion_rate: feature.properties.completion_rate,
          // Map other needed fields
        }));
      } else if (Array.isArray(data)) {
        processedDistributions = data.map((dist: any) => ({
          id: dist.id,
          resource_name: dist.resource_name,
          completion_rate: dist.completion_rate,
          // Map other needed fields from direct array structure
        }));
      } else {
        console.warn('Unknown distributions data format for dashboard');
        processedDistributions = [];
      }

      // Shuffle and take top 5
      const shuffled = processedDistributions.sort(() => 0.5 - Math.random());
      setDashboardDistributions(shuffled.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard distributions:', err);
      setDashboardDistributions([]); // Clear on error
    } finally {
      setLoadingDistributions(false);
    }
  };

  const fetchStockLevels = async (resourceId: number) => {
    console.log('Fetching stock levels for resource:', resourceId);
    if (!resourceId) {
      console.log('No resource ID provided');
      return;
    }
    
    setLoadingStockLevels(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Making API request to:', `/api/resource-management/resources/${resourceId}/stock_levels/`);
      const response = await fetch(`/api/resource-management/resources/${resourceId}/stock_levels/`, {
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
      setLoadingStockLevels(false);
    }
  };

  const handleLocationSelect = (resourceId: number) => {
    console.log('Location selected:', resourceId);
    setSelectedLocation(resourceId);
    fetchStockLevels(resourceId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const mapPanelData = { 
    title: "Resource Locations", 
    icon: MapPin,
    content: (
      <div className="h-full">
        <DashboardResourceMap 
          onLocationSelect={(id) => {
            console.log('Map location selected:', id);
            handleLocationSelect(id);
          }} 
        />
      </div>
    )
  }

  // Remove 'emergency' and 'procurement' from this array
  const allPanels = [
    { 
      id: 'stock',
      title: stockLevels ? `Stock Assessment - ${stockLevels.resource_name}` : "Stock Assessment", 
      icon: ClipboardList,
      content: (
        <div>
          {loadingStockLevels ? (
            <p className="text-sm text-gray-500">Loading stock levels...</p>
          ) : stockLevels?.stock_levels ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(stockLevels.stock_levels).map(([itemType, data]) => (
                <li key={itemType} className={getStatusColor(data?.status)}>
                  {itemType.replace('_', ' ').toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}: {data?.status ?? 'N/A'}
                  <div className="ml-4 text-xs text-gray-500">
                    {data?.quantity ?? '?'}/{data?.capacity ?? '?'} ({data?.percentage?.toFixed(1) ?? '?'}%)
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
      id: 'distribution',
      title: "Distribution Highlights", 
      icon: Share2,
      content: (
        <div>
          {loadingDistributions ? (
            <p className="text-sm text-gray-500">Loading distributions...</p>
          ) : dashboardDistributions.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {dashboardDistributions.map((dist) => (
                <li key={dist.id} className="border-b pb-1 last:border-b-0">
                   <span className="font-medium">{dist.resource_name}</span>
                   <span className={`float-right text-xs px-1.5 py-0.5 rounded ${ 
                       dist.completion_rate >= 75 ? 'bg-green-100 text-green-800' :
                       dist.completion_rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                   }`}>
                     {dist.completion_rate?.toFixed(0) ?? '?'}% Done
                   </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No distribution data available.</p>
          )}
        </div>
      )
    },
    { 
      id: 'inventory',
      title: "Inventory Update", 
      icon: RefreshCw,
      content: (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="mb-2">Last update: {loadingInitialData ? 'Loading...' : lastInventoryUpdate || 'N/A'}</p>
          </div>
          <Button className="w-full">Update Inventory</Button>
        </div>
      )
    },
    { 
      id: 'validation',
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
  ];

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Resource Manager Dashboard</h1>
          
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column (Map + Buttons) */}
            {/* Wrap map card and button div in a flex-col container */}
            <div className="lg:w-3/4 flex flex-col gap-4">
              <Card className="hover:shadow-lg transition-shadow duration-300 flex-grow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{mapPanelData.title}</CardTitle>
                  <mapPanelData.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  {mapPanelData.content}
                </CardContent>
              </Card>

              {/* Div for the buttons below the map */}
              <div className="flex gap-4">
                <Button className="flex-1"> 
                  <AlertTriangle className="mr-2 h-4 w-4" /> New Emergency Request
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push('/resource-manager-dashboard/procurement')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> New Procurement
                </Button>
              </div>
            </div>

            {/* Right Column (Remaining Panels) */}
            <div className="lg:w-1/4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' }}> 
              {/* Simplify rendering - no more conditional logic needed here */}
              {allPanels.map((panel) => (
                <Card 
                  key={panel.id}
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
        </div>
      </main>
    </div>
  )
}