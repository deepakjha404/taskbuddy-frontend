'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, TrendingUp, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/app-context'
import Link from 'next/link'

export default function DashboardPage() {
  const { tasks, teamMembers, projects, currentUser } = useApp()

  // Calculate stats
  const todoTasks = tasks.filter((t) => t.status === 'todo').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = tasks
    .filter((t) => {
      const dueDate = new Date(t.dueDate)
      const now = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue > 0 && daysUntilDue <= 7 && t.status !== 'done'
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getTasksByMember = (memberId: string) => {
    return tasks.filter((t) => t.assignee === memberId).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your tasks today.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalTasks}</p>
            </div>
            <Clock className="w-10 h-10 text-primary/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">{inProgressTasks}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-500/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completedTasks}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500/20" />
          </div>
        </Card>

        <Card className="p-6 border border-border/60 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary">
              {completionRate}%
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <Card className="p-6 border border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Active Projects</h2>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No projects yet</p>
            ) : (
              projects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id)
                const completedCount = projectTasks.filter((t) => t.status === 'done').length
                const progress =
                  projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0

                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/40 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          project.status === 'active'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                            : project.status === 'planning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {completedCount}/{projectTasks.length}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-6 border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Team</h2>
            <Link href="/dashboard/team">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No team members</p>
            ) : (
              teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                      {member.avatar || member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        member.status === 'active'
                          ? 'bg-green-500'
                          : member.status === 'idle'
                            ? 'bg-amber-500'
                            : 'bg-gray-400'
                      }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Upcoming Deadlines</h2>
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="gap-1">
                All Tasks <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-foreground text-sm line-clamp-1">{task.title}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                          : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      }`}
                    >
                      {getDaysUntilDue(task.dueDate)} days
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 border border-border/60">
          <h2 className="text-xl font-bold text-foreground mb-4">Task Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">To Do</span>
                <span className="text-xs font-semibold text-muted-foreground">{todoTasks}</span>
              </div>
              <Progress value={(todoTasks / (totalTasks || 1)) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">In Progress</span>
                <span className="text-xs font-semibold text-muted-foreground">{inProgressTasks}</span>
              </div>
              <Progress value={(inProgressTasks / (totalTasks || 1)) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Completed</span>
                <span className="text-xs font-semibold text-muted-foreground">{completedTasks}</span>
              </div>
              <Progress value={(completedTasks / (totalTasks || 1)) * 100} className="h-2" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/40 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Team Workload</h3>
            {teamMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{member.name}</span>
                <span className="font-medium text-foreground">{getTasksByMember(member.id)} tasks</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
