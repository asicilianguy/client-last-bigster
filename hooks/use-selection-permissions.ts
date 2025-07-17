// hooks/use-selection-permissions.ts
export function useSelectionPermissions(selection: any, user: any) {
  // Check if the user is the owner of the selection
  const isOwner = user?.id === selection?.responsabile_id;

  // Check if the user is assigned to the selection as HR
  const isAssignedHR = user?.id === selection?.risorsa_umana_id;

  // Role-based checks
  const isCEO = user?.ruolo === "CEO";
  const isHR = user?.ruolo === "RISORSA_UMANA";
  const isDeveloper = user?.ruolo === "DEVELOPER";

  // Check if the user can view the selection
  const canView = isCEO || isDeveloper || isOwner || isAssignedHR;

  // Check if the user can edit the selection
  const canEdit = isCEO || isDeveloper || isOwner;

  // Check if the user can approve the selection
  const canApprove = (isCEO || isDeveloper) && selection?.stato === "CREATA";

  // Check if the user can assign HR to the selection
  const canAssignHR =
    (isCEO || isDeveloper) && selection?.stato === "APPROVATA";

  // Check if the user can create announcements for the selection
  const canCreateAnnouncements = (isHR && isAssignedHR) || isCEO || isDeveloper;

  // Check if the user can manage applications for the selection
  const canManageApplications =
    (isHR && isAssignedHR) || isCEO || isDeveloper || isOwner;

  return {
    isOwner,
    isAssignedHR,
    canView,
    canEdit,
    canApprove,
    canAssignHR,
    canCreateAnnouncements,
    canManageApplications,
  };
}
