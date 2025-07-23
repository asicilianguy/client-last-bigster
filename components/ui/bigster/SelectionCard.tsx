import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Status Badge Colors
const statusColors: Record<string, string> = {
  CREATA: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
  APPROVATA: "bg-sky-400/20 text-sky-600 border-sky-400/30",
  IN_CORSO: "bg-blue-400/20 text-blue-600 border-blue-400/30",
  ANNUNCI_PUBBLICATI: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30",
  CANDIDATURE_RICEVUTE: "bg-violet-400/20 text-violet-600 border-violet-400/30",
  COLLOQUI_IN_CORSO: "bg-pink-400/20 text-pink-600 border-pink-400/30",
  COLLOQUI_CEO: "bg-fuchsia-400/20 text-fuchsia-600 border-fuchsia-400/30",
  CHIUSA: "bg-green-400/20 text-green-600 border-green-400/30",
  ANNULLATA: "bg-red-400/20 text-red-600 border-red-400/30",
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
    _count?: {
      annunci?: number;
      candidature?: number;
    };
  };
  action?: string;
  actionIcon?: React.ReactNode;
  index?: number;
}

export function SelectionCard({
  selection,
  action = "Dettagli",
  actionIcon,
  index = 0,
}: SelectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05 + 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card className="shadow-sm border h-full transition-all hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base">{selection.titolo}</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "font-medium whitespace-nowrap",
                statusColors[selection.stato] ||
                  "bg-gray-400/20 text-gray-600 border-gray-400/30"
              )}
            >
              {selection.stato.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Figura:</span>
              <span>{selection.figura_professionale?.nome || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reparto:</span>
              <span>{selection.reparto?.nome || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annunci:</span>
              <span>{selection._count?.annunci || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidature:</span>
              <span>{selection._count?.candidature || 0}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={`/selezioni/${selection.id}`}>
              {actionIcon}
              {action}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
