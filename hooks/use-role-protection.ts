// hooks/use-role-protection.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "./use-user-role";

export function useRoleProtection(
  allowedRoles: Array<"CEO" | "RESPONSABILE_REPARTO" | "RISORSA_UMANA" | "DEVELOPER">
) {
  const { role, user } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      router.push("/selezioni"); // Redirect to main page if not authorized
    }
  }, [role, user, router, allowedRoles]);

  return { role, user };
}
