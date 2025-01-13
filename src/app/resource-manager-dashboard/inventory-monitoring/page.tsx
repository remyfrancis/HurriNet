'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ArrowUpDown, AlertCircle } from 'lucide-react'
import { useRouter } from "next/navigation"


// Sample data
const inventoryItems = [
  { item_name: "Water Bottles", quantity: 5000, district: "Castries", storage_center: "Central Warehouse", item_id: "WB001", date_last_counted: "2023-06-15", status: "Adequate" },
  { item_name: "First Aid Kits", quantity: 500, district: "Gros Islet", storage_center: "North Emergency Center", item_id: "FAK001", date_last_counted: "2023-06-14", status: "Low" },
  { item_name: "Blankets", quantity: 1000, district: "Vieux Fort", storage_center: "South Storage Facility", item_id: "BL001", date_last_counted: "2023-06-13", status: "Adequate" },
  { item_name: "Canned Food", quantity: 10000, district: "Soufriere", storage_center: "West Distribution Center", item_id: "CF001", date_last_counted: "2023-06-12", status: "Adequate" },
  { item_name: "Flashlights", quantity: 2000, district: "Micoud", storage_center: "East Supply Depot", item_id: "FL001", date_last_counted: "2023-06-11", status: "Adequate" },
]

type SortKey = keyof typeof inventoryItems[0]

export default function InventoryMonitoring() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('item_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedItems = [...inventoryItems].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const filteredItems = sortedItems.filter(item =>
    Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Monitoring</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
        <div className="flex gap-4"> {/* Add this wrapper div with gap */}
            <Button size="lg">Add New Item</Button>
            <Button 
            variant="destructive"
            size="lg"
            onClick={() => router.push('/resource-manager-dashboard/emergency-request')}
            >
            <AlertCircle className="h-5 w-5" />
            Request Emergency Supplies
            </Button>
        </div>
        </div>
        <div>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(inventoryItems[0]).map((key) => (
                <TableHead key={key}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(key as SortKey)}
                    className="hover:bg-transparent"
                  >
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => (
              <TableRow key={index}>
                {Object.values(item).map((value, valueIndex) => (
                  <TableCell key={valueIndex}>{value}</TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                      <DropdownMenuItem>Update Count</DropdownMenuItem>
                      {item.status === "Low" && (
                        <DropdownMenuItem onClick={() => router.push('/resource-manager-dashboard/procurement')}>
                          Procure
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
