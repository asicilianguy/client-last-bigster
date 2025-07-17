// hooks/use-user-role.ts
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";

export type UserRole =
  | "CEO"
  | "RESPONSABILE_REPARTO"
  | "RISORSA_UMANA"
  | "DEVELOPER"
  | null;

export function useUserRole() {
  const user = useSelector(selectCurrentUser);

  const role = user?.ruolo as UserRole;

  console.log({ role });

  // Convenience methods for role checks
  const isCEO = role === "CEO";
  const isResponsabile = role === "RESPONSABILE_REPARTO";
  const isHR = role === "RISORSA_UMANA";
  const isDeveloper = role === "DEVELOPER";

  // Permission-based checks for specific actions
  const canCreateSelection = isResponsabile || isCEO || isDeveloper;
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
