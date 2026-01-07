'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Message, Profile, Conversation } from '@/types/database'

type ConversationWithProfiles = Conversation & {
  participant_one: Profile
  participant_two: Profile
}

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    async function loadConversation() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Load conversation
      const { data: convo } = await supabase
        .from('conversations')
        .select(
          `
          *,
          participant_one:profiles!conversations_participant_one_id_fkey(*),
          participant_two:profiles!conversations_participant_two_id_fkey(*)
        `
        )
        .eq('id', conversationId)
        .single()

      if (convo) {
        const typedConvo = convo as unknown as ConversationWithProfiles
        setConversation(typedConvo)
        const other =
          typedConvo.participant_one_id === user.id
            ? typedConvo.participant_two
            : typedConvo.participant_one
        setOtherUser(other)
      }

      // Load messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
      setIsLoading(false)

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() } as never)
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null)
    }

    loadConversation()
  }, [conversationId, supabase])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    setIsSending(true)

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    } as never)

    if (error) {
      toast.error('Failed to send message')
    } else {
      setNewMessage('')
    }

    setIsSending(false)
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
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {otherUser && (
          <Link
            href={`/u/${otherUser.display_name?.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherUser.avatar_url || undefined}
                alt={otherUser.display_name}
              />
              <AvatarFallback>
                {otherUser.display_name
                  ? getInitials(otherUser.display_name)
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherUser.display_name}</h2>
              {otherUser.city && otherUser.state && (
                <p className="text-sm text-muted-foreground">
                  {otherUser.city}, {otherUser.state}
                </p>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" disabled={isSending || !newMessage.trim()}>
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
