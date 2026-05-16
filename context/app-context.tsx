'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api, authStorage } from '@/lib/api'

export type UserRole = 'admin' | 'lead' | 'member' | 'viewer'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate: string
  createdAt: string
  projectId: string
  subtasks: { id: string; title: string; completed: boolean }[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: 'active' | 'idle' | 'offline'
  joinedDate: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'completed'
  progress: number
  dueDate: string
  teamMembers: string[]
  color: string
  createdDate: string
  totalTasks: number
  completedTasks: number
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

export interface AppContextType {
  currentUser: TeamMember
  currentUserRole: UserRole
  tasks: Task[]
  teamMembers: TeamMember[]
  projects: Project[]
  toasts: Toast[]
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  signup: (input: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshWorkspace: () => Promise<void>

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  getTasksByStatus: (status: Task['status']) => Task[]

  addTeamMember: (member: Omit<TeamMember, 'id' | 'joinedDate'>) => Promise<void>
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>
  removeTeamMember: (id: string) => Promise<void>
  changeUserRole: (memberId: string, newRole: UserRole) => Promise<void>

  addProject: (project: Omit<Project, 'id' | 'createdDate'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>

  showToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void

  canEditTask: (taskId: string) => boolean
  canDeleteTask: (taskId: string) => boolean
  canManageTeam: () => boolean
  canEditSettings: () => boolean
}

const emptyUser: TeamMember = {
  id: '',
  name: 'User',
  email: '',
  role: 'member',
  avatar: 'U',
  status: 'offline',
  joinedDate: new Date().toISOString(),
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<TeamMember>(emptyUser)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = Boolean(currentUser.id && authStorage.getToken())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: Toast['type'], message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev, { id, type, message }])
      window.setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  const applyWorkspace = useCallback(
    async (user: TeamMember) => {
      const backendProjects = await api.getProjects()
      const taskGroups = await Promise.all(
        backendProjects.map((project) => api.getProjectTasks(project._id || project.id || '')),
      )
      const nextTasks = taskGroups.flat()
      setTasks(nextTasks)
      setProjects(api.mapProjects(backendProjects, nextTasks))
      setTeamMembers(api.mapTeamMembers(backendProjects, user))
    },
    [],
  )

  const refreshWorkspace = useCallback(async () => {
    const user = authStorage.getUser()
    const token = authStorage.getToken()

    if (!user || !token) {
      setCurrentUser(emptyUser)
      setTasks([])
      setProjects([])
      setTeamMembers([])
      return
    }

    setCurrentUser(user)
    await applyWorkspace(user)
  }, [applyWorkspace])

  useEffect(() => {
    let isMounted = true

    async function boot() {
      try {
        await refreshWorkspace()
      } catch (error) {
        authStorage.clear()
        if (isMounted) {
          setCurrentUser(emptyUser)
          setTasks([])
          setProjects([])
          setTeamMembers([])
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    boot()

    return () => {
      isMounted = false
    }
  }, [refreshWorkspace])

  useEffect(() => {
    if (isLoading) return
    if (pathname?.startsWith('/dashboard') && !authStorage.getToken()) {
      router.replace('/login')
    }
  }, [isLoading, pathname, router])

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await api.login({ email, password })
      setCurrentUser(user)
      await applyWorkspace(user)
      showToast('success', 'Signed in successfully')
    },
    [applyWorkspace, showToast],
  )

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      await api.register(input)
      const user = await api.login({ email: input.email, password: input.password })
      setCurrentUser(user)
      await applyWorkspace(user)
      showToast('success', 'Account created successfully')
    },
    [applyWorkspace, showToast],
  )

  const logout = useCallback(() => {
    authStorage.clear()
    setCurrentUser(emptyUser)
    setTasks([])
    setProjects([])
    setTeamMembers([])
    router.push('/login')
  }, [router])

  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      try {
        const projectId = taskData.projectId || projects[0]?.id
        if (!projectId) {
          showToast('error', 'Create a project before adding tasks')
          return
        }
        const task = await api.createTask(projectId, taskData, currentUser.id)
        setTasks((prev) => [task, ...prev])
        await refreshWorkspace()
        showToast('success', 'Task created successfully')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to create task')
        throw error
      }
    },
    [currentUser.id, projects, refreshWorkspace, showToast],
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        const task =
          updates.status !== undefined && Object.keys(updates).length === 1
            ? await api.updateTaskStatus(id, updates.status)
            : await api.updateTask(id, updates)
        setTasks((prev) => prev.map((item) => (item.id === id ? task : item)))
        await refreshWorkspace()
        showToast('success', 'Task updated successfully')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to update task')
        throw error
      }
    },
    [refreshWorkspace, showToast],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await api.deleteTask(id)
        setTasks((prev) => prev.filter((task) => task.id !== id))
        await refreshWorkspace()
        showToast('success', 'Task deleted successfully')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to delete task')
        throw error
      }
    },
    [refreshWorkspace, showToast],
  )

  const getTasksByStatus = useCallback(
    (status: Task['status']) => tasks.filter((task) => task.status === status),
    [tasks],
  )

  const addTeamMember = useCallback(
    async (memberData: Omit<TeamMember, 'id' | 'joinedDate'>) => {
      const projectId = projects[0]?.id
      if (!projectId) {
        showToast('error', 'Create a project before inviting members')
        return
      }

      showToast(
        'info',
        `Backend invite by email is not available yet. Add an existing user id to project ${projectId}.`,
      )
      console.info('Invite requested for:', memberData)
    },
    [projects, showToast],
  )

  const updateTeamMember = useCallback(
    async () => {
      showToast('info', 'Backend profile update endpoint is not available yet')
    },
    [showToast],
  )

  const removeTeamMember = useCallback(
    async (id: string) => {
      try {
        if (id === currentUser.id) {
          showToast('error', 'Cannot remove yourself from the team')
          return
        }
        const projectId = projects[0]?.id
        if (!projectId) {
          showToast('error', 'No project selected')
          return
        }
        await api.removeProjectMember(projectId, id)
        await refreshWorkspace()
        showToast('success', 'Team member removed')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to remove team member')
        throw error
      }
    },
    [currentUser.id, projects, refreshWorkspace, showToast],
  )

  const changeUserRole = useCallback(
    async (_memberId: string, _newRole: UserRole) => {
      showToast('info', 'Backend role update endpoint is not available yet')
    },
    [showToast],
  )

  const addProject = useCallback(
    async (projectData: Omit<Project, 'id' | 'createdDate'>) => {
      try {
        await api.createProject(projectData)
        await refreshWorkspace()
        showToast('success', 'Project created successfully')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to create project')
        throw error
      }
    },
    [refreshWorkspace, showToast],
  )

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      try {
        await api.updateProject(id, updates)
        await refreshWorkspace()
        showToast('success', 'Project updated successfully')
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to update project')
        throw error
      }
    },
    [refreshWorkspace, showToast],
  )

  const canEditTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId)
      if (!task) return false
      if (currentUser.role === 'admin' || currentUser.role === 'lead') return true
      return currentUser.role === 'member' && task.assignee === currentUser.id
    },
    [currentUser, tasks],
  )

  const canDeleteTask = useCallback(() => {
    return currentUser.role === 'admin' || currentUser.role === 'lead'
  }, [currentUser.role])

  const canManageTeam = useCallback(() => {
    return currentUser.role === 'admin' || currentUser.role === 'lead'
  }, [currentUser.role])

  const canEditSettings = useCallback(() => currentUser.role === 'admin', [currentUser.role])

  const value: AppContextType = useMemo(
    () => ({
      currentUser,
      currentUserRole: currentUser.role,
      tasks,
      teamMembers,
      projects,
      toasts,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      refreshWorkspace,
      addTask,
      updateTask,
      deleteTask,
      getTasksByStatus,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,
      changeUserRole,
      addProject,
      updateProject,
      showToast,
      removeToast,
      canEditTask,
      canDeleteTask,
      canManageTeam,
      canEditSettings,
    }),
    [
      currentUser,
      tasks,
      teamMembers,
      projects,
      toasts,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      refreshWorkspace,
      addTask,
      updateTask,
      deleteTask,
      getTasksByStatus,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,
      changeUserRole,
      addProject,
      updateProject,
      showToast,
      removeToast,
      canEditTask,
      canDeleteTask,
      canManageTeam,
      canEditSettings,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
