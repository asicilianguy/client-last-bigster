// components/shared/role-protected-route.tsx

import { ReactNode } from "react";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { Spinner } from "@/components/ui/spinner";

type RoleProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: Array<"CEO" | "RESPONSABILE_REPARTO" | "RISORSA_UMANA" | "DEVELOPER">;
};

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user } = useRoleProtection(allowedRoles);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return <>{children}</>;
}
