'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle,
  Loader2,
  MessageSquare,
  Star,
  XCircle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Exchange, Profile, Database } from '@/types/database'

type ExchangeWithProfiles = Exchange & {
  user_a: Profile
  user_b: Profile
}

type ExchangeUpdate = Database['public']['Tables']['exchanges']['Update']
type ExchangeStatus = Exchange['status']

const statusSteps = [
  { status: 'proposed', label: 'Proposed' },
  { status: 'negotiating', label: 'Negotiating' },
  { status: 'agreed', label: 'Agreed' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
]

export default function ExchangeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const exchangeId = params.id as string
  const supabase = createClient()

  const [exchange, setExchange] = useState<Exchange | null>(null)
  const [userA, setUserA] = useState<Profile | null>(null)
  const [userB, setUserB] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadExchange() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const { data } = await supabase
        .from('exchanges')
        .select(
          `
          *,
          user_a:profiles!exchanges_user_a_id_fkey(*),
          user_b:profiles!exchanges_user_b_id_fkey(*)
        `
        )
        .eq('id', exchangeId)
        .single()

      if (data) {
        const exchangeData = data as unknown as ExchangeWithProfiles
        setExchange(exchangeData)
        setUserA(exchangeData.user_a)
        setUserB(exchangeData.user_b)
      }

      setIsLoading(false)
    }

    loadExchange()
  }, [exchangeId, supabase])

  const isUserA = currentUserId === exchange?.user_a_id
  const otherUser = isUserA ? userB : userA
  const myCompletion = isUserA
    ? exchange?.user_a_completed
    : exchange?.user_b_completed
  const theirCompletion = isUserA
    ? exchange?.user_b_completed
    : exchange?.user_a_completed

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((s) => s.status === exchange?.status)
  }

  async function updateExchangeStatus(newStatus: ExchangeStatus) {
    setIsUpdating(true)

    const { error } = await supabase
      .from('exchanges')
      .update({ status: newStatus } as never)
      .eq('id', exchangeId)

    if (error) {
      toast.error('Failed to update exchange')
    } else {
      toast.success('Exchange updated!')
      setExchange((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    setIsUpdating(false)
  }

  async function markComplete() {
    setIsUpdating(true)

    const updateField = isUserA ? 'user_a_completed' : 'user_b_completed'
    const updates: ExchangeUpdate = { [updateField]: true }

    // Check if both will be complete after this
    const otherComplete = isUserA
      ? exchange?.user_b_completed
      : exchange?.user_a_completed
    if (otherComplete) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('exchanges')
      .update(updates as never)
      .eq('id', exchangeId)

    if (error) {
      toast.error('Failed to mark complete')
    } else {
      toast.success(
        otherComplete
          ? 'Exchange completed! You can now leave a review.'
          : 'Marked as complete. Waiting for the other party.'
      )
      setExchange((prev) =>
        prev
          ? {
              ...prev,
              ...(updates as Partial<Exchange>),
            }
          : null
      )
    }

    setIsUpdating(false)
  }

  async function cancelExchange() {
    if (!confirm('Are you sure you want to cancel this exchange?')) return

    setIsUpdating(true)

    const { error } = await supabase
      .from('exchanges')
      .update({ status: 'cancelled' } as never)
      .eq('id', exchangeId)

    if (error) {
      toast.error('Failed to cancel exchange')
    } else {
      toast.success('Exchange cancelled')
      router.push('/exchanges')
    }

    setIsUpdating(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!exchange) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Exchange not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/exchanges">Back to Exchanges</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/exchanges">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Exchange Details</h1>
          <p className="text-muted-foreground">
            Started{' '}
            {formatDistanceToNow(new Date(exchange.proposed_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Status Progress */}
      {exchange.status !== 'cancelled' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const currentIndex = getCurrentStepIndex()
                const isComplete = index <= currentIndex
                const isCurrent = index === currentIndex

                return (
                  <div
                    key={step.status}
                    className="flex flex-col items-center relative flex-1"
                  >
                    {index > 0 && (
                      <div
                        className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-x-1/2 ${
                          index <= currentIndex ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-1/2 right-0 top-4 h-0.5 translate-x-1/2 ${
                          index < currentIndex ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        isComplete
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {isComplete && index < currentIndex ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs ${
                        isCurrent ? 'font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exchange cancelled */}
      {exchange.status === 'cancelled' && (
        <Card className="border-destructive">
          <CardContent className="py-6 flex items-center gap-3 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">This exchange has been cancelled</span>
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isUserA ? 'You Offer' : `${userA?.display_name} Offers`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userA?.avatar_url || undefined} />
                <AvatarFallback>
                  {userA?.display_name ? getInitials(userA.display_name) : 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userA?.display_name}</p>
                {exchange.user_a_completed && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marked Complete
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground">
              {exchange.service_a_description || 'No description'}
            </p>
            {exchange.estimated_value_a && (
              <p className="mt-2 text-sm">
                Est. Value: ${exchange.estimated_value_a.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {!isUserA ? 'You Offer' : `${userB?.display_name} Offers`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userB?.avatar_url || undefined} />
                <AvatarFallback>
                  {userB?.display_name ? getInitials(userB.display_name) : 'B'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userB?.display_name}</p>
                {exchange.user_b_completed && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marked Complete
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground">
              {exchange.service_b_description || 'No description'}
            </p>
            {exchange.estimated_value_b && (
              <p className="mt-2 text-sm">
                Est. Value: ${exchange.estimated_value_b.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {exchange.status !== 'cancelled' && exchange.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {exchange.conversation_id && (
                <Button variant="outline" asChild>
                  <Link href={`/messages/${exchange.conversation_id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Conversation
                  </Link>
                </Button>
              )}

              {exchange.status === 'proposed' && (
                <Button
                  onClick={() => updateExchangeStatus('negotiating')}
                  disabled={isUpdating}
                >
                  Start Negotiating
                </Button>
              )}

              {exchange.status === 'negotiating' && (
                <Button
                  onClick={() => updateExchangeStatus('agreed')}
                  disabled={isUpdating}
                >
                  Mark as Agreed
                </Button>
              )}

              {exchange.status === 'agreed' && (
                <Button
                  onClick={() => updateExchangeStatus('in_progress')}
                  disabled={isUpdating}
                >
                  Start Work
                </Button>
              )}

              {exchange.status === 'in_progress' && !myCompletion && (
                <Button onClick={markComplete} disabled={isUpdating}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark My Part Complete
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={cancelExchange}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Exchange
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review prompt */}
      {exchange.status === 'completed' && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Exchange Completed!</p>
                <p className="text-sm text-muted-foreground">
                  Leave a review for {otherUser?.display_name}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/exchanges/${exchangeId}/review`}>Leave Review</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Exchange Proposed</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(exchange.proposed_at), 'PPP p')}
                </p>
              </div>
            </div>
            {exchange.agreed_at && (
              <div className="flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Terms Agreed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(exchange.agreed_at), 'PPP p')}
                  </p>
                </div>
              </div>
            )}
            {exchange.completed_at && (
              <div className="flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Exchange Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(exchange.completed_at), 'PPP p')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
