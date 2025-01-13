export const ROLES = {
    PUBLIC: 'public',
    EMERGENCY_RESPONDER: 'emergency_responder',
    COORDINATOR: 'coordinator',
    ADMIN: 'admin'
  } as const
  
  export type UserRole = keyof typeof ROLES
  
  export const rolePermissions = {
    [ROLES.PUBLIC]: {
      canViewResources: true,
      canViewAlerts: true,
      canCreateRequests: true,
      canUpdateRequests: false,
      canManageInventory: false,
    },
    [ROLES.EMERGENCY_RESPONDER]: {
      canViewResources: true,
      canViewAlerts: true,
      canCreateRequests: true,
      canUpdateRequests: true,
      canManageInventory: false,
    },
    [ROLES.COORDINATOR]: {
      canViewResources: true,
      canViewAlerts: true,
      canCreateRequests: true,
      canUpdateRequests: true,
      canManageInventory: true,
    },
    [ROLES.ADMIN]: {
      canViewResources: true,
      canViewAlerts: true,
      canCreateRequests: true,
      canUpdateRequests: true,
      canManageInventory: true,
    },
  }