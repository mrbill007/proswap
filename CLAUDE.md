# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database/Auth/Storage**: Supabase (PostgreSQL with RLS)
- **Styling**: TailwindCSS 4 + shadcn/ui (New York style)
- **Forms**: react-hook-form + zod validation
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup, forgot-password)
│   ├── (main)/            # Protected routes (dashboard, profile, messages, exchanges, settings)
│   ├── auth/callback/     # Supabase auth callback handler
│   ├── browse/            # Public browse page
│   ├── how-it-works/      # Public info page
│   ├── u/[username]/      # Public profile view
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer
│   └── features/          # Feature-specific components (when added)
├── lib/
│   ├── supabase/          # Supabase client (client.ts, server.ts)
│   └── utils.ts           # Utility functions (cn)
├── types/
│   └── database.ts        # Supabase database types
└── middleware.ts          # Auth middleware for protected routes
```

## Database Schema

Key tables (see `supabase/migrations/001_initial_schema.sql`):
- `profiles` - User profiles linked to auth.users
- `services` - Service listings (type: 'offer' | 'need')
- `categories` - Service categories with parent_id for hierarchy
- `conversations` + `messages` - Realtime messaging
- `exchanges` - Trade lifecycle tracking
- `reviews` - Multi-dimensional ratings
- `locations` - US states/cities reference

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase Setup

1. Create project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Run `supabase/seed.sql` to populate categories and locations
4. Create storage buckets: `avatars`, `service-images`, `review-images` (public)
5. Copy URL and anon key to `.env.local`

## Key Patterns

- Server components fetch data, client components handle interactivity
- Use `createClient` from `@/lib/supabase/server` in server components
- Use `createClient` from `@/lib/supabase/client` in client components
- Protected routes are in `(main)/` group, checked by middleware
- Forms use react-hook-form with zod schemas
- Toast notifications via sonner
