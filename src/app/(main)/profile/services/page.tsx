import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Service = Database['public']['Tables']['services']['Row']
type ServiceWithCategory = Service & { category: Category | null }

export const metadata = {
  title: 'My Services',
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: servicesData } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const services = servicesData as ServiceWithCategory[] | null
  const offers = services?.filter((s) => s.type === 'offer') || []
  const needs = services?.filter((s) => s.type === 'need') || []

  const ServiceCard = ({ service }: { service: ServiceWithCategory }) => (
    <Card>
      <CardContent className="p-4 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base truncate">{service.title}</h3>
              <Badge
                variant={service.status === 'active' ? 'default' : 'secondary'}
                className="text-xs shrink-0"
              >
                {service.status}
              </Badge>
            </div>
            {service.category && (
              <Badge variant="outline" className="text-xs">{service.category.name}</Badge>
            )}
            {service.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-2">
                {service.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
              {service.estimated_value && (
                <span>Est. ${service.estimated_value.toLocaleString()}</span>
              )}
              <span>{service.service_radius_miles} mi radius</span>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
              <Link href={`/profile/services/${service.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Services</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage what you offer and what you need
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/profile/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="offers" className="space-y-3 sm:space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="offers" className="flex-1 sm:flex-initial text-xs sm:text-sm">
            Offers ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="needs" className="flex-1 sm:flex-initial text-xs sm:text-sm">
            Needs ({needs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-3 sm:space-y-4">
          {offers.length > 0 ? (
            offers.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  You haven&apos;t added any services you offer yet.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/profile/services/new?type=offer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service You Offer
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="needs" className="space-y-3 sm:space-y-4">
          {needs.length > 0 ? (
            needs.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  You haven&apos;t added any services you need yet.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/profile/services/new?type=need">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service You Need
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
