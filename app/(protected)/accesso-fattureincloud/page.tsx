"use client";

import { useState, useMemo } from "react";
import { Invoice, useFattureInCloudAuth } from "@/hooks/useFattureInCloudAuth";
import { useGetCompaniesQuery } from "@/lib/redux/features/companies/companiesApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Euro,
  Building,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  ExternalLink,
  ArrowUpDown,
  Zap,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Phone,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { Company } from "@/types/company";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "client";
type FilterCode = "ALL" | "AV" | "INS" | "MDO";
type ViewMode = "invoices" | "companies";
type CompanySortOption =
  | "name-asc"
  | "name-desc"
  | "dipendenti-desc"
  | "dipendenti-asc"
  | "citta";

export default function FattureInCloudManager() {
  // State per fatture
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterCode, setFilterCode] = useState<FilterCode>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // State per view mode
  const [viewMode, setViewMode] = useState<ViewMode>("invoices");

  // State per compagnie
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [companySortBy, setCompanySortBy] =
    useState<CompanySortOption>("name-asc");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");

  // Query per compagnie
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useGetCompaniesQuery();

  const {
    isAuthenticated,
    isLoading,
    error,
    companyId,
    startAuthorization,
    logout,
    fetchInvoices,
    isTokenValid,
  } = useFattureInCloudAuth({
    clientId: "MTtGdO45g82xfjERs9lGODOmXHRuaBWM",
    clientSecret:
      "XRm8t8N4l5jEwJMEKM6p02zYCJ6BJcxfDVSYgUeeRUVZMmxbFgfFowBetpT4Kig0",
    redirectUri: `http://localhost:3001/accesso-fattureincloud`,
    companyIndex: 0,
    companyId: 709890,
  });

  const handleLoadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const getDateRangeText = () => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    return `${formatDate(threeMonthsAgo)} - ${formatDate(today)}`;
  };

  // Filtri e sorting per fatture
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (filterCode !== "ALL") {
      filtered = filtered.filter((invoice) =>
        invoice.items_codes?.includes(filterCode)
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.entity.name.toLowerCase().includes(search) ||
          invoice.contract_number?.toLowerCase().includes(search) ||
          invoice.number.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount_gross - a.amount_gross;
        case "amount-asc":
          return a.amount_gross - b.amount_gross;
        case "client":
          return a.entity.name.localeCompare(b.entity.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [invoices, filterCode, searchTerm, sortBy]);

  // Filtri e sorting per compagnie
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies];

    if (regionFilter !== "ALL") {
      filtered = filtered.filter((company) => company.regione === regionFilter);
    }

    if (companySearchTerm) {
      const search = companySearchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.nome.toLowerCase().includes(search) ||
          company.citta?.toLowerCase().includes(search) ||
          company.provincia?.toLowerCase().includes(search) ||
          company.partita_iva?.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (companySortBy) {
        case "name-asc":
          return a.nome.localeCompare(b.nome);
        case "name-desc":
          return b.nome.localeCompare(a.nome);
        case "dipendenti-desc":
          return (b.numero_dipendenti || 0) - (a.numero_dipendenti || 0);
        case "dipendenti-asc":
          return (a.numero_dipendenti || 0) - (b.numero_dipendenti || 0);
        case "citta":
          return (a.citta || "").localeCompare(b.citta || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [companies, regionFilter, companySearchTerm, companySortBy]);

  const codeCounts = useMemo(() => {
    const counts = {
      ALL: invoices.length,
      AV: 0,
      INS: 0,
      MDO: 0,
    };

    invoices.forEach((invoice) => {
      if (invoice.items_codes?.includes("AV")) counts.AV++;
      if (invoice.items_codes?.includes("INS")) counts.INS++;
      if (invoice.items_codes?.includes("MDO")) counts.MDO++;
    });

    return counts;
  }, [invoices]);

  // Statistiche regioni per filtro compagnie
  const regionStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: companies.length };

    companies.forEach((company) => {
      if (company.regione) {
        stats[company.regione] = (stats[company.regione] || 0) + 1;
      }
    });

    return stats;
  }, [companies]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set(
      companies.map((c) => c.regione).filter((r): r is string => !!r)
    );
    return Array.from(regions).sort();
  }, [companies]);

  const CodeBadge = ({ code }: { code: string }) => {
    const colors: Record<string, string> = {
      AV: "bg-blue-50 text-blue-700 border-blue-200",
      INS: "bg-green-50 text-green-700 border-green-200",
      MDO: "bg-purple-50 text-purple-700 border-purple-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold border ${
          colors[code] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
        style={{ borderRadius: "0px" }}
      >
        {code}
      </span>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Spinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bigster-page-container"
      >
        <Card className="shadow-sm border-0 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">
                  Errore di connessione
                </h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Not Authenticated State
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bigster-page-container"
      >
        <div className="bigster-page-header">
          <h1 className="bigster-page-title">Fatture in Cloud</h1>
          <p className="bigster-page-description">
            Connetti il tuo account per gestire le fatture
          </p>
        </div>

        <Card className="shadow-sm border-0 animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <FileText className="h-16 w-16 mx-auto text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              Connessione necessaria
            </h3>
            <p className="text-muted-foreground mb-8">
              Connetti il tuo account Fatture in Cloud per visualizzare e
              gestire le fatture degli ultimi 3 mesi
            </p>
            <Button
              onClick={() => startAuthorization()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              size="lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Connetti Fatture in Cloud
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Authenticated State
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bigster-page-container"
    >
      {/* Header */}
      <div className="bigster-page-header">
        <motion.h1
          className="bigster-page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Gestione Fatture e Compagnie
        </motion.h1>
        <motion.p
          className="bigster-page-description"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Visualizza fatture da Fatture in Cloud e gestisci le compagnie del
          database
        </motion.p>
      </div>

      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-sm border-0 mb-6 bg-primary/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                    Connesso a Fatture in Cloud
                  </h3>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      Company ID:{" "}
                      <span className="font-semibold text-foreground">
                        {companyId}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Token stato:{" "}
                      <span
                        className={`font-semibold ${
                          isTokenValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isTokenValid ? "Attivo" : "Scaduto"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnetti
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <Card className="shadow-sm border-0">
          <CardContent className="p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("invoices")}
                className={`flex-1 px-6 py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  viewMode === "invoices"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-foreground hover:bg-muted/50"
                }`}
                style={{ borderRadius: "0px" }}
              >
                <FileText className="h-4 w-4" />
                Fatture ({invoices.length})
              </button>
              <button
                onClick={() => setViewMode("companies")}
                className={`flex-1 px-6 py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  viewMode === "companies"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-foreground hover:bg-muted/50"
                }`}
                style={{ borderRadius: "0px" }}
              >
                <Building2 className="h-4 w-4" />
                Compagnie ({companies.length})
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "invoices" ? (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Load Invoices Card */}
            <Card className="shadow-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Carica Fatture
                </CardTitle>
                <CardDescription>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Periodo automatico: Ultimi 3 mesi ({getDateRangeText()})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLoadInvoices}
                  disabled={isLoadingInvoices}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  size="lg"
                >
                  {isLoadingInvoices ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Caricamento in corso...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Carica Fatture
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Filters and Results for Invoices */}
            {invoices.length > 0 && (
              <>
                {/* Filters Card */}
                <Card className="shadow-sm border-0 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtri e Ricerca
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Code Filters */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Filtra per codice servizio:
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {(["ALL", "AV", "INS", "MDO"] as FilterCode[]).map(
                          (code) => (
                            <button
                              key={code}
                              onClick={() => setFilterCode(code)}
                              className={`px-4 py-2 font-semibold text-sm transition-all border ${
                                filterCode === code
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-white text-foreground border-border hover:border-primary/50"
                              }`}
                              style={{ borderRadius: "0px" }}
                            >
                              {code === "ALL" ? "Tutti" : code} (
                              {codeCounts[code]})
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Search and Sort */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          <Search className="inline h-4 w-4 mr-1" />
                          Cerca:
                        </label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Cliente, contratto, numero fattura..."
                          className="w-full px-4 py-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          style={{ borderRadius: "0px" }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          <ArrowUpDown className="inline h-4 w-4 mr-1" />
                          Ordina per:
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(e.target.value as SortOption)
                          }
                          className="w-full px-4 py-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          style={{ borderRadius: "0px" }}
                        >
                          <option value="date-desc">Data (più recente)</option>
                          <option value="date-asc">Data (più vecchia)</option>
                          <option value="amount-desc">
                            Importo (maggiore)
                          </option>
                          <option value="amount-asc">Importo (minore)</option>
                          <option value="client">Cliente (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoices List */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Fatture trovate: {filteredAndSortedInvoices.length}
                      {filteredAndSortedInvoices.length !== invoices.length && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (filtrate da {invoices.length})
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {filteredAndSortedInvoices.map(
                        (invoice: any, index: number) => (
                          <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-6 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="h-5 w-5 text-primary" />
                                  <h4 className="font-bold text-lg tracking-tight">
                                    {invoice.entity.name}
                                  </h4>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Fattura{" "}
                                    <span className="font-semibold text-foreground">
                                      {invoice.number}
                                    </span>
                                    <span className="text-border">•</span>
                                    <Calendar className="h-4 w-4" />
                                    {new Date(invoice.date).toLocaleDateString(
                                      "it-IT"
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Contratto:{" "}
                                    <span className="font-semibold text-foreground">
                                      {invoice.contract_number || "N/D"}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="text-right bg-primary/10 p-4 border border-primary/20">
                                <p className="font-bold text-2xl text-primary-foreground tracking-tight flex items-center gap-1">
                                  <Euro className="h-5 w-5" />
                                  {invoice.amount_gross.toFixed(2)}
                                </p>
                                <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                                  <p>Netto: €{invoice.amount_net.toFixed(2)}</p>
                                  <p>IVA: €{invoice.amount_vat.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Service Codes */}
                            {invoice.items_codes &&
                              invoice.items_codes.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                                    CODICI SERVIZI:
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    {invoice.items_codes.map(
                                      (code: string, idx: number) => (
                                        <CodeBadge key={idx} code={code} />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Services List */}
                            {invoice.items_names &&
                              invoice.items_names.length > 0 && (
                                <div className="mb-4 p-4 bg-muted/30 border border-border">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                                    SERVIZI:
                                  </p>
                                  <ul className="space-y-1">
                                    {invoice.items_names.map(
                                      (name: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-foreground flex items-start gap-2"
                                        >
                                          <span className="text-primary mt-1">
                                            •
                                          </span>
                                          <span>{name}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            <a
                              href={invoice.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline transition"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visualizza PDF su Fatture in Cloud
                            </a>
                          </motion.div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="companies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Companies Stats Card */}
            <Card className="shadow-sm border-0 mb-6 bg-muted/30">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Totale Compagnie
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {companies.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary">
                      <MapPin className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Regioni</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {uniqueRegions.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Dipendenti Totali
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {companies.reduce(
                          (sum, c) => sum + (c.numero_dipendenti || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Companies Filters */}
            {isLoadingCompanies ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-12 w-12 text-primary" />
              </div>
            ) : (
              <>
                <Card className="shadow-sm border-0 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtri e Ricerca
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Region Filters */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Filtra per regione:
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setRegionFilter("ALL")}
                          className={`px-4 py-2 font-semibold text-sm transition-all border ${
                            regionFilter === "ALL"
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-white text-foreground border-border hover:border-primary/50"
                          }`}
                          style={{ borderRadius: "0px" }}
                        >
                          Tutte ({regionStats.ALL})
                        </button>
                        {uniqueRegions.slice(0, 6).map((region) => (
                          <button
                            key={region}
                            onClick={() => setRegionFilter(region)}
                            className={`px-4 py-2 font-semibold text-sm transition-all border ${
                              regionFilter === region
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-white text-foreground border-border hover:border-primary/50"
                            }`}
                            style={{ borderRadius: "0px" }}
                          >
                            {region} ({regionStats[region] || 0})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search and Sort */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          <Search className="inline h-4 w-4 mr-1" />
                          Cerca:
                        </label>
                        <input
                          type="text"
                          value={companySearchTerm}
                          onChange={(e) => setCompanySearchTerm(e.target.value)}
                          placeholder="Nome, città, P.IVA..."
                          className="w-full px-4 py-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          style={{ borderRadius: "0px" }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          <ArrowUpDown className="inline h-4 w-4 mr-1" />
                          Ordina per:
                        </label>
                        <select
                          value={companySortBy}
                          onChange={(e) =>
                            setCompanySortBy(
                              e.target.value as CompanySortOption
                            )
                          }
                          className="w-full px-4 py-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          style={{ borderRadius: "0px" }}
                        >
                          <option value="name-asc">Nome (A-Z)</option>
                          <option value="name-desc">Nome (Z-A)</option>
                          <option value="dipendenti-desc">
                            Dipendenti (maggiore)
                          </option>
                          <option value="dipendenti-asc">
                            Dipendenti (minore)
                          </option>
                          <option value="citta">Città (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Companies List */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Compagnie trovate: {filteredAndSortedCompanies.length}
                      {filteredAndSortedCompanies.length !==
                        companies.length && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (filtrate da {companies.length})
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {filteredAndSortedCompanies.map(
                        (company: Company, index: number) => (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            className="p-6 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="h-5 w-5 text-primary" />
                                  <h4 className="font-bold text-lg tracking-tight">
                                    {company.nome}
                                  </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                  {company.partita_iva && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-semibold text-foreground">
                                        P.IVA:
                                      </span>{" "}
                                      {company.partita_iva}
                                    </p>
                                  )}
                                  {company.codice_fiscale && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-semibold text-foreground">
                                        C.F.:
                                      </span>{" "}
                                      {company.codice_fiscale}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                  {company.citta && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>
                                        {company.citta}
                                        {company.provincia &&
                                          ` (${company.provincia})`}
                                        {company.regione &&
                                          ` - ${company.regione}`}
                                      </span>
                                    </div>
                                  )}
                                  {company.numero_dipendenti && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Users className="h-4 w-4 text-primary" />
                                      <span>
                                        {company.numero_dipendenti} dipendenti
                                      </span>
                                    </div>
                                  )}
                                  {company.fatturato && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <TrendingUp className="h-4 w-4 text-primary" />
                                      <span>{company.fatturato}</span>
                                    </div>
                                  )}
                                </div>

                                {(company.telefono ||
                                  company.email_referente) && (
                                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                                    {company.telefono && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span>{company.telefono}</span>
                                      </div>
                                    )}
                                    {company.email_referente && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span>{company.email_referente}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="text-right ml-4">
                                <Badge
                                  variant="outline"
                                  className="border-primary/30 bg-primary/10"
                                >
                                  ID: {company.id}
                                </Badge>
                              </div>
                            </div>

                            {company.note && (
                              <div className="mt-4 p-4 bg-muted/30 border border-border">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  NOTE:
                                </p>
                                <p className="text-sm text-foreground">
                                  {company.note}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
