import { Permission } from '@/Enums'

export const permissionData = {
  FULL_ACCESS: {
    enumeration: Permission.FullAccess,
    label: 'Full Access',
    description: 'Reserved for board owners. Grants unrestricted access to all board operations, including administrative actions.',
    level: 0
  },
  LIMITED_ACCESS: {
    enumeration: Permission.LimitedAccess,
    label: 'Limited Access',
    description: 'Standard collaborator role. Allows full access to board content but excludes administrative control.',
    level: 1
  },
  CARD_OPERATOR: {
    enumeration: Permission.CardOperator,
    label: 'Card Operator',
    description: 'Grants permissions to manage cards (create, edit, move), but restricts access to column management.',
    level: 2
  },
  LIMITED_CARD_OPERATOR: {
    enumeration: Permission.LimitedCardOperator,
    label: 'Limited Card Operator',
    description: 'Allows only basic card movements (e.g., drag and drop). Editing or creating cards is restricted.',
    level: 3
  },
  READ_ONLY: {
    enumeration: Permission.ReadOnly,
    label: 'Read Only',
    description: 'View-only access. All modifications are restricted, but the board remains fully visible.',
    level: 4
  }
}
