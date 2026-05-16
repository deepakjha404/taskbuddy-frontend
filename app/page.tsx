'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowRight, CheckCircle2, Users, BarChart3, Zap, Lock, Sparkles } from 'lucide-react'

export default function Home() {
  const productivityStats = [
    { value: '10k+', label: 'Tasks Managed' },
    { value: '2k+', label: 'Teams Organized' },
    { value: '98%', label: 'Uptime' },
    { value: '24/7', label: 'Access' },
  ]

  const features = [
    {
      icon: BarChart3,
      title: 'Intuitive Task Management',
      description: 'Organize tasks with drag-and-drop Kanban boards, custom fields, and automated workflows'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with live updates, comments, and activity feeds'
    },
    {
      icon: Sparkles,
      title: 'Advanced Analytics',
      description: 'Track team velocity, project progress, and identify bottlenecks with powerful dashboards'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Automate repetitive tasks and streamline workflows with intelligent triggers'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, SSO, and compliance with industry standards'
    },
    {
      icon: CheckCircle2,
      title: 'Seamless Integration',
      description: 'Connect with your favorite tools like Slack, GitHub, and Google Workspace'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center relative">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary font-semibold text-sm">New: AI-Powered Task Insights</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            Manage Tasks, Lead Teams, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Deliver Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance leading-relaxed">
            TaskBuddy is the all-in-one platform trusted by teams worldwide to organize work, collaborate seamlessly, and deliver projects on time. Empower your team with intelligent task management.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 px-8 h-12 text-base">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base hover:bg-primary/10">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-20 pt-12 border-t border-border">
            {productivityStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-gradient-to-b from-transparent via-primary/2 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive features designed to help your team work faster and smarter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="p-8 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-8">
            Trusted by leading teams
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {['Stripe', 'Figma', 'Notion', 'GitHub', 'Vercel'].map((company) => (
              <div key={company} className="text-muted-foreground font-semibold">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="p-12 md:p-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of teams already using TaskBuddy to work smarter, not harder. Get started free, no credit card required.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 px-8 h-12 text-base"
                  >
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
