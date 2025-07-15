import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CandidaturePage() {
  return (
    <div className="animate-fade-in-up">
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Candidature</CardTitle>
          <CardDescription>Visualizza e gestisci tutte le candidature ricevute.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">La pagina di gestione candidature è in costruzione.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
