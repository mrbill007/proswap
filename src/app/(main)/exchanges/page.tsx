import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Exchange = Database['public']['Tables']['exchanges']['Row']
type ExchangeWithUsers = Exchange & {
  user_a: Profile
  user_b: Profile
}

export const metadata = {
  title: 'My Exchanges',
}

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  proposed: 'secondary',
  negotiating: 'secondary',
  agreed: 'default',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default async function ExchangesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: exchangesData } = await supabase
    .from('exchanges')
    .select(
      `
      *,
      user_a:profiles!exchanges_user_a_id_fkey(*),
      user_b:profiles!exchanges_user_b_id_fkey(*)
    `
    )
    .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
    .order('proposed_at', { ascending: false })

  const exchanges = exchangesData as ExchangeWithUsers[] | null

  const activeExchanges =
    exchanges?.filter(
      (e) =>
        e.status !== 'completed' && e.status !== 'cancelled'
    ) || []
  const completedExchanges =
    exchanges?.filter((e) => e.status === 'completed') || []
  const cancelledExchanges =
    exchanges?.filter((e) => e.status === 'cancelled') || []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getOtherUser = (exchange: ExchangeWithUsers) => {
    return exchange.user_a_id === user!.id ? exchange.user_b : exchange.user_a
  }

  const ExchangeCard = ({ exchange }: { exchange: ExchangeWithUsers }) => {
    const otherUser = getOtherUser(exchange)
    const isUserA = exchange.user_a_id === user!.id

    return (
      <Link href={`/exchanges/${exchange.id}`}>
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={otherUser?.avatar_url || undefined}
                  alt={otherUser?.display_name}
                />
                <AvatarFallback>
                  {otherUser?.display_name
                    ? getInitials(otherUser.display_name)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    Trade with {otherUser?.display_name || 'Unknown'}
                  </h3>
                  <Badge variant={statusColors[exchange.status]}>
                    {exchange.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {isUserA
                      ? exchange.service_a_description
                      : exchange.service_b_description}
                  </span>
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>
                    {isUserA
                      ? exchange.service_b_description
                      : exchange.service_a_description}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Started{' '}
                  {formatDistanceToNow(new Date(exchange.proposed_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Exchanges</h1>
        <p className="text-muted-foreground">Track and manage your trades</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeExchanges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedExchanges.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledExchanges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeExchanges.length > 0 ? (
            activeExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No active exchanges</h3>
                <p className="text-muted-foreground mt-2">
                  Start trading by browsing services and proposing an exchange
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedExchanges.length > 0 ? (
            completedExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No completed exchanges yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledExchanges.length > 0 ? (
            cancelledExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No cancelled exchanges
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
