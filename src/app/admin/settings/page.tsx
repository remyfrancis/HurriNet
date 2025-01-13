import { Metadata } from 'next'
import SettingsForm from './settings-form'

export const metadata: Metadata = {
  title: 'System Settings | HurriNet Admin',
  description: 'Configure system settings for HurriNet.',
}

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>
      <SettingsForm />
    </div>
  )
}

