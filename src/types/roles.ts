export enum UserRole {
  DEPENDIENTE = "dependiente",
  BARTENDER = "bartender",
  COCINERO = "cocinero",
  ADMIN = "admin",
  LUNCH = "lunch",
}
export const AVAILABLE_ROLES = Object.values(UserRole);

export type RoleType = keyof typeof UserRole;
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.DEPENDIENTE]: "Dependiente",
  [UserRole.BARTENDER]: "Bartender",
  [UserRole.COCINERO]: "Cocinero",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.LUNCH]: "Lunch",
};

export const ROLE_OPTIONS = AVAILABLE_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export const RoleUtils = {
  isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  },

  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role] || role;
  },

  isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  },

  canAccessKitchen(role: UserRole): boolean {
    return role === UserRole.COCINERO || role === UserRole.BARTENDER;
  },
};
