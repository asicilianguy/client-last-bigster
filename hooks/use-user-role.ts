// hooks/use-user-role.ts
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { UserRole } from "@/types/enums";

export function useUserRole() {
  const user = useSelector(selectCurrentUser);

  const role = user?.ruolo;

  // Convenience methods for role checks
  const isCEO = role === UserRole.CEO;
  const isResponsabile = role === UserRole.RESPONSABILE_REPARTO;
  const isHR = role === UserRole.RISORSA_UMANA;
  const isDeveloper = role === UserRole.DEVELOPER;
  const isResponsabileHR = isResponsabile && user?.reparto_id === 12;

  // Permission-based checks for specific actions
  const canCreateSelection = isResponsabile || isDeveloper;
  const canApproveSelection = isCEO || isDeveloper;
  const canAssignHR = isCEO || isDeveloper;
  const canManageAnnouncements = isHR || isCEO || isDeveloper;
  const canManageApplications = isHR || isCEO || isDeveloper;

  // Check if the user is a department manager for a specific department
  const isDepartmentManager = (
    departmentId: number | null | undefined
  ): boolean => {
    if (!user || !departmentId) return false;
    return user.reparto_id === departmentId && isResponsabile;
  };

  return {
    role,
    isCEO,
    isResponsabile,
    isResponsabileHR,
    isHR,
    isDeveloper,
    canCreateSelection,
    canApproveSelection,
    canAssignHR,
    canManageAnnouncements,
    canManageApplications,
    isDepartmentManager,
    user,
  };
}
