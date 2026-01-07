import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Search,
  Shield,
  Star,
  UserPlus,
  Handshake,
  Award,
} from 'lucide-react'

export const metadata = {
  title: 'How It Works',
}

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Your Profile',
    description:
      'Sign up for free and build your profile. List the skills you can offer to others and the services you need. Add photos of your work to showcase your expertise.',
    details: [
      'Email and phone verification for security',
      'Add multiple skills you offer',
      'List services you need',
      'Upload portfolio photos',
      'Set your service area',
    ],
  },
  {
    number: 2,
    icon: Search,
    title: 'Find Matches',
    description:
      "Browse through professionals in your area or let our smart matching system find perfect trade partners. Filter by category, location, and estimated value.",
    details: [
      'Search by category or location',
      'AI-powered match suggestions',
      'View profiles and reviews',
      'Compare estimated values',
      'Find local professionals',
    ],
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'Connect & Negotiate',
    description:
      'Reach out to potential trade partners through our secure messaging system. Discuss details, agree on terms, and plan your exchange.',
    details: [
      'Anonymized messaging for safety',
      'Share photos and details',
      'Negotiate fair terms',
      'Set expectations clearly',
      'All communication on-platform',
    ],
  },
  {
    number: 4,
    icon: Handshake,
    title: 'Complete the Trade',
    description:
      'Perform your agreed-upon services. Track the progress of your exchange through our simple status system.',
    details: [
      'Both parties confirm agreement',
      'Track exchange status',
      'Mark work as complete',
      'Document the trade',
      'Stay connected throughout',
    ],
  },
  {
    number: 5,
    icon: Star,
    title: 'Leave Reviews',
    description:
      'After the trade is complete, leave a detailed review. Build your reputation and help others make informed decisions.',
    details: [
      'Rate multiple dimensions',
      'Quality, communication, timeliness',
      'Write detailed feedback',
      'Build your reputation',
      'Help the community',
    ],
  },
]

const benefits = [
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Verified profiles, reviews, and secure messaging keep you safe.',
  },
  {
    icon: Award,
    title: 'Quality Professionals',
    description:
      'Connect with skilled professionals who take pride in their work.',
  },
  {
    icon: CheckCircle,
    title: 'No Money Required',
    description:
      'Trade skills directly - your expertise is your currency.',
  },
]

export default async function HowItWorksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex flex-col">
      <Header user={user} profile={profile} />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-10 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight md:text-5xl">
              How ProSwap Works
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Trading skills has never been easier. Follow these simple steps to
              start exchanging services with professionals in your area.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-8 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 sm:space-y-16">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col gap-4 sm:gap-8 md:flex-row md:items-center ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-lg sm:text-xl font-bold text-primary-foreground">
                        {step.number}
                      </div>
                      <step.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{step.title}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {step.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <Card className="bg-muted/30">
                      <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[150px] sm:min-h-[250px]">
                        <step.icon className="h-20 w-20 sm:h-32 sm:w-32 text-primary/20" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y bg-muted/30 py-8 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
                Why Trade on ProSwap?
              </h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Join thousands of professionals who trust ProSwap for skill exchanges
              </p>
            </div>
            <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="p-4 sm:pt-6 text-center">
                    <benefit.icon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-primary mb-3 sm:mb-4" />
                    <h3 className="font-semibold text-sm sm:text-lg">{benefit.title}</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8 pb-6 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              Ready to Start Trading?
            </h2>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Join ProSwap today and discover the power of skill-based bartering.
              Your expertise is more valuable than you think.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" asChild className="flex-1 sm:flex-none">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href="/browse">Browse</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
