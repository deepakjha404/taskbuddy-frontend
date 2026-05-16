'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Shield, Edit2, Trash2, Copy } from 'lucide-react'
import { useApp, type TeamMember } from '@/context/app-context'
import { TeamMemberDialog } from '@/components/team-member-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLE_DEFINITIONS = [
  {
    name: 'Admin',
    value: 'admin',
    permissions: ['Create/edit/delete tasks', 'Manage team members', 'Change roles', 'Access settings'],
    color: 'text-red-600 dark:text-red-400',
  },
  {
    name: 'Team Lead',
    value: 'lead',
    permissions: ['Create/edit/delete tasks', 'Manage team members', 'Invite members'],
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Member',
    value: 'member',
    permissions: ['Create/edit tasks assigned to them', 'View all tasks', 'Update status'],
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Viewer',
    value: 'viewer',
    permissions: ['View-only access', 'Cannot edit or create'],
    color: 'text-green-600 dark:text-green-400',
  },
]

export default function TeamPage() {
  const {
    teamMembers,
    currentUser,
    canManageTeam,
    removeTeamMember,
    changeUserRole,
  } = useApp()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null)

  const activeMembers = teamMembers.filter((m) => m.status === 'active').length

  const handleEditMember = (member: TeamMember) => {
    if (!canManageTeam()) return
    setEditingMember(member)
    setIsDialogOpen(true)
  }

  const handleAddMember = () => {
    if (!canManageTeam()) return
    setEditingMember(undefined)
    setIsDialogOpen(true)
  }

  const handleDeleteMember = (memberId: string) => {
    if (!canManageTeam()) return
    removeTeamMember(memberId)
    setDeleteUserId(null)
  }

  const handleChangeRole = (memberId: string, newRole: string) => {
    if (!canManageTeam() || currentUser.role !== 'admin') return
    changeUserRole(memberId, newRole as any)
    setRoleChangeUserId(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'idle':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    const roleConfig = ROLE_DEFINITIONS.find((r) => r.value === role)
    return roleConfig?.color || ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage team members, roles, and permissions</p>
        </div>
        {canManageTeam() && (
          <Button
            onClick={handleAddMember}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <p className="text-sm font-medium text-muted-foreground">Total Members</p>
          <p className="text-3xl font-bold text-foreground mt-2">{teamMembers.length}</p>
        </Card>
        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <p className="text-3xl font-bold text-foreground mt-2">{activeMembers}</p>
        </Card>
        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <p className="text-sm font-medium text-muted-foreground">Admins</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {teamMembers.filter((m) => m.role === 'admin').length}
          </p>
        </Card>
        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <p className="text-sm font-medium text-muted-foreground">Team Leads</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {teamMembers.filter((m) => m.role === 'lead').length}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <Card className="p-6 border border-border/60 lg:col-span-2">
          <h2 className="text-xl font-bold text-foreground mb-4">Team Members</h2>
          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No team members yet</p>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/60 hover:border-primary/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-semibold text-white flex-shrink-0">
                      {member.avatar || member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        {member.id === currentUser.id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {/* Role */}
                    {canManageTeam() && currentUser.role === 'admin' && member.id !== currentUser.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => handleChangeRole(member.id, newRole)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_DEFINITIONS.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`text-xs font-semibold ${getRoleColor(member.role)}`}>
                        {ROLE_DEFINITIONS.find((r) => r.value === member.role)?.name}
                      </Badge>
                    )}

                    {/* Status */}
                    <Badge variant="outline" className={`text-xs ${getStatusColor(member.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block bg-current" />
                      {member.status}
                    </Badge>

                    {/* Actions */}
                    {canManageTeam() && member.id !== currentUser.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteUserId(member.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Roles & Permissions Reference */}
        <Card className="p-6 border border-border/60">
          <h2 className="text-xl font-bold text-foreground mb-4">Roles & Permissions</h2>
          <div className="space-y-4">
            {ROLE_DEFINITIONS.map((role) => (
              <div key={role.value} className="p-4 rounded-lg border border-border/40 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${role.color}`} />
                  <h3 className="font-semibold text-foreground">{role.name}</h3>
                </div>
                <ul className="space-y-1">
                  {role.permissions.map((perm, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team Member Dialog */}
      <TeamMemberDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} member={editingMember} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? They will no longer have access to the workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteUserId) {
                  handleDeleteMember(deleteUserId)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
