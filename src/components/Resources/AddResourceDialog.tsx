'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  unit: z.string().min(1, 'Unit is required'),
  capacity: z.number().min(1, 'Capacity must be greater than 0'),
})

interface AddResourceDialogProps {
  onResourceAdded: () => void
}

export function AddResourceDialog({ onResourceAdded }: AddResourceDialogProps) {
  const [open, setOpen] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      unit: '',
      capacity: 0,
    },
  })

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource-management/inventory/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to add resource')
      }

      onResourceAdded()
    } catch (error) {
      console.error('Error adding resource:', error)
      // Handle error (show error message to user)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Resource</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Resource</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}