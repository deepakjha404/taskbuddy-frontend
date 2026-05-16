'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Mail, Github } from 'lucide-react'
import { useApp } from '@/context/app-context'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoading(true)
      setError('')
      try {
        await login(email, password)
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Home
        </Link>

        <Card className="p-8 border border-border/60 shadow-lg">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-semibold text-foreground">TaskBuddy</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50 border-border/60 h-11 px-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium text-sm">Password</Label>
                <Link href="#forgot" className="text-primary text-sm hover:underline font-medium">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/50 border-border/60 h-11 px-4"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 font-semibold gap-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 border-border/60 text-foreground hover:bg-muted/30">
              <Github className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="h-11 border-border/60 text-foreground hover:bg-muted/30">
              <Mail className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up for free
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8 px-4">
          By signing in, you agree to our{' '}
          <Link href="#terms" className="text-primary hover:underline">
            Terms
          </Link>
          {' '}and{' '}
          <Link href="#privacy" className="text-primary hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </div>
  )
}
