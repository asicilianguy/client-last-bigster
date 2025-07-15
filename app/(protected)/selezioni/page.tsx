"use client"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Users, FileText, ArrowRight, Briefcase, Building } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    CREATA: { label: "Creata", color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30" },
    APPROVATA: { label: "Approvata", color: "bg-sky-400/20 text-sky-600 border-sky-400/30" },
    IN_CORSO: { label: "In Corso", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
    ANNUNCI_PUBBLICATI: { label: "Annunci Pubblicati", color: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30" },
    CANDIDATURE_RICEVUTE: { label: "Candidature", color: "bg-purple-400/20 text-purple-600 border-purple-400/30" },
    COLLOQUI_IN_CORSO: { label: "Colloqui", color: "bg-pink-400/20 text-pink-600 border-pink-400/30" },
    COLLOQUI_CEO: { label: "Colloqui CEO", color: "bg-fuchsia-400/20 text-fuchsia-600 border-fuchsia-400/30" },
    CHIUSA: { label: "Chiusa", color: "bg-green-400/20 text-green-600 border-green-400/30" },
    ANNULLATA: { label: "Annullata", color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  )
}

export default function SelezioniDashboardPage() {
  const { data, error, isLoading } = useGetSelectionsQuery({})

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento delle selezioni.</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Selezioni</h1>
          <p className="text-muted-foreground">Visualizza e gestisci tutte le selezioni in corso.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Link href="/selezioni/nuova">
            <PlusCircle />
            Nuova Selezione
          </Link>
        </Button>
      </div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data?.data.length > 0 ? (
          data.data.map((selection: any) => (
            <motion.div key={selection.id} variants={itemVariants}>
              <Card className="flex h-full flex-col overflow-hidden border-0 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-tight">{selection.titolo}</CardTitle>
                    <StatusBadge status={selection.stato} />
                  </div>
                  <CardDescription className="flex items-center gap-2 pt-1 text-sm">
                    <Building className="h-4 w-4" />
                    {selection.reparto.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase />
                      <span>Posizione</span>
                    </div>
                    <span className="font-semibold text-foreground">{selection.figura_professionale.nome}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText />
                      <span>Annunci</span>
                    </div>
                    <span className="font-semibold text-foreground">{selection._count.annunci}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users />
                      <span>Candidature</span>
                    </div>
                    <span className="font-semibold text-foreground">{selection._count.candidature}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-between hover:bg-primary/10">
                    <Link href={`/selezioni/${selection.id}`}>
                      <span>Gestisci</span>
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card">
            <h3 className="text-xl font-semibold">Nessuna selezione trovata</h3>
            <p className="text-muted-foreground">Inizia creando una nuova selezione.</p>
            <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Link href="/selezioni/nuova">
                <PlusCircle />
                Crea la prima Selezione
              </Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
