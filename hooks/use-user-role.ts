// hooks/use-user-role.ts
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { UserRole } from "@/types/user";

export function useUserRole() {
  const user = useSelector(selectCurrentUser);

  const role = user?.ruolo;

  // Ruoli base
  const isCEO = role === UserRole.CEO;
  const isResponsabileHR = role === UserRole.RESPONSABILE_RISORSE_UMANE;
  const isHR = role === UserRole.RISORSA_UMANA;
  const isAmministrazione = role === UserRole.AMMINISTRAZIONE;
  const isDeveloper = role === UserRole.DEVELOPER;

  // Gruppi di permessi
  // Responsabile HR ha i permessi più alti (vede e può fare tutto)
  // CEO ha permessi alti ma leggermente inferiori
  const hasFullAccess = isResponsabileHR || isDeveloper;
  const hasHighAccess = isCEO || hasFullAccess;

  // Permission-based checks per azioni specifiche
  const canCreateSelection = isAmministrazione || isDeveloper; // Solo amministrazione crea selezioni
  const canApproveSelection = isCEO || isResponsabileHR || isDeveloper;
  const canAssignHR = isCEO || isResponsabileHR || isDeveloper;
  const canManageAnnouncements = isHR || hasHighAccess;
  const canManageApplications = isHR || hasHighAccess;
  const canChangeSelectionStatus = isHR || hasHighAccess;
  const canViewAllSelections = hasHighAccess;

  // Le HR vedono solo le loro selezioni assegnate
  const canViewSelection = (selection: {
    risorsa_umana_id?: number | null;
  }): boolean => {
    if (hasHighAccess) return true;
    if (isHR) return selection.risorsa_umana_id === user?.id;
    return false;
  };

  return {
    role,
    // Ruoli individuali
    isCEO,
    isResponsabileHR,
    isHR,
    isAmministrazione,
    isDeveloper,
    // Gruppi di permessi
    hasFullAccess,
    hasHighAccess,
    // Permessi specifici
    canCreateSelection,
    canApproveSelection,
    canAssignHR,
    canManageAnnouncements,
    canManageApplications,
    canChangeSelectionStatus,
    canViewAllSelections,
    canViewSelection,
    // User object
    user,
  };
}
