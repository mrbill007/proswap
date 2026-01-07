import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Search,
  Shield,
  Star,
  Users,
  Wrench,
  Camera,
  Monitor,
  Car,
  Paintbrush,
  Dumbbell,
  ChefHat,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Find Local Professionals',
    description:
      'Browse skilled professionals in your area offering services you need.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Trade Skills Directly',
    description:
      'Exchange your expertise for services you need - no money changes hands.',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description:
      'Communicate safely through our anonymized messaging system.',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Verified profiles and reviews help you trade with confidence.',
  },
]

const categories = [
  { name: 'Home Repair', icon: Wrench, count: '2,400+' },
  { name: 'Photography', icon: Camera, count: '1,800+' },
  { name: 'Tech & IT', icon: Monitor, count: '3,200+' },
  { name: 'Automotive', icon: Car, count: '1,500+' },
  { name: 'Design', icon: Paintbrush, count: '2,100+' },
  { name: 'Health & Fitness', icon: Dumbbell, count: '900+' },
]

const steps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description:
      'Sign up and list the skills you offer and services you need.',
  },
  {
    number: '2',
    title: 'Find Matches',
    description:
      'Browse or let our AI find professionals who need what you offer.',
  },
  {
    number: '3',
    title: 'Propose a Trade',
    description:
      'Reach out, negotiate terms, and agree on a fair exchange.',
  },
  {
    number: '4',
    title: 'Complete & Review',
    description:
      'Finish the exchange and leave reviews to build your reputation.',
  },
]

const testimonials = [
  {
    quote:
      "I traded my web development skills for a complete bathroom remodel. Saved thousands and met an amazing contractor!",
    author: 'Sarah M.',
    role: 'Web Developer',
    rating: 5,
  },
  {
    quote:
      "As a photographer, I've exchanged shoots for accounting services, car repairs, and even cooking lessons. ProSwap changed how I think about work.",
    author: 'Marcus T.',
    role: 'Professional Photographer',
    rating: 5,
  },
  {
    quote:
      "My small salon gets constant traffic from trade partners. It's networking and bartering in one amazing platform.",
    author: 'Lisa K.',
    role: 'Salon Owner',
    rating: 5,
  },
]

export default async function HomePage() {
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
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-12 sm:py-20 md:py-32">
          <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Trade Skills,{' '}
                <span className="text-primary">Not Cash</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground md:text-xl">
                Your expertise is your currency. Connect with local professionals
                and exchange services based on skill value. An electrician for a
                mechanic. A designer for a photographer. The possibilities are
                endless.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" asChild className="flex-1 sm:flex-none">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="flex-1 sm:flex-none">
                  <Link href="/browse">Browse</Link>
                </Button>
              </div>
              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>10,000+ Pros</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ArrowLeftRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>5,000+ Trades</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Popular Categories
              </h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Find professionals across dozens of skill categories
              </p>
            </div>
            <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/browse?category=${category.name.toLowerCase().replace(/ & /g, '-')}`}
                  className="group"
                >
                  <Card className="transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="flex flex-col items-center p-4 sm:p-6 text-center">
                      <category.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-transform group-hover:scale-110" />
                      <h3 className="mt-2 sm:mt-4 text-sm sm:text-base font-medium">{category.name}</h3>
                      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                        {category.count} listings
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/browse">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y bg-muted/30 py-12 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Why Choose ProSwap?
              </h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                The smarter way to exchange professional services
              </p>
            </div>
            <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold">{feature.title}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Start trading skills in four simple steps
              </p>
            </div>
            <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-6 sm:top-8 hidden h-0.5 w-full bg-border md:block" />
                  )}
                  <div className="relative mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y bg-muted/30 py-12 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What Our Users Say
              </h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Join thousands of professionals already trading on ProSwap
              </p>
            </div>
            <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.author}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <blockquote className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>
                    <div className="mt-3 sm:mt-4">
                      <p className="text-sm sm:text-base font-medium">{testimonial.author}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-12 pb-6 sm:py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to Start Trading?
              </h2>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Join ProSwap today and discover the power of skill-based
                bartering. Your expertise has never been more valuable.
              </p>
              <div className="mt-6 sm:mt-8">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
