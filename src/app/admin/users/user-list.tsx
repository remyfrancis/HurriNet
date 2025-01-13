'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

// Mock user data
const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: true },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', active: false },
]

export default function UserList() {
  const [users, setUsers] = useState(initialUsers)

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Switch
                checked={user.active}
                onCheckedChange={() => toggleUserStatus(user.id)}
              />
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
              <Button variant="destructive" size="sm">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

