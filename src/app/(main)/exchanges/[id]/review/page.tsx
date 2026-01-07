'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Exchange, Profile } from '@/types/database'

type ExchangeWithProfiles = Exchange & {
  user_a: Profile
  user_b: Profile
}

const reviewSchema = z.object({
  quality_rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  timeliness_rating: z.number().min(1).max(5),
  fairness_rating: z.number().min(1).max(5),
  overall_rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  would_trade_again: z.boolean().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

const ratingCategories = [
  { name: 'quality_rating', label: 'Quality of Work', description: 'How well was the service performed?' },
  { name: 'communication_rating', label: 'Communication', description: 'Responsiveness and clarity' },
  { name: 'timeliness_rating', label: 'Timeliness', description: 'Adherence to agreed schedule' },
  { name: 'fairness_rating', label: 'Fairness', description: 'Was the exchange equitable?' },
  { name: 'overall_rating', label: 'Overall Experience', description: 'Your general satisfaction' },
] as const

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const exchangeId = params.id as string
  const supabase = createClient()

  const [exchange, setExchange] = useState<Exchange | null>(null)
  const [reviewee, setReviewee] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      quality_rating: 0,
      communication_rating: 0,
      timeliness_rating: 0,
      fairness_rating: 0,
      overall_rating: 0,
      comment: '',
      would_trade_again: undefined,
    },
  })

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Load exchange
      const { data: exchangeData } = await supabase
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

      if (exchangeData) {
        const typedExchange = exchangeData as unknown as ExchangeWithProfiles
        setExchange(typedExchange)
        const other =
          typedExchange.user_a_id === user.id
            ? typedExchange.user_b
            : typedExchange.user_a
        setReviewee(other)
      }

      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('exchange_id', exchangeId)
        .eq('reviewer_id', user.id)
        .single()

      if (existingReview) {
        setHasReviewed(true)
      }

      setIsLoading(false)
    }

    loadData()
  }, [exchangeId, supabase])

  async function onSubmit(data: ReviewFormData) {
    if (!currentUserId || !reviewee) return

    setIsSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      exchange_id: exchangeId,
      reviewer_id: currentUserId,
      reviewee_id: reviewee.user_id,
      quality_rating: data.quality_rating,
      communication_rating: data.communication_rating,
      timeliness_rating: data.timeliness_rating,
      fairness_rating: data.fairness_rating,
      overall_rating: data.overall_rating,
      comment: data.comment || null,
      would_trade_again: data.would_trade_again ?? null,
    } as never)

    if (error) {
      toast.error('Failed to submit review')
      setIsSubmitting(false)
      return
    }

    toast.success('Review submitted! Thank you for your feedback.')
    router.push('/exchanges')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number
    onChange: (value: number) => void
  }) => {
    const [hovered, setHovered] = useState(0)

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hovered || value)
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (hasReviewed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">Already Reviewed</h2>
        <p className="text-muted-foreground mt-2">
          You have already submitted a review for this exchange.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/exchanges">Back to Exchanges</Link>
        </Button>
      </div>
    )
  }

  if (exchange?.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">Exchange Not Complete</h2>
        <p className="text-muted-foreground mt-2">
          You can only leave a review after the exchange is completed.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href={`/exchanges/${exchangeId}`}>Back to Exchange</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/exchanges/${exchangeId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Leave a Review</h1>
      </div>

      {/* Reviewee */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={reviewee?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {reviewee?.display_name
                  ? getInitials(reviewee.display_name)
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">
                Review for {reviewee?.display_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Share your experience from this trade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {ratingCategories.map((category) => (
                <FormField
                  key={category.name}
                  control={form.control}
                  name={category.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{category.label}</FormLabel>
                      <FormDescription>{category.description}</FormDescription>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Written Review (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share more details about your experience..."
                        className="min-h-[100px]"
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

              <FormField
                control={form.control}
                name="would_trade_again"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Would you trade with this person again?</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={field.value === true ? 'default' : 'outline'}
                          onClick={() => field.onChange(true)}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === false ? 'destructive' : 'outline'}
                          onClick={() => field.onChange(false)}
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          No
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Review
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/exchanges/${exchangeId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
