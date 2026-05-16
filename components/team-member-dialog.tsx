'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp, type TeamMember, type UserRole } from '@/context/app-context'
import { Mail } from 'lucide-react'

interface TeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: TeamMember
}

export function TeamMemberDialog({ open, onOpenChange, member }: TeamMemberDialogProps) {
  const { addTeamMember, updateTeamMember } = useApp()
  
  const [name, setName] = useState(member?.name || '')
  const [email, setEmail] = useState(member?.email || '')
  const [role, setRole] = useState<UserRole>(member?.role || 'member')
  const [status, setStatus] = useState<TeamMember['status']>(member?.status || 'active')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setName(member?.name || '')
    setEmail(member?.email || '')
    setRole(member?.role || 'member')
    setStatus(member?.status || 'active')
  }, [member, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsLoading(true)
    try {
      if (member) {
        await updateTeamMember(member.id, {
          name,
          email,
          role,
          status,
        })
      } else {
        await addTeamMember({
          name,
          email,
          role,
          status,
          avatar: name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
        })
      }
      onOpenChange(false)
      resetForm()
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setRole('member')
    setStatus('active')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Member' : 'Invite Member'}</DialogTitle>
          <DialogDescription>
            {member
              ? 'Update team member details'
              : 'Add a new team member to your workspace'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address*</Label>
            <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">Full access</div>
                  </div>
                </SelectItem>
                <SelectItem value="lead">
                  <div>
                    <div className="font-medium">Team Lead</div>
                    <div className="text-xs text-muted-foreground">Can manage team</div>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div>
                    <div className="font-medium">Member</div>
                    <div className="text-xs text-muted-foreground">Standard access</div>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div>
                    <div className="font-medium">Viewer</div>
                    <div className="text-xs text-muted-foreground">Read-only access</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {member && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TeamMember['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : member ? 'Update Member' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
