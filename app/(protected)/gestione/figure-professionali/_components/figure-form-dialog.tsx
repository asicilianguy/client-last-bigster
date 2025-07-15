"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
} from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice"
import { useGetDepartmentsQuery } from "@/lib/redux/features/departments/departmentsApiSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

const figureSchema = z.object({
  nome: z.string().min(3, "Il nome deve contenere almeno 3 caratteri."),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR"], {
    required_error: "Seleziona una seniority.",
  }),
  descrizione: z.string().min(10, "La descrizione deve contenere almeno 10 caratteri."),
  prerequisiti: z.string().optional(),
  reparto_id: z.coerce.number({ required_error: "Seleziona un reparto." }).positive(),
})

type FigureFormValues = z.infer<typeof figureSchema>

interface FigureFormDialogProps {
  figure?: any
  children: React.ReactNode
}

export function FigureFormDialog({ figure, children }: FigureFormDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditMode = !!figure

  const [createFigure, { isLoading: isCreating }] = useCreateProfessionalFigureMutation()
  const [updateFigure, { isLoading: isUpdating }] = useUpdateProfessionalFigureMutation()
  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({})

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FigureFormValues>({
    resolver: zodResolver(figureSchema),
    defaultValues:
      isEditMode && figure
        ? {
            nome: figure.nome,
            seniority: figure.seniority,
            reparto_id: figure.reparto_id,
            descrizione: figure.descrizione,
            prerequisiti: figure.prerequisiti || "",
          }
        : {
            nome: "",
            seniority: undefined,
            reparto_id: undefined,
            descrizione: "",
            prerequisiti: "",
          },
  })

  useEffect(() => {
    if (isEditMode && figure) {
      reset({
        nome: figure.nome,
        seniority: figure.seniority,
        reparto_id: figure.reparto_id,
        descrizione: figure.descrizione,
        prerequisiti: figure.prerequisiti || "",
      })
    } else if (!isEditMode) {
      reset({ nome: "", seniority: undefined, reparto_id: undefined, descrizione: "", prerequisiti: "" })
    }
  }, [figure, isEditMode, open, reset])

  const onSubmit = async (data: FigureFormValues) => {
    try {
      if (isEditMode) {
        await updateFigure({ id: figure.id, ...data }).unwrap()
        toast.success("Figura professionale aggiornata con successo.")
      } else {
        await createFigure(data).unwrap()
        toast.success("Figura professionale creata con successo.")
      }
      setOpen(false)
    } catch (err: any) {
      toast.error(err.data?.message || "Si è verificato un errore.")
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifica Figura Professionale" : "Crea Nuova Figura Professionale"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifica i dettagli di questa figura." : "Compila i campi per aggiungere una nuova figura."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Figura</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Controller
                name="seniority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Junior</SelectItem>
                      <SelectItem value="MID">Mid</SelectItem>
                      <SelectItem value="SENIOR">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.seniority && <p className="text-sm text-red-500">{errors.seniority.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reparto_id">Reparto</Label>
              <Controller
                name="reparto_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingDepartments}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsData?.data.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reparto_id && <p className="text-sm text-red-500">{errors.reparto_id.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea id="descrizione" {...register("descrizione")} rows={4} />
            {errors.descrizione && <p className="text-sm text-red-500">{errors.descrizione.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="prerequisiti">Prerequisiti (opzionale)</Label>
            <Textarea id="prerequisiti" {...register("prerequisiti")} rows={3} />
            {errors.prerequisiti && <p className="text-sm text-red-500">{errors.prerequisiti.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Annulla
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {isEditMode ? "Salva Modifiche" : "Crea Figura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
