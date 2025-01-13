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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search } from 'lucide-react'

// Sample data
const supplierContacts = [
  { id: 1, name: "St. Lucia Medical Supplies Ltd.", email: "info@slmedsupplies.com", phone: "+1 758-123-4567" },
  { id: 2, name: "Caribbean Food Distributors", email: "orders@caribfood.com", phone: "+1 758-234-5678" },
  { id: 3, name: "Island Water Company", email: "sales@islandwater.com", phone: "+1 758-345-6789" },
]

const inventoryItems = [
  { id: 1, name: "Water Bottles", currentStock: 5000, supplier: "Island Water Company" },
  { id: 2, name: "First Aid Kits", currentStock: 500, supplier: "St. Lucia Medical Supplies Ltd." },
  { id: 3, name: "Canned Food", currentStock: 10000, supplier: "Caribbean Food Distributors" },
]

export default function Procurement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Array<{ id: number, item: string, quantity: number, supplier: string, status: string }>>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('')

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const placeOrder = () => {
    if (selectedItem && selectedSupplier && orderQuantity) {
      const newOrder = {
        id: orders.length + 1,
        item: selectedItem,
        quantity: parseInt(orderQuantity),
        supplier: selectedSupplier,
        status: 'Pending'
      }
      setOrders([...orders, newOrder])
      setSelectedItem('')
      setSelectedSupplier('')
      setOrderQuantity('')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Procurement</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Place New Order</h2>
        <div className="flex flex-wrap gap-4">
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.map((item) => (
                <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {supplierContacts.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Quantity"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            className="w-[150px]"
          />
          <Button onClick={placeOrder}>Place Order</Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Orders</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.item}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Inventory Items</h2>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search items or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.currentStock}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Order</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Place Order for {item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="order-quantity" className="text-right">
                            Quantity
                          </Label>
                          <Input
                            id="order-quantity"
                            type="number"
                            className="col-span-3"
                            onChange={(e) => setOrderQuantity(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          placeOrder();
                          setSelectedItem(item.name);
                          setSelectedSupplier(item.supplier);
                        }}>
                          Place Order
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Supplier Contacts</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplierContacts.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

