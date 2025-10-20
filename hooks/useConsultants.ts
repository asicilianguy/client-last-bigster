import { useGetConsulentiQuery } from "@/lib/redux/features/users/usersApiSlice";
import type { UserWithSelectionCount } from "@/types/user";

/**
 * Hook personalizzato per ottenere la lista dei consulenti
 * Wrapper attorno a useGetConsulentiQuery per mantenere la stessa interfaccia
 */
export function useConsultants() {
  const {
    data: consultants = [],
    isLoading,
    error: queryError,
  } = useGetConsulentiQuery();

  // Trasforma l'errore RTK Query in stringa per retrocompatibilità
  const error = queryError
    ? "data" in queryError
      ? JSON.stringify(queryError.data)
      : "error" in queryError
      ? String(queryError.error)
      : "Errore nel caricamento dei consulenti"
    : null;

  return {
    consultants: consultants as UserWithSelectionCount[],
    isLoading,
    error,
  };
}
