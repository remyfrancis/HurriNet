/**
 * Hungarian Algorithm Implementation for Resource Allocation
 *
 * This is a simplified implementation of the Hungarian algorithm
 * for optimal assignment problems. In a real application, this would
 * be more complex and handle various constraints.
 */

type Item = {
    id: number
    name: string
    quantity: number
    supplier_id: number
  }
  
  type Resource = {
    id: number
    name: string
    capacity: number
    currentCount: number
    location: { lat: number; lng: number }
  }
  
  type Supplier = {
    id: number
    name: string
    location: { lat: number; lng: number }
  }
  
  type AllocationResult = {
    supplierId: number
    supplierName: string
    resourceId: number
    resourceName: string
    itemId: number
    itemName: string
    quantity: number
  }
  
  /**
   * Calculate distance between two geographic points
   */
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two points on Earth
    const R = 6371 // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
  
  /**
   * Generate cost matrix based on distance and other factors
   */
  function generateCostMatrix(items: Item[], resources: Resource[], suppliers: Supplier[]): number[][] {
    const costMatrix: number[][] = []
  
    // For each item (from a supplier)
    for (let i = 0; i < items.length; i++) {
      costMatrix[i] = []
      const item = items[i]
      const supplier = suppliers.find((s) => s.id === item.supplier_id)
  
      if (!supplier) continue
  
      // For each resource (destination)
      for (let j = 0; j < resources.length; j++) {
        const resource = resources[j]
  
        // Calculate base cost as distance
        let cost = calculateDistance(
          supplier.location.lat,
          supplier.location.lng,
          resource.location.lat,
          resource.location.lng,
        )
  
        // Add penalty if resource is near capacity
        const capacityRatio = resource.currentCount / resource.capacity
        if (capacityRatio > 0.8) {
          cost += 50
        }
  
        // Add penalty if item quantity is low
        if (item.quantity < 10) {
          cost += 30
        }
  
        costMatrix[i][j] = cost
      }
    }
  
    return costMatrix
  }
  
  /**
   * Find minimum value in each row and subtract from all elements in that row
   */
  function reduceRows(matrix: number[][]): number[][] {
    const result = matrix.map((row) => {
      const min = Math.min(...row)
      return row.map((val) => val - min)
    })
    return result
  }
  
  /**
   * Find minimum value in each column and subtract from all elements in that column
   */
  function reduceColumns(matrix: number[][]): number[][] {
    const result = [...matrix]
    const numRows = matrix.length
    const numCols = matrix[0].length
  
    for (let j = 0; j < numCols; j++) {
      let min = Number.POSITIVE_INFINITY
      for (let i = 0; i < numRows; i++) {
        if (result[i][j] < min) {
          min = result[i][j]
        }
      }
  
      for (let i = 0; i < numRows; i++) {
        result[i][j] -= min
      }
    }
  
    return result
  }
  
  /**
   * Find a set of independent zeros that covers all zeros in the matrix
   */
  function findOptimalAssignment(matrix: number[][]): number[][] {
    const numRows = matrix.length
    const numCols = matrix[0].length
    const assignment: number[][] = Array(numRows)
      .fill(null)
      .map(() => Array(numCols).fill(0))
  
    // This is a simplified version - a real implementation would use the full Hungarian algorithm
    // with alternating paths to find the optimal assignment
  
    // For demonstration, we'll use a greedy approach
    const assignedRows = new Set<number>()
    const assignedCols = new Set<number>()
  
    // First pass: assign zeros where there's only one in a row or column
    for (let i = 0; i < numRows; i++) {
      if (assignedRows.has(i)) continue
  
      const zerosInRow = matrix[i].map((val, idx) => (val === 0 ? idx : -1)).filter((idx) => idx !== -1)
  
      if (zerosInRow.length === 1) {
        const j = zerosInRow[0]
        if (!assignedCols.has(j)) {
          assignment[i][j] = 1
          assignedRows.add(i)
          assignedCols.add(j)
        }
      }
    }
  
    // Second pass: assign remaining zeros greedily
    for (let i = 0; i < numRows; i++) {
      if (assignedRows.has(i)) continue
  
      for (let j = 0; j < numCols; j++) {
        if (assignedCols.has(j)) continue
  
        if (matrix[i][j] === 0) {
          assignment[i][j] = 1
          assignedRows.add(i)
          assignedCols.add(j)
          break
        }
      }
    }
  
    return assignment
  }
  
  /**
   * Main function to run the Hungarian algorithm
   */
  export function runHungarianAlgorithm(items: Item[], resources: Resource[], suppliers: Supplier[]): AllocationResult[] {
    // Generate cost matrix
    let costMatrix = generateCostMatrix(items, resources, suppliers)
  
    // Reduce rows and columns
    costMatrix = reduceRows(costMatrix)
    costMatrix = reduceColumns(costMatrix)
  
    // Find optimal assignment
    const assignment = findOptimalAssignment(costMatrix)
  
    // Convert assignment matrix to allocation results
    const results: AllocationResult[] = []
  
    for (let i = 0; i < assignment.length; i++) {
      for (let j = 0; j < assignment[i].length; j++) {
        if (assignment[i][j] === 1) {
          const item = items[i]
          const resource = resources[j]
          const supplier = suppliers.find((s) => s.id === item.supplier_id)
  
          if (item && resource && supplier) {
            // Calculate appropriate quantity to allocate
            const availableSpace = resource.capacity - resource.currentCount
            const quantityToAllocate = Math.min(item.quantity, Math.max(10, Math.floor(availableSpace * 0.5)))
  
            results.push({
              supplierId: supplier.id,
              supplierName: supplier.name,
              resourceId: resource.id,
              resourceName: resource.name,
              itemId: item.id,
              itemName: item.name,
              quantity: quantityToAllocate,
            })
          }
        }
      }
    }
  
    return results
  }