"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useCreateSelectionMutation } from "@/lib/redux/features/selections/selectionsApiSlice"
import { useGetDepartmentsQuery } from "@/lib/redux/features/departments/departmentsApiSlice"
import { useGetProfessionalFiguresQuery } from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const createSelectionSchema = z.object({
  titolo: z.string().min(5, "Il titolo deve contenere almeno 5 caratteri"),
  reparto_id: z.coerce.number({ required_error: "Seleziona un reparto" }).positive(),
  figura_professionale_id: z.coerce.number({ required_error: "Seleziona una figura professionale" }).positive(),
  tipo: z.enum(["INTERNO", "ESTERNO"], { required_error: "Seleziona un tipo" }),
  note: z.string().optional(),
})

type CreateSelectionFormValues = z.infer<typeof createSelectionSchema>

export default function NuovaSelezionePage() {
  const router = useRouter()
  const [createSelection, { isLoading: isCreating }] = useCreateSelectionMutation()
  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({})

  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  const { data: figuresData, isLoading: isLoadingFigures } = useGetProfessionalFiguresQuery(selectedDepartment, {
    skip: !selectedDepartment,
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateSelectionFormValues>({
    resolver: zodResolver(createSelectionSchema),
  })

  const departmentId = watch("reparto_id")

  useState(() => {
    if (departmentId) {
      setSelectedDepartment(departmentId)
    }
  })

  const onSubmit = async (data: CreateSelectionFormValues) => {
    try {
      await createSelection(data).unwrap()
      toast.success("Selezione creata con successo! In attesa di approvazione.")
      router.push("/selezioni")
    } catch (err: any) {
      toast.error(err.data?.message || "Errore nella creazione della selezione.")
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/selezioni">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <CardTitle>Crea Nuova Selezione</CardTitle>
            <CardDescription>Compila i campi per avviare un nuovo processo di selezione.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo Selezione</Label>
            <Input id="titolo" placeholder="Es. Ricerca Sviluppatore Senior" {...register("titolo")} />
            {errors.titolo && <p className="text-sm text-red-500">{errors.titolo.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reparto_id">Reparto</Label>
              <Controller
                name="reparto_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedDepartment(Number(value))
                    }}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger disabled={isLoadingDepartments}>
                      <SelectValue placeholder="Seleziona un reparto" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDepartments ? (
                        <SelectItem value="loading" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : (
                        departmentsData?.data.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reparto_id && <p className="text-sm text-red-500">{errors.reparto_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="figura_professionale_id">Figura Professionale</Label>
              <Controller
                name="figura_professionale_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                    disabled={!selectedDepartment || isLoadingFigures}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una figura" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingFigures ? (
                        <SelectItem value="loading" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : (
                        figuresData?.data.map((fig: any) => (
                          <SelectItem key={fig.id} value={fig.id.toString()}>
                            {fig.nome} ({fig.seniority})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.figura_professionale_id && (
                <p className="text-sm text-red-500">{errors.figura_professionale_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo Selezione</Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESTERNO">Esterna</SelectItem>
                    <SelectItem value="INTERNO">Interna</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && <p className="text-sm text-red-500">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note Aggiuntive (Opzionale)</Label>
            <Textarea
              id="note"
              placeholder="Inserisci eventuali dettagli o requisiti aggiuntivi..."
              {...register("note")}
            />
            {errors.note && <p className="text-sm text-red-500">{errors.note.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Spinner className="mr-2 h-4 w-4" />}
              Crea Selezione
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
