import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {


  // Original code commented out for testing:
  try {
    // Get the auth token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // First, fetch required data from Django backend
    const [inventoryResponse, resourcesResponse, suppliersResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/resource-management/inventory/`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/resource-management/resources/`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/resource-management/suppliers/`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      })
    ])

    if (!inventoryResponse.ok || !resourcesResponse.ok || !suppliersResponse.ok) {
      const errorMessages = await Promise.all([
        inventoryResponse.text().catch(() => 'Unknown error'),
        resourcesResponse.text().catch(() => 'Unknown error'),
        suppliersResponse.text().catch(() => 'Unknown error')
      ])
      throw new Error(`Failed to fetch required data: ${errorMessages.join(', ')}`)
    }

    const [inventory, resources, suppliers] = await Promise.all([
      inventoryResponse.json(),
      resourcesResponse.json(),
      suppliersResponse.json()
    ])


    // Transform data for optimization
    const items = inventory
      .filter((item: any) => item.quantity > 0 && !item.resource && item.supplier?.id)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        supplier_id: item.supplier.id
      }))

    const resourcesList = resources.features.map((feature: any) => ({
      id: feature.id,
      name: feature.properties.name,
      capacity: feature.properties.capacity,
      current_count: feature.properties.current_count,
      location: feature.properties.location ? {
        lat: feature.properties.location.coordinates[1],
        lng: feature.properties.location.coordinates[0]
      } : { lat: 0, lng: 0 }
    }))

    const suppliersList = suppliers.features.map((feature: any) => ({
      id: feature.id,
      name: feature.properties.name,
      location: feature.properties.location ? {
        lat: feature.properties.location.coordinates[1],
        lng: feature.properties.location.coordinates[0]
      } : { lat: 0, lng: 0 }
    }))


    // Forward the optimization request to Django backend with the prepared data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/resource-management/inventory/optimize_allocation/`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          resources: resourcesList,
          suppliers: suppliersList
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || 'Failed to run optimization algorithm')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error("Error in optimization algorithm:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to run optimization algorithm" 
      }, 
      { status: 500 }
    )
  }
  // */
} 