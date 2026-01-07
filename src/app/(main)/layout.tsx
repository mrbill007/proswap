import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />
      <main className="flex-1 container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
      <Footer />
    </div>
  )
}
