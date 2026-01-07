'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import type { Profile } from '@/types/database'

export default function NewMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toUserId = searchParams.get('to')
  const supabase = createClient()

  const [recipient, setRecipient] = useState<Profile | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRecipient() {
      if (!toUserId) {
        toast.error('No recipient specified')
        router.push('/messages')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', toUserId)
        .single()

      if (data) {
        setRecipient(data as Profile)
      } else {
        toast.error('User not found')
        router.push('/messages')
      }

      setIsLoading(false)
    }

    loadRecipient()
  }, [toUserId, supabase, router])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !toUserId) return

    setIsSending(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check if conversation already exists
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_one_id.eq.${user.id},participant_two_id.eq.${toUserId}),and(participant_one_id.eq.${toUserId},participant_two_id.eq.${user.id})`
      )
      .single()

    let conversationId = (existingConvo as { id: string } | null)?.id

    // Create conversation if it doesn't exist
    if (!conversationId) {
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({
          participant_one_id: user.id,
          participant_two_id: toUserId,
        } as never)
        .select('id')
        .single()

      if (convoError) {
        toast.error('Failed to create conversation')
        setIsSending(false)
        return
      }

      conversationId = (newConvo as { id: string }).id
    }

    // Send message
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: message.trim(),
    } as never)

    if (msgError) {
      toast.error('Failed to send message')
      setIsSending(false)
      return
    }

    toast.success('Message sent!')
    router.push(`/messages/${conversationId}`)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Message</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">To:</CardTitle>
        </CardHeader>
        <CardContent>
          {recipient && (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={recipient.avatar_url || undefined}
                  alt={recipient.display_name}
                />
                <AvatarFallback>
                  {recipient.display_name
                    ? getInitials(recipient.display_name)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{recipient.display_name}</p>
                {recipient.city && recipient.state && (
                  <p className="text-sm text-muted-foreground">
                    {recipient.city}, {recipient.state}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSend} className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/messages">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSending || !message.trim()}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Message
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
