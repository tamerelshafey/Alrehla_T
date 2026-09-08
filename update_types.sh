sed -i "/export type UserProfile = {/!b;n;n;n;n;n;n;a\  permissions?: AdminPermission[];" src/types/index.ts
cat << 'INNER_EOF' >> src/types/index.ts

export type AdminPermission = 
  | 'canManageUsers'
  | 'canManageInstructors'
  | 'canManagePublishers'
  | 'canManageCatalog'
  | 'canManageSubscriptions'
  | 'canManageOrders'
  | 'canManageBookings'
  | 'canManageSupport'
  | 'canManageContent'
  | 'canManageFinance'
  | 'canViewAuditLogs';
INNER_EOF
