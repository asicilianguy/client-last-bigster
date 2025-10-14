"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, AlertCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SelectionFormProps {
  onSubmit: (data: {
    titolo: string;
    pacchetto: "BASE" | "MDO";
  }) => Promise<void>;
  isLoading: boolean;
}

// Classe base per gli input
const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2";

export default function SelectionForm({
  onSubmit,
  isLoading,
}: SelectionFormProps) {
  const [titolo, setTitolo] = useState("");
  const [pacchetto, setPacchetto] = useState<"BASE" | "MDO">("BASE");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione
    if (!titolo.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }

    if (titolo.length < 3) {
      setError("Il titolo deve contenere almeno 3 caratteri");
      return;
    }

    if (titolo.length > 200) {
      setError("Il titolo non può superare i 200 caratteri");
      return;
    }

    setError("");
    await onSubmit({
      titolo: titolo.trim(),
      pacchetto,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-bigster-card border border-bigster-border rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-bigster-text">
            Dettagli Selezione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titolo Field */}
            <div>
              <label
                htmlFor="titolo"
                className="block text-sm font-medium text-bigster-text mb-2"
              >
                Titolo della Selezione
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                id="titolo"
                value={titolo}
                onChange={(e) => {
                  setTitolo(e.target.value);
                  setError("");
                }}
                placeholder="Es: Ricerca Odontoiatra Senior"
                className={`${inputBase} ${error ? "border-red-400" : ""}`}
                disabled={isLoading}
                maxLength={200}
              />

              {/* Character Counter */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-bigster-text-muted">
                  Minimo 3 caratteri, massimo 200
                </p>
                <p
                  className={`text-xs ${
                    titolo.length > 200
                      ? "text-red-600"
                      : "text-bigster-text-muted"
                  }`}
                >
                  {titolo.length}/200
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 p-3 border border-red-400 bg-red-50 rounded-none"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Pacchetto Selection - Pattern toggle corretto */}
            <div>
              <label className="block text-sm font-medium text-bigster-text mb-3">
                Tipo di Pacchetto
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPacchetto("BASE")}
                  disabled={isLoading}
                  className={`p-4 border transition-all text-left rounded-none ${
                    pacchetto === "BASE"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:border-bigster-text-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-base mb-1">Base</p>
                      <p
                        className={`text-xs ${
                          pacchetto === "BASE"
                            ? "text-bigster-primary-text/80"
                            : "text-bigster-text-muted"
                        }`}
                      >
                        Pacchetto standard per selezioni base
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPacchetto("MDO")}
                  disabled={isLoading}
                  className={`p-4 border transition-all text-left rounded-none ${
                    pacchetto === "MDO"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:border-bigster-text-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-base mb-1">MDO</p>
                      <p
                        className={`text-xs ${
                          pacchetto === "MDO"
                            ? "text-bigster-primary-text/80"
                            : "text-bigster-text-muted"
                        }`}
                      >
                        Pacchetto avanzato Master DTO
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-bigster-surface border border-bigster-border rounded-none">
              <h4 className="text-sm font-semibold text-bigster-text mb-2">
                Riepilogo:
              </h4>
              <ul className="space-y-1 text-sm text-bigster-text-muted">
                <li>
                  Il titolo sarà visibile in tutte le comunicazioni relative a
                  questa selezione
                </li>
                <li>
                  Il tipo di pacchetto determina le funzionalità e i servizi
                  disponibili
                </li>
                <li>
                  Entrambi i campi potranno essere modificati successivamente
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-bigster-border">
              <Button
                type="submit"
                disabled={isLoading || !titolo.trim()}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creazione in corso...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Crea Selezione
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
