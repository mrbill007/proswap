'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/types/database'

const serviceSchema = z.object({
  type: z.enum(['offer', 'need']),
  category_id: z.string().min(1, 'Please select a category'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  estimated_value: z.string().optional(),
  service_radius_miles: z.string(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

export default function NewServicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') as 'offer' | 'need' | null
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: defaultType || 'offer',
      category_id: '',
      title: '',
      description: '',
      estimated_value: '',
      service_radius_miles: '25',
    },
  })

  const selectedCategoryId = form.watch('category_id')

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('sort_order')

      setCategories(data || [])
    }

    loadCategories()
  }, [supabase])

  useEffect(() => {
    async function loadSubcategories() {
      if (!selectedCategoryId) {
        setSubcategories([])
        return
      }

      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', selectedCategoryId)
        .order('sort_order')

      setSubcategories(data || [])
    }

    loadSubcategories()
  }, [selectedCategoryId, supabase])

  async function onSubmit(data: ServiceFormData) {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('services').insert({
      user_id: user.id,
      type: data.type,
      category_id: data.category_id,
      title: data.title,
      description: data.description || null,
      estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null,
      service_radius_miles: parseInt(data.service_radius_miles, 10) || 25,
      status: 'pending', // First listing goes to moderation
    } as never)

    if (error) {
      toast.error('Failed to create service')
      setIsLoading(false)
      return
    }

    toast.success(
      'Service created! It will be visible after moderation review.'
    )
    router.push('/profile/services')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Service</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create a new service listing
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Service Details</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Describe the service you offer or need
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={field.value === 'offer' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => field.onChange('offer')}
                        >
                          I Offer This
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'need' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => field.onChange('need')}
                        >
                          I Need This
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value === 'offer'
                        ? 'A service you can provide to others'
                        : 'A service you are looking for'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {subcategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={
                          subcategories.find((s) => s.id === field.value)
                            ? field.value
                            : ''
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Professional Web Development"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your service in detail..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/1000 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estimated_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : ''
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Approximate dollar value of this service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_radius_miles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Radius (miles)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={500} {...field} />
                      </FormControl>
                      <FormDescription>
                        How far you&apos;re willing to travel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Service
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
