import {
  Consultant,
  ConsultantsApiResponse,
} from "@/lib/redux/features/external/externalApiSlice";
import { useState, useEffect } from "react";

export function useConsultants() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/consultants");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ConsultantsApiResponse = await response.json();

        if (data.success) {
          setConsultants(data.consultants);
        } else {
          throw new Error("Failed to fetch consultants");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching consultants:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  return { consultants, isLoading, error };
}
