import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, Star, Search, Filter } from 'lucide-react'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['locations']['Row']
type ServiceWithDetails = Service & {
  category: Category | null
  profile: Profile | null
}

export const metadata = {
  title: 'Browse Services',
}

interface Props {
  searchParams: Promise<{
    category?: string
    state?: string
    city?: string
    q?: string
    type?: string
  }>
}

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentUserProfile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    currentUserProfile = data as Profile | null
  }

  // Get categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('sort_order')
  const categories = categoriesData as Category[] | null

  // Get states
  const { data: statesData } = await supabase
    .from('locations')
    .select('state, state_code')
    .order('state')
  const states = statesData as Pick<Location, 'state' | 'state_code'>[] | null

  const uniqueStates = [...new Set(states?.map((s) => s.state) || [])]

  // Build services query
  let query = supabase
    .from('services')
    .select(
      `
      *,
      category:categories(*),
      profile:profiles!services_user_id_fkey(*)
    `
    )
    .eq('status', 'active')
    .eq('type', params.type || 'offer')
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.category) {
    const { data: categoryLookup } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    const categoryData = categoryLookup as { id: string } | null

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  if (params.state) {
    query = query.eq('profile.state', params.state)
  }

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%`
    )
  }

  const { data: servicesData } = await query
  const services = servicesData as ServiceWithDetails[] | null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={currentUserProfile} />

      <main className="flex-1">
        <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Browse Services
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Find professionals offering skills you need
              </p>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <form className="flex flex-col gap-3 sm:gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      name="q"
                      placeholder="Search services..."
                      defaultValue={params.q}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                    <Select name="type" defaultValue={params.type || 'offer'}>
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offer">Services Offered</SelectItem>
                        <SelectItem value="need">Services Needed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select name="category" defaultValue={params.category}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select name="state" defaultValue={params.state}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All States</SelectItem>
                        {uniqueStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="submit" className="w-full sm:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/u/${service.profile?.display_name?.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage
                              src={service.profile?.avatar_url || undefined}
                              alt={service.profile?.display_name}
                            />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {service.profile?.display_name
                                ? getInitials(service.profile.display_name)
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                              {service.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {service.profile?.display_name}
                            </p>
                          </div>
                        </div>

                        {service.description && (
                          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        )}

                        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                          {service.category && (
                            <Badge variant="secondary" className="text-xs">
                              {service.category.name}
                            </Badge>
                          )}
                          {service.estimated_value && (
                            <Badge variant="outline" className="text-xs">
                              ${service.estimated_value.toLocaleString()}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                          {service.profile?.city && service.profile?.state && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {service.profile.city}, {service.profile.state}
                              </span>
                            </div>
                          )}
                          {service.profile?.avg_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span>
                                {service.profile.avg_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-8 sm:py-12 text-center">
                      <p className="text-sm sm:text-base text-muted-foreground">
                        No services found matching your criteria.
                      </p>
                      <Button variant="outline" className="mt-3 sm:mt-4" asChild>
                        <Link href="/browse">Clear Filters</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
