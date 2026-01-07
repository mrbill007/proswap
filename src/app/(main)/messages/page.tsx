import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationWithDetails = Conversation & {
  participant_one: Profile
  participant_two: Profile
  messages: Message[]
}

export const metadata = {
  title: 'Messages',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get conversations with latest message and other participant
  const { data: conversationsData } = await supabase
    .from('conversations')
    .select(
      `
      *,
      participant_one:profiles!conversations_participant_one_id_fkey(*),
      participant_two:profiles!conversations_participant_two_id_fkey(*),
      messages(*)
    `
    )
    .or(`participant_one_id.eq.${user!.id},participant_two_id.eq.${user!.id}`)
    .order('last_message_at', { ascending: false })

  const conversations = conversationsData as ConversationWithDetails[] | null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getOtherParticipant = (conversation: ConversationWithDetails) => {
    return conversation.participant_one_id === user!.id
      ? conversation.participant_two
      : conversation.participant_one
  }

  const getUnreadCount = (conversation: ConversationWithDetails) => {
    return (
      conversation.messages?.filter(
        (m) => m.sender_id !== user!.id && !m.read_at
      ).length || 0
    )
  }

  const getLastMessage = (conversation: ConversationWithDetails) => {
    const messages = conversation.messages || []
    return messages.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Your conversations</p>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation)
            const unreadCount = getUnreadCount(conversation)
            const lastMessage = getLastMessage(conversation)

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
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
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {otherUser?.display_name || 'Unknown User'}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(lastMessage.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.sender_id === user!.id && 'You: '}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No messages yet</h3>
            <p className="text-muted-foreground mt-2">
              Start a conversation by visiting someone&apos;s profile and
              clicking &quot;Message&quot;
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
