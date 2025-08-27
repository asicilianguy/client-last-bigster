"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  Play,
  Megaphone,
  Users2,
  MessageSquare,
  Crown,
  Trophy,
  X,
  Building2,
  Briefcase,
  ArrowRight,
  Calendar,
} from "lucide-react";

// Status configuration with BigSter palette and step progression
const statusConfig: Record<string, any> = {
  CREATA: {
    label: "Creata",
    icon: FileText,
    step: 1,
    totalSteps: 8,
    bgColor: "rgba(254, 241, 154, 0.3)",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.2)",
    cardAccent: "rgba(254, 241, 154, 0.1)",
  },
  APPROVATA: {
    label: "Approvata",
    icon: CheckCircle2,
    step: 2,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.4)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.3)",
    cardAccent: "rgba(228, 215, 43, 0.1)",
  },
  IN_CORSO: {
    label: "In Corso",
    icon: Play,
    step: 3,
    totalSteps: 8,
    bgColor: "rgba(254, 241, 154, 0.5)",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.3)",
    cardAccent: "rgba(254, 241, 154, 0.15)",
  },
  ANNUNCI_PUBBLICATI: {
    label: "Annunci Pubblicati",
    icon: Megaphone,
    step: 4,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.5)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.4)",
    cardAccent: "rgba(228, 215, 43, 0.15)",
  },
  CANDIDATURE_RICEVUTE: {
    label: "Candidature Ricevute",
    icon: Users2,
    step: 5,
    totalSteps: 8,
    bgColor: "rgba(254, 241, 154, 0.6)",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.4)",
    cardAccent: "rgba(254, 241, 154, 0.2)",
  },
  COLLOQUI_IN_CORSO: {
    label: "Colloqui in Corso",
    icon: MessageSquare,
    step: 6,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.6)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.5)",
    cardAccent: "rgba(228, 215, 43, 0.2)",
  },
  COLLOQUI_CEO: {
    label: "Colloqui CEO",
    icon: Crown,
    step: 7,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.7)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.6)",
    cardAccent: "rgba(228, 215, 43, 0.25)",
  },
  CHIUSA: {
    label: "Completata",
    icon: Trophy,
    step: 8,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.8)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.7)",
    cardAccent: "rgba(228, 215, 43, 0.3)",
  },
  ANNULLATA: {
    label: "Annullata",
    icon: X,
    step: 0,
    totalSteps: 8,
    bgColor: "rgba(216, 216, 216, 0.5)",
    textColor: "#666666",
    borderColor: "#d8d8d8",
    cardAccent: "rgba(216, 216, 216, 0.1)",
  },
};

interface SelectionCardProps {
  selection: {
    id: number;
    titolo: string;
    stato: string;
    figura_professionale?: {
      nome: string;
    };
    reparto?: {
      nome: string;
    };
    data_creazione?: string;
    _count?: {
      annunci?: number;
      candidature?: number;
    };
  };
  index?: number;
}

export function SelectionCard({ selection, index = 0 }: SelectionCardProps) {
  const config = statusConfig[selection.stato] || statusConfig.CREATA;
  const StatusIcon = config.icon;

  const progressPercentage =
    config.step === 0 ? 0 : (config.step / config.totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <Card
        className="w-full transition-all duration-300 hover:shadow-xl border-0 overflow-hidden group"
        style={{
          background: `linear-gradient(135deg, ${config.cardAccent} 0%, rgba(255, 255, 255, 0.95) 100%)`,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-200 relative overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: config.textColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>

        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left section - Status icon and main info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Status icon */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: config.bgColor,
                  border: `2px solid ${config.borderColor}`,
                }}
              >
                <StatusIcon
                  className="h-7 w-7"
                  style={{ color: config.textColor }}
                />
              </div>

              {/* Title and details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {selection.titolo}
                  </h3>
                  <Badge
                    variant="outline"
                    className="font-semibold text-xs px-3 py-1 border-2 whitespace-nowrap"
                    style={{
                      backgroundColor: config.bgColor,
                      color: config.textColor,
                      borderColor: config.borderColor,
                    }}
                  >
                    Stato {config.step}/{config.totalSteps}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="truncate">
                      {selection.figura_professionale?.nome || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">
                      {selection.reparto?.nome || "N/A"}
                    </span>
                  </div>
                  {selection.data_creazione && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(selection.data_creazione).toLocaleDateString(
                          "it-IT"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center section - Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Megaphone className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    Annunci
                  </span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: config.textColor }}
                >
                  {selection._count?.annunci || 0}
                </p>
              </div>

              <div className="w-px h-12 bg-gray-200" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users2 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    Candidature
                  </span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: config.textColor }}
                >
                  {selection._count?.candidature || 0}
                </p>
              </div>
            </div>

            {/* Right section - Status and CTA */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge
                  variant="outline"
                  className="font-semibold text-sm px-4 py-2 border-2 shadow-sm mb-3 block"
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.textColor,
                    borderColor: config.borderColor,
                  }}
                >
                  <StatusIcon className="h-4 w-4 mr-2 inline" />
                  {config.label}
                </Badge>

                <Button
                  asChild
                  variant="outline"
                  className="font-semibold shadow-sm hover:shadow-md transition-all duration-300 border-2 group-hover:scale-105 bg-transparent"
                  style={{
                    borderColor: config.borderColor,
                    color: config.textColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = config.bgColor;
                    e.currentTarget.style.borderColor = config.textColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = config.borderColor;
                  }}
                >
                  <Link
                    href={`/selezioni/${selection.id}`}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Dettagli
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
