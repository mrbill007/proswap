import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle,
  Shield,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Review = Database['public']['Tables']['reviews']['Row']
type ServiceWithCategory = Service & { category: Category | null }
type ReviewWithReviewer = Review & { reviewer: Profile | null }

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name')
    .ilike('display_name', username.replace(/-/g, ' '))
    .single()
  const profile = profileData as Pick<Profile, 'display_name'> | null

  return {
    title: profile?.display_name || 'Profile',
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  let currentUserProfile: Profile | null = null
  if (currentUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()
    currentUserProfile = data as Profile | null
  }

  // Find profile by display name (slug format)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', username.replace(/-/g, ' '))
    .single()
  const profile = profileData as Profile | null

  if (!profile) {
    notFound()
  }

  // Get user's services
  const { data: servicesData } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('user_id', profile.user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  const services = servicesData as ServiceWithCategory[] | null

  // Get user's reviews
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
    .eq('reviewee_id', profile.user_id)
    .order('created_at', { ascending: false })
    .limit(5)
  const reviews = reviewsData as ReviewWithReviewer[] | null

  const offers = services?.filter((s) => s.type === 'offer') || []
  const needs = services?.filter((s) => s.type === 'need') || []

  const isOwnProfile = currentUser?.id === profile.user_id

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
      <Header user={currentUser} profile={currentUserProfile} />

      <main className="flex-1 container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.display_name}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-4 text-2xl font-bold">
                    {profile.display_name}
                  </h1>
                  {profile.city && profile.state && (
                    <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {profile.city}, {profile.state}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{' '}
                      {formatDistanceToNow(new Date(profile.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Verification Badges */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Verified
                    </Badge>
                    {profile.verified_professional && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3 text-blue-500" />
                        Pro Verified
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {profile.total_reviews > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(profile.avg_rating || 0)
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">
                        {profile.avg_rating?.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({profile.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-6 grid w-full grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{offers.length}</p>
                      <p className="text-sm text-muted-foreground">Offers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {profile.total_exchanges}
                      </p>
                      <p className="text-sm text-muted-foreground">Trades</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 w-full space-y-2">
                    {isOwnProfile ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/profile/edit">Edit Profile</Link>
                      </Button>
                    ) : (
                      currentUser && (
                        <Button className="w-full" asChild>
                          <Link href={`/messages/new?to=${profile.user_id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                {offers.length > 0 ? (
                  <div className="space-y-4">
                    {offers.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.title}</h3>
                            {service.category && (
                              <Badge variant="secondary">
                                {service.category.name}
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>
                        {service.estimated_value && (
                          <div className="text-right">
                            <p className="font-medium">
                              ${service.estimated_value.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              est. value
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No services offered yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Services Needed */}
            <Card>
              <CardHeader>
                <CardTitle>Services Needed</CardTitle>
              </CardHeader>
              <CardContent>
                {needs.length > 0 ? (
                  <div className="space-y-4">
                    {needs.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.title}</h3>
                            {service.category && (
                              <Badge variant="secondary">
                                {service.category.name}
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>
                        {service.estimated_value && (
                          <div className="text-right">
                            <p className="font-medium">
                              ${service.estimated_value.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              est. value
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No services needed listed
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reviews</CardTitle>
                {(reviews?.length || 0) > 5 && (
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={review.reviewer?.avatar_url || undefined}
                              alt={review.reviewer?.display_name}
                            />
                            <AvatarFallback>
                              {review.reviewer?.display_name
                                ? getInitials(review.reviewer.display_name)
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {review.reviewer?.display_name || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.overall_rating
                                        ? 'fill-primary text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(review.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground pl-13">
                            {review.comment}
                          </p>
                        )}
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
