import { useUser } from '@/lib/auth'
import { rolePermissions } from '@/lib/roles'
import type { ReactNode } from 'react'

interface RoleBasedAuthProps {
  children: ReactNode
  permission: keyof typeof rolePermissions[keyof typeof rolePermissions]
}

export default function RoleBasedAuth({ children, permission }: RoleBasedAuthProps) {
  const { user } = useUser()
  
  if (!user || !user.role) {
    return null
  }

  const userPermissions = rolePermissions[user.role]
  
  if (!userPermissions || !userPermissions[permission]) {
    return null
  }

  return <>{children}</>
}