import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftRight,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
  User,
  Eye,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Service = Database['public']['Tables']['services']['Row'] & {
  category: Database['public']['Tables']['categories']['Row'] | null
}
type Exchange = Database['public']['Tables']['exchanges']['Row']

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()
  const profile = profileData as Profile | null

  // Get user's services
  const { data: servicesData } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
  const services = servicesData as Service[] | null

  // Get user's exchanges
  const { data: exchangesData } = await supabase
    .from('exchanges')
    .select('*')
    .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
    .order('proposed_at', { ascending: false })
    .limit(5)
  const exchanges = exchangesData as Exchange[] | null

  // Get unread message count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null)
    .neq('sender_id', user!.id)

  const offers = services?.filter((s) => s.type === 'offer') || []
  const needs = services?.filter((s) => s.type === 'need') || []
  const activeExchanges = exchanges?.filter((e) => e.status !== 'completed' && e.status !== 'cancelled') || []

  const stats = [
    {
      name: 'Services Offered',
      value: offers.length,
      icon: TrendingUp,
      href: '/profile/services',
    },
    {
      name: 'Services Needed',
      value: needs.length,
      icon: Eye,
      href: '/profile/services',
    },
    {
      name: 'Active Exchanges',
      value: activeExchanges.length,
      icon: ArrowLeftRight,
      href: '/exchanges',
    },
    {
      name: 'Unread Messages',
      value: unreadCount || 0,
      icon: MessageSquare,
      href: '/messages',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.display_name || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your trades.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/profile/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Profile Completion */}
      {(!profile?.city || !profile?.bio) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            <CardDescription>
              A complete profile helps you find better matches and builds trust.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {!profile?.avatar_url && (
                <Badge variant="outline">Add a profile photo</Badge>
              )}
              {!profile?.bio && <Badge variant="outline">Add a bio</Badge>}
              {!profile?.city && <Badge variant="outline">Set your location</Badge>}
              {offers.length === 0 && (
                <Badge variant="outline">Add a service you offer</Badge>
              )}
              {needs.length === 0 && (
                <Badge variant="outline">Add a service you need</Badge>
              )}
            </div>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/profile/edit">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>
                What you offer and what you need
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/services">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {services && services.length > 0 ? (
              <div className="space-y-4">
                {services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={service.type === 'offer' ? 'default' : 'secondary'}
                      >
                        {service.type === 'offer' ? 'Offer' : 'Need'}
                      </Badge>
                      <span className="font-medium">{service.title}</span>
                    </div>
                    <Badge
                      variant={service.status === 'active' ? 'outline' : 'secondary'}
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t added any services yet.
                </p>
                <Button asChild>
                  <Link href="/profile/services/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Service
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Exchanges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Exchanges</CardTitle>
              <CardDescription>
                Your ongoing and recent trades
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/exchanges">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {exchanges && exchanges.length > 0 ? (
              <div className="space-y-4">
                {exchanges.slice(0, 4).map((exchange) => (
                  <Link
                    key={exchange.id}
                    href={`/exchanges/${exchange.id}`}
                    className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {exchange.service_a_description?.slice(0, 30) || 'Trade'}
                        {(exchange.service_a_description?.length || 0) > 30 && '...'}
                      </span>
                    </div>
                    <Badge variant="outline">{exchange.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No exchanges yet. Start by finding a match!
                </p>
                <Button variant="outline" asChild>
                  <Link href="/browse">Browse Services</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rating Summary */}
      {profile && profile.total_reviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
            <CardDescription>
              Based on {profile.total_reviews} review
              {profile.total_reviews !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(profile.avg_rating || 0)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold">
                {profile.avg_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
