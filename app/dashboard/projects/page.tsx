'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Edit2, Folder, Calendar, Users, Trash2 } from 'lucide-react'
import { useApp, type Project } from '@/context/app-context'
import { ProjectDialog } from '@/components/project-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ProjectsPage() {
  const { projects, deleteProject } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id)
    setDeleteProjectId(null)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProject(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your team's projects and progress</p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(undefined)
            setIsDialogOpen(true)
          }}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or description..."
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-muted/30 rounded-lg p-12 text-center border border-dashed border-border/60">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              {searchQuery ? "Try a different search term" : "Get started by creating your first project to organize your tasks."}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                variant="outline" 
                className="mt-6"
              >
                Create Project
              </Button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 border border-border/60 bg-background hover:border-primary/50 hover:shadow-lg transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Folder className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="capitalize">
                    {project.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteProjectId(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
                {project.description || "No description provided."}
              </p>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {project.teamMembers.length} Members
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Project Dialog */}
      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog()
          }
        }}
        project={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This will archive the project. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteProjectId) {
                  handleDeleteProject(deleteProjectId)
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
