'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react'
import { useApp, type Task } from '@/context/app-context'
import { TaskDialog } from '@/components/task-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

export default function TasksPage() {
  const { tasks, deleteTask, updateTask, canDeleteTask, canEditTask, projects, teamMembers } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

  const project = projects && projects.length > 0 ? projects[0] : null
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status.id] = filteredTasks.filter((task) => task.status === status.id)
      return acc
    },
    {} as Record<string, Task[]>
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
    }
  }

  const getMemberName = (memberId?: string) => {
    if (!memberId) return 'Unassigned'
    return teamMembers.find((m) => m.id === memberId)?.name || 'Unknown'
  }

  const handleEditTask = (task: Task) => {
    if (!canEditTask(task.id)) {
      return
    }
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!canDeleteTask(taskId)) {
      return
    }
    deleteTask(taskId)
    setDeleteTaskId(null)
  }

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    updateTask(taskId, { status: newStatus })
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTask(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track your work efficiently</p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(undefined)
            setIsDialogOpen(true)
          }}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map((status) => (
          <div key={status.id} className="bg-muted/30 rounded-lg p-4 border border-border/60 min-h-96">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                {status.label}
                <Badge variant="secondary" className="ml-2">
                  {tasksByStatus[status.id].length}
                </Badge>
              </h2>
            </div>

            {/* Tasks in Column */}
            <div className="space-y-3">
              {tasksByStatus[status.id].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks yet</p>
                </div>
              ) : (
                tasksByStatus[status.id].map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 border border-border/60 bg-background hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex-1 line-clamp-2">
                        {task.title}
                      </h3>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Task Meta */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/40">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                          {getMemberName(task.assignee)
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <span className="text-muted-foreground">{getMemberName(task.assignee)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Subtasks Progress */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Subtasks</span>
                          <span className="text-xs font-medium text-foreground">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{
                              width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {status.id !== 'done' && (
                        <>
                          {status.id === 'todo' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() =>
                                handleStatusChange(task.id, 'in-progress')
                              }
                            >
                              Start
                            </Button>
                          )}
                          {status.id === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => handleStatusChange(task.id, 'done')}
                            >
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                      {canEditTask(task.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                      {canDeleteTask(task.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTaskId(task.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog()
          }
        }}
        task={editingTask}
        projectId={project?.id || ''}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) {
                  handleDeleteTask(deleteTaskId)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
