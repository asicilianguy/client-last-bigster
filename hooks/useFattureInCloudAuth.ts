import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Scope } from "@fattureincloud/fattureincloud-ts-sdk";

// Types
export interface FattureInCloudConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  companyIndex?: number; // Quale company selezionare (default: 0)
  companyId: number; // NUOVO: Company ID specifica
}

export interface FattureInCloudAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  companyId: string | null;
  expiresAt: number | null;
  error: string | null;
}

export interface CompanyInfo {
  id: number;
  name: string;
  type: string;
  vat_number?: string;
  tax_code?: string;
}

export interface Invoice {
  id: number;
  type: string;
  amount_net: number;
  amount_vat: number;
  amount_gross: number;
  entity: {
    name: string;
    vat_number: string;
    tax_code: string;
    address_street: string;
    address_postal_code: string;
    address_city: string;
    address_province: string;
    country: string;
    id: number;
  };
  contract_number: string;
  date: string;
  number: string;
  url: string;
  service_name: string;
  // NUOVI CAMPI
  service_code?: string;
  items_codes?: string[];
  items_names?: string[];
}

// Hook principale - COMPLETAMENTE STANDALONE
export function useFattureInCloudAuth(config: FattureInCloudConfig) {
  const searchParams = useSearchParams();
  const companyIndex = config.companyIndex ?? 0;

  // State
  const [authState, setAuthState] = useState<FattureInCloudAuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
    companyId: null,
    expiresAt: null,
    error: null,
  });

  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const isTokenValid = useCallback((expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(parseInt(expiresAt)) > new Date();
  }, []);

  const saveTokenToStorage = useCallback(
    (tokenData: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }) => {
      localStorage.setItem("fic_accessToken", tokenData.accessToken);
      localStorage.setItem("fic_refreshToken", tokenData.refreshToken);

      const expiresAt = Date.now() + tokenData.expiresIn * 1000;
      localStorage.setItem("fic_expiresAt", expiresAt.toString());

      setAuthState((prev) => ({
        ...prev,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt,
        isAuthenticated: true,
        error: null,
      }));
    },
    []
  );

  const saveCompanyToStorage = useCallback((companyId: number) => {
    localStorage.setItem("fic_companyId", companyId.toString());

    setAuthState((prev) => ({
      ...prev,
      companyId: companyId.toString(),
    }));
  }, []);

  const clearStorage = useCallback(() => {
    localStorage.removeItem("fic_accessToken");
    localStorage.removeItem("fic_refreshToken");
    localStorage.removeItem("fic_companyId");
    localStorage.removeItem("fic_expiresAt");
    localStorage.removeItem("fic_state");

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      companyId: null,
      expiresAt: null,
      error: null,
    });

    setCompanies([]);
  }, []);

  // ==========================================
  // GENERAZIONE URL AUTORIZZAZIONE
  // ==========================================

  const generateAuthUrl = useCallback(
    (state: string): string => {
      const scopes = "settings:a issued_documents.invoices:r";

      const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: scopes,
        state: state,
      });

      return `https://api-v2.fattureincloud.it/oauth/authorize?${params.toString()}`;
    },
    [config.clientId, config.redirectUri]
  );

  // ==========================================
  // API CALLS - FETCH DIRETTE
  // ==========================================

  const fetchToken = useCallback(
    async (code: string) => {
      const response = await fetch("/api/fattureincloud/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch token");
      }

      return await response.json();
    },
    [config.clientId, config.clientSecret, config.redirectUri]
  );

  const fetchCompanies = useCallback(async (accessToken: string) => {
    const response = await fetch(
      `/api/fattureincloud/companies?token=${encodeURIComponent(accessToken)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch companies");
    }

    return await response.json();
  }, []);

  const fetchInvoices = useCallback(async (): Promise<Invoice[]> => {
    if (!authState.accessToken || !authState.companyId) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `/api/fattureincloud/invoices?token=${encodeURIComponent(
        authState.accessToken
      )}&companyId=${authState.companyId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch invoices");
    }

    const data = await response.json();
    return data.data || [];
  }, [authState.accessToken, authState.companyId]);

  // ==========================================
  // AUTHORIZATION FLOW
  // ==========================================

  const startAuthorization = useCallback(
    (additionalData?: Record<string, string>) => {
      try {
        // Salva dati aggiuntivi
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            localStorage.setItem(`fic_${key}`, value);
          });
        }

        // Genera state casuale
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("fic_state", state);

        // Genera URL e reindirizza
        const authUrl = generateAuthUrl(state);
        window.location.href = authUrl;
      } catch (error) {
        console.error("Error starting authorization:", error);
        setAuthState((prev) => ({
          ...prev,
          error: "Errore nell'avvio dell'autorizzazione",
          isLoading: false,
        }));
      }
    },
    [generateAuthUrl]
  );

  const retrieveToken = useCallback(
    async (code: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const tokenData = await fetchToken(code);
        saveTokenToStorage(tokenData);

        const companiesData = await fetchCompanies(tokenData.accessToken);

        if (
          companiesData?.data?.companies &&
          companiesData.data.companies.length > 0
        ) {
          const companiesList = companiesData.data.companies;
          setCompanies(companiesList);

          // NUOVO: Seleziona company per ID o per index
          let selectedCompany;

          if (config.companyId) {
            // Cerca per ID specifico
            selectedCompany = companiesList.find(
              (c: CompanyInfo) => c.id === config.companyId
            );
            if (!selectedCompany) {
              throw new Error(`Company con ID ${config.companyId} non trovata`);
            }
          } else {
            // Usa l'indice (default: 0)
            selectedCompany = companiesList[companyIndex] || companiesList[0];
          }

          saveCompanyToStorage(selectedCompany.id);

          setAuthState((prev) => ({ ...prev, isLoading: false }));

          return {
            success: true,
            companies: companiesList,
            selectedCompany,
          };
        } else {
          throw new Error("Nessuna company trovata");
        }
      } catch (error) {
        // ... resto uguale
      }
    },
    [
      fetchToken,
      fetchCompanies,
      saveTokenToStorage,
      saveCompanyToStorage,
      clearStorage,
      companyIndex,
      config.companyId,
    ]
  );

  const loadExistingSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("fic_accessToken");
      const refreshToken = localStorage.getItem("fic_refreshToken");
      const companyId = localStorage.getItem("fic_companyId");
      const expiresAt = localStorage.getItem("fic_expiresAt");

      if (!accessToken || !companyId) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
        return { success: false, reason: "No session found" };
      }

      // Verifica validità token
      if (!isTokenValid(expiresAt)) {
        console.warn("Token expired, clearing session");
        clearStorage();
        return { success: false, reason: "Token expired" };
      }

      // Imposta stato
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        accessToken,
        refreshToken,
        companyId,
        expiresAt: expiresAt ? parseInt(expiresAt) : null,
        error: null,
      });

      // Ricarica companies (opzionale)
      try {
        const companiesData = await fetchCompanies(accessToken);
        if (companiesData?.data?.companies) {
          setCompanies(companiesData.data.companies);
        }
      } catch (error) {
        console.warn("Could not reload companies:", error);
      }

      return { success: true };
    } catch (error) {
      console.error("Error loading existing session:", error);
      clearStorage();
      return { success: false, error };
    }
  }, [isTokenValid, clearStorage, fetchCompanies]);

  const logout = useCallback(() => {
    clearStorage();
  }, [clearStorage]);

  // ==========================================
  // EFFECTS
  // ==========================================

  // Gestione callback OAuth2
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const savedState = localStorage.getItem("fic_state");

      if (!code || !state || state !== savedState) {
        await loadExistingSession();
        return;
      }

      if (localStorage.getItem("fic_accessToken")) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await retrieveToken(code);

      // Pulisci URL
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, document.title, url.toString());

      localStorage.removeItem("fic_state");
    };

    handleOAuthCallback();
  }, [searchParams, retrieveToken, loadExistingSession]);

  // Carica sessione all'avvio
  useEffect(() => {
    const code = searchParams.get("code");

    if (!code && authState.isLoading) {
      loadExistingSession();
    }
  }, []);

  return {
    // State
    ...authState,
    companies,

    // Functions
    startAuthorization,
    logout,
    fetchInvoices,
    clearStorage,

    // Utilities
    isTokenValid: isTokenValid(authState.expiresAt?.toString() || null),
  };
}
