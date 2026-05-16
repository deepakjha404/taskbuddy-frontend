'use client'

import type { Project, Task, TeamMember, UserRole } from '@/context/app-context'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:1432/api'

const TOKEN_KEY = 'taskbuddy_token'
const USER_KEY = 'taskbuddy_user'

type BackendUser = {
  _id?: string
  id?: string
  name?: string
  emailId?: string
  email?: string
  role?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

type BackendProject = {
  _id?: string
  id?: string
  name?: string
  description?: string
  admin?: BackendUser | string
  members?: Array<BackendUser | string>
  status?: string
  createdAt?: string
  updatedAt?: string
}

type BackendTask = {
  _id?: string
  id?: string
  title?: string
  description?: string
  dueDate?: string
  priority?: string
  status?: string
  assignedTo?: BackendUser | string
  project?: BackendProject | string
  createdAt?: string
  updatedAt?: string
}

type LoginResponse = BackendUser & {
  success: boolean
  message?: string
  token: string
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

function getId(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  const record = value as { _id?: string; id?: string }
  return record._id || record.id || ''
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function normalizeRole(role?: string): UserRole {
  if (role === 'Admin' || role === 'admin') return 'admin'
  if (role === 'lead') return 'lead'
  if (role === 'viewer') return 'viewer'
  return 'member'
}

function normalizeMemberStatus(status?: string): TeamMember['status'] {
  if (status === 'Active' || status === 'active') return 'active'
  if (status === 'idle') return 'idle'
  return 'offline'
}

function normalizeProjectStatus(status?: string): Project['status'] {
  if (status === 'Active' || status === 'active') return 'active'
  if (status === 'completed') return 'completed'
  return 'planning'
}

function normalizeTaskStatus(status?: string): Task['status'] {
  if (status === 'In Progress' || status === 'in-progress') return 'in-progress'
  if (status === 'Done' || status === 'done') return 'done'
  return 'todo'
}

function normalizePriority(priority?: string): Task['priority'] {
  if (priority === 'High' || priority === 'high') return 'high'
  if (priority === 'Low' || priority === 'low') return 'low'
  return 'medium'
}

function backendStatus(status: Task['status']) {
  return status === 'in-progress' ? 'In Progress' : status === 'done' ? 'Done' : 'To Do'
}

function backendPriority(priority: Task['priority']) {
  return priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Medium'
}

function toTeamMember(user: BackendUser | string): TeamMember {
  if (typeof user === 'string') {
    return {
      id: user,
      name: 'Unknown User',
      email: '',
      role: 'member',
      avatar: 'UU',
      status: 'offline',
      joinedDate: new Date().toISOString(),
    }
  }

  const id = getId(user)
  const name = user.name || 'Unknown User'

  return {
    id,
    name,
    email: user.emailId || user.email || '',
    role: normalizeRole(user.role),
    avatar: initials(name),
    status: normalizeMemberStatus(user.status),
    joinedDate: user.createdAt || user.updatedAt || new Date().toISOString(),
  }
}

function toProject(project: BackendProject, tasks: Task[] = []): Project {
  const id = getId(project)
  const projectTasks = tasks.filter((task) => task.projectId === id)
  const completedTasks = projectTasks.filter((task) => task.status === 'done').length
  const memberIds = new Set<string>()

  if (project.admin) memberIds.add(getId(project.admin))
  ;(project.members || []).forEach((member) => {
    const memberId = getId(member)
    if (memberId) memberIds.add(memberId)
  })

  return {
    id,
    name: project.name || 'Untitled Project',
    description: project.description || '',
    status: normalizeProjectStatus(project.status),
    progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0,
    dueDate: project.updatedAt || project.createdAt || new Date().toISOString(),
    teamMembers: Array.from(memberIds),
    color: 'primary',
    createdDate: project.createdAt || new Date().toISOString(),
    totalTasks: projectTasks.length,
    completedTasks,
  }
}

function toTask(task: BackendTask): Task {
  return {
    id: getId(task),
    title: task.title || 'Untitled Task',
    description: task.description || '',
    status: normalizeTaskStatus(task.status),
    priority: normalizePriority(task.priority),
    assignee: getId(task.assignedTo),
    dueDate: task.dueDate || new Date().toISOString(),
    createdAt: task.createdAt || new Date().toISOString(),
    projectId: getId(task.project),
    subtasks: [],
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (options.auth !== false) {
    const token = authStorage.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Request failed')
  }

  return data as T
}

export const authStorage = {
  getToken() {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_KEY)
  },
  setSession(token: string, user: TeamMember) {
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getUser() {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as TeamMember
    } catch {
      return null
    }
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
  },
}

export const api = {
  async register(input: { name: string; email: string; password: string }) {
    return request<{ success: boolean; message?: string }>('/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        name: input.name,
        emailId: input.email,
        password: input.password,
      },
    })
  },

  async login(input: { email: string; password: string }) {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: input,
    })
    const user = toTeamMember(data)
    authStorage.setSession(data.token, user)
    return user
  },

  async getProjects() {
    const data = await request<{ projects: BackendProject[] }>('/projects')
    return data.projects || []
  },

  async getProjectTasks(projectId: string) {
    const data = await request<{ tasks: BackendTask[] }>(`/tasks/projects/${projectId}`)
    return (data.tasks || []).map(toTask)
  },

  async createProject(input: Pick<Project, 'name' | 'description'>) {
    const data = await request<{ project: BackendProject }>('/projects', {
      method: 'POST',
      body: {
        name: input.name,
        description: input.description,
      },
    })
    return data.project
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const data = await request<{ project: BackendProject }>(`/projects/${id}`, {
      method: 'PUT',
      body: {
        name: updates.name,
        description: updates.description,
      },
    })
    return data.project
  },

  async addProjectMember(projectId: string, userId: string) {
    const data = await request<{ project: BackendProject }>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: { userId },
    })
    return data.project
  },

  async removeProjectMember(projectId: string, userId: string) {
    const data = await request<{ project: BackendProject }>(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    })
    return data.project
  },

  async createTask(projectId: string, task: Omit<Task, 'id' | 'createdAt'>, fallbackAssignee: string) {
    const data = await request<{ task: BackendTask }>(`/tasks/projects/${projectId}`, {
      method: 'POST',
      body: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: backendPriority(task.priority),
        assignedTo: task.assignee || fallbackAssignee,
      },
    })
    return toTask(data.task)
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const body: Record<string, unknown> = {}
    if (updates.title !== undefined) body.title = updates.title
    if (updates.description !== undefined) body.description = updates.description
    if (updates.dueDate !== undefined) body.dueDate = updates.dueDate
    if (updates.priority !== undefined) body.priority = backendPriority(updates.priority)
    if (updates.status !== undefined) body.status = backendStatus(updates.status)
    if (updates.assignee !== undefined) body.assignedTo = updates.assignee

    const data = await request<{ task: BackendTask }>(`/tasks/${id}`, {
      method: 'PUT',
      body,
    })
    return toTask(data.task)
  },

  async updateTaskStatus(id: string, status: Task['status']) {
    const data = await request<{ task: BackendTask }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: { status: backendStatus(status) },
    })
    return toTask(data.task)
  },

  async deleteTask(id: string) {
    await request(`/tasks/${id}`, { method: 'DELETE' })
  },

  mapProjects(projects: BackendProject[], tasks: Task[]) {
    return projects.map((project) => toProject(project, tasks))
  },

  mapTeamMembers(projects: BackendProject[], currentUser: TeamMember | null) {
    const members = new Map<string, TeamMember>()
    if (currentUser?.id) members.set(currentUser.id, currentUser)

    projects.forEach((project) => {
      if (project.admin) {
        const member = toTeamMember(project.admin)
        if (member.id) members.set(member.id, member)
      }
      ;(project.members || []).forEach((rawMember) => {
        const member = toTeamMember(rawMember)
        if (member.id) members.set(member.id, member)
      })
    })

    return Array.from(members.values())
  },
}
