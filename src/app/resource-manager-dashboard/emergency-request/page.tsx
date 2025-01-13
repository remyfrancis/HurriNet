'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertTriangle, ArrowLeft } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  resourceType: z.string({
    required_error: "Please select a resource type.",
  }),
  quantity: z.number({
    required_error: "Please enter a quantity.",
    invalid_type_error: "Quantity must be a number.",
  }).positive({
    message: "Quantity must be a positive number.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  urgencyLevel: z.string({
    required_error: "Please select an urgency level.",
  }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
  contactName: z.string().min(2, {
    message: "Contact name must be at least 2 characters.",
  }),
  contactPhone: z.string().min(7, {
    message: "Please enter a valid phone number.",
  }),
})

export default function EmergencyResourceRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceType: "",
      quantity: undefined,
      location: "",
      urgencyLevel: "",
      reason: "",
      contactName: "",
      contactPhone: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    // In a real application, you would send this data to your backend
    console.log(values)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Emergency Resource Request Submitted",
        description: "Your request has been received and is being processed.",
      })
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push('/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
            Emergency Resource Request
          </CardTitle>
          <CardDescription>
            Submit an urgent request for emergency resources during a crisis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="resourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a resource type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="water">Drinking Water</SelectItem>
                        <SelectItem value="food">Non-perishable Food</SelectItem>
                        <SelectItem value="medical">Medical Supplies</SelectItem>
                        <SelectItem value="shelter">Temporary Shelter</SelectItem>
                        <SelectItem value="fuel">Fuel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of resource you urgently need.
                    </FormDescription>
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
                      <Input type="number" placeholder="Enter the quantity needed" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormDescription>
                      Specify the amount of the resource required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the delivery location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide the specific location where resources should be delivered.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Within 72 hours</SelectItem>
                        <SelectItem value="medium">Medium - Within 24 hours</SelectItem>
                        <SelectItem value="high">High - Within 6 hours</SelectItem>
                        <SelectItem value="critical">Critical - Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indicate how urgently these resources are needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Request</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why these resources are urgently needed" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context for your emergency resource request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a name for the point of contact.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a phone number where you can be reached.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Emergency Resource Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
