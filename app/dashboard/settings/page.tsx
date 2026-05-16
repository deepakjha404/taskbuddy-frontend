'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Lock, Package, Users } from 'lucide-react'
import { useApp } from '@/context/app-context'

const userPreferences = {
  timezone: 'Asia/Kolkata',
  language: 'en',
  theme: 'auto',
  timeFormat: '12h',
}

const notificationPreferences = {
  taskAssigned: true,
  taskCompleted: true,
  commentMentioned: true,
  deadline: true,
  deadlineReminder: true,
  projectUpdate: true,
  email: true,
  inApp: true,
}

const connectionIntegrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync repository activity with your workspace',
    connected: false,
    connectedDate: null,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send task updates to team channels',
    connected: false,
    connectedDate: null,
  },
  {
    id: 'google',
    name: 'Google Calendar',
    description: 'Add task due dates to your calendar',
    connected: false,
    connectedDate: null,
  },
]

export default function SettingsPage() {
  const { currentUser } = useApp()
  const [firstName, ...restName] = currentUser.name.split(' ')
  const lastName = restName.join(' ')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="First name" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Last name" defaultValue={lastName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" defaultValue={currentUser.email} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>{userPreferences.timezone}</option>
                    <option>UTC</option>
                    <option>Europe/London</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>{userPreferences.language}</option>
                    <option>es</option>
                    <option>fr</option>
                  </select>
                </div>
              </div>
            </div>
            <Button className="mt-6">Save Changes</Button>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Display Preferences</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <label key={theme} className="flex items-center gap-2">
                      <input type="radio" name="theme" defaultChecked={theme === userPreferences.theme} className="w-4 h-4" />
                      <span className="text-sm text-foreground capitalize">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Format</Label>
                <div className="flex gap-4">
                  {['12h', '24h'].map((format) => (
                    <label key={format} className="flex items-center gap-2">
                      <input type="radio" name="timeFormat" defaultChecked={format === userPreferences.timeFormat} className="w-4 h-4" />
                      <span className="text-sm text-foreground">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'taskAssigned', label: 'Task Assigned to Me' },
                { key: 'taskCompleted', label: 'Task Completed' },
                { key: 'commentMentioned', label: 'Mentioned in Comment' },
                { key: 'deadline', label: 'Task Deadline Approaching' },
                { key: 'deadlineReminder', label: 'Deadline Reminder' },
                { key: 'projectUpdate', label: 'Project Updates' },
              ].map((pref) => (
                <label key={pref.key} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:border-border cursor-pointer">
                  <span className="text-foreground font-medium">{pref.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={notificationPreferences[pref.key as keyof typeof notificationPreferences]}
                    className="w-4 h-4 rounded"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Notification Channels</h2>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications' },
                { key: 'inApp', label: 'In-App Notifications' },
              ].map((channel) => (
                <label key={channel.key} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                  <span className="text-foreground font-medium">{channel.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={notificationPreferences[channel.key as keyof typeof notificationPreferences]}
                    className="w-4 h-4 rounded"
                  />
                </label>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Password & Security</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button className="mt-6">Change Password</Button>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
            <Button variant="outline">Enable 2FA</Button>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Connected Integrations</h2>
            <div className="space-y-3">
              {connectionIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {integration.connected ? (
                      <>
                        <Badge variant="default" className="bg-green-500">
                          Connected
                        </Badge>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
