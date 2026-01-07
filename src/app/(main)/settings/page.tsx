'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, LogOut, Trash2, User, Bell, Shield, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    )
      return

    setIsDeleting(true)

    // Note: In production, this would be a server action that properly handles
    // account deletion including all related data
    toast.error('Account deletion is not implemented in this demo')
    setIsDeleting(false)
  }

  const settingsGroups = [
    {
      title: 'Account',
      description: 'Manage your account settings',
      icon: User,
      items: [
        { label: 'Edit Profile', href: '/profile/edit' },
        { label: 'Change Password', href: '/settings/password' },
        { label: 'Email Preferences', href: '/settings/email' },
      ],
    },
    {
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      icon: Bell,
      items: [
        { label: 'Push Notifications', href: '/settings/notifications' },
        { label: 'Email Notifications', href: '/settings/notifications' },
      ],
    },
    {
      title: 'Privacy & Security',
      description: 'Protect your account',
      icon: Shield,
      items: [
        { label: 'Blocked Users', href: '/settings/blocked' },
        { label: 'Privacy Settings', href: '/settings/privacy' },
      ],
    },
    {
      title: 'Subscription',
      description: 'Manage your ProSwap subscription',
      icon: CreditCard,
      items: [
        { label: 'Current Plan', href: '/settings/subscription' },
        { label: 'Billing History', href: '/settings/billing' },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {settingsGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <group.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between py-2 px-3 -mx-3 rounded-md hover:bg-muted transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
