/**
 * Enum global de roles para escalabilidad y mantenimiento centralizado
 *
 * Este archivo define la fuente de verdad para todos los roles del sistema.
 * Para agregar nuevos roles, solo modificar este archivo.
 */

export enum UserRole {
  DEPENDIENTE = "dependiente",
  BARTENDER = "bartender",
  COCINERO = "cocinero",
  ADMIN = "admin",
}

/**
 * Array de roles disponibles para validaciones y UI
 */
export const AVAILABLE_ROLES = Object.values(UserRole);

/**
 * Tipo para uso en TypeScript
 */
export type RoleType = keyof typeof UserRole;

/**
 * Labels para mostrar en la UI (español)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.DEPENDIENTE]: "Dependiente",
  [UserRole.BARTENDER]: "Bartender",
  [UserRole.COCINERO]: "Cocinero",
  [UserRole.ADMIN]: "Administrador",
};

/**
 * Opciones para selectores de formulario
 */
export const ROLE_OPTIONS = AVAILABLE_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

/**
 * Utilidades para validación de roles
 */
export const RoleUtils = {
  /**
   * Verifica si un rol es válido
   */
  isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  },

  /**
   * Obtiene el label de un rol
   */
  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role] || role;
  },

  /**
   * Verifica si un rol tiene permisos de administrador
   */
  isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  },

  /**
   * Verifica si un rol puede acceder al área de cocina/bar
   */
  canAccessKitchen(role: UserRole): boolean {
    return role === UserRole.COCINERO || role === UserRole.BARTENDER;
  },
};
