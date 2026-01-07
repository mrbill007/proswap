import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 w-fit">
          <ArrowLeftRight className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-lg sm:text-xl font-bold">ProSwap</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:p-6">
        {children}
      </main>
    </div>
  )
}
