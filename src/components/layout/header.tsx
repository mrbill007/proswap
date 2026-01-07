'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  ArrowLeftRight,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface HeaderProps {
  user?: { id: string; email?: string } | null
  profile?: Profile | null
}

const navigation = [
  { name: 'Browse', href: '/browse' },
  { name: 'How It Works', href: '/how-it-works' },
]

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'My Exchanges', href: '/exchanges', icon: ArrowLeftRight },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Header({ user, profile }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <ArrowLeftRight className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold">ProSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/messages">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Messages</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.display_name || 'User'}
                      />
                      <AvatarFallback>
                        {profile?.display_name
                          ? getInitials(profile.display_name)
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.display_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-80 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-6">
              {user && profile && (
                <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.display_name}
                    />
                    <AvatarFallback className="text-sm">
                      {getInitials(profile.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{profile.display_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {user ? (
                <>
                  <div className="flex flex-col gap-1 border-t pt-3 sm:pt-4">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="mt-2 sm:mt-4"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 border-t pt-3 sm:pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
