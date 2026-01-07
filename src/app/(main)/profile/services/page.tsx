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
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{service.title}</h3>
              <Badge
                variant={service.status === 'active' ? 'default' : 'secondary'}
              >
                {service.status}
              </Badge>
            </div>
            {service.category && (
              <Badge variant="outline">{service.category.name}</Badge>
            )}
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {service.estimated_value && (
                <span>Est. ${service.estimated_value.toLocaleString()}</span>
              )}
              <span>{service.service_radius_miles} mi radius</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground">
            Manage what you offer and what you need
          </p>
        </div>
        <Button asChild>
          <Link href="/profile/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offers">
            Offers ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="needs">
            Needs ({needs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {offers.length > 0 ? (
            offers.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t added any services you offer yet.
                </p>
                <Button asChild>
                  <Link href="/profile/services/new?type=offer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service You Offer
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="needs" className="space-y-4">
          {needs.length > 0 ? (
            needs.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t added any services you need yet.
                </p>
                <Button asChild>
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
