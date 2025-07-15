"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
} from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice"
import { useGetDepartmentsQuery } from "@/lib/redux/features/departments/departmentsApiSlice"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import toast from "react-hot-toast"
import { Textarea } from "@/components/ui/textarea"

// FIX: Align schema with backend DTO (seniority enum, add descrizione and prerequisiti)
const figureSchema = z.object({
  nome: z.string().min(3, "Il nome è obbligatorio (min 3 caratteri)"),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR"], {
    required_error: "Il livello di seniority è obbligatorio.",
  }),
  descrizione: z.string().min(10, "La descrizione è obbligatoria (min 10 caratteri)"),
  prerequisiti: z.string().optional(),
  reparto_id: z.string().min(1, "Il reparto è obbligatorio"),
})

export function FigureFormDialog({ figure, children }: { figure?: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [createFigure, { isLoading: isCreating }] = useCreateProfessionalFigureMutation()
  const [updateFigure, { isLoading: isUpdating }] = useUpdateProfessionalFigureMutation()
  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({})

  const isEditMode = !!figure
  const isLoading = isCreating || isUpdating

  const form = useForm<z.infer<typeof figureSchema>>({
    resolver: zodResolver(figureSchema),
    defaultValues: {
      nome: "",
      seniority: undefined,
      descrizione: "",
      prerequisiti: "",
      reparto_id: "",
    },
  })

  useEffect(() => {
    if (isEditMode && figure) {
      form.reset({
        nome: figure.nome || "",
        seniority: figure.seniority || undefined,
        descrizione: figure.descrizione || "",
        prerequisiti: figure.prerequisiti || "",
        reparto_id: figure.reparto_id ? String(figure.reparto_id) : "",
      })
    } else {
      form.reset({
        nome: "",
        seniority: undefined,
        descrizione: "",
        prerequisiti: "",
        reparto_id: "",
      })
    }
  }, [figure, isEditMode, form, open]) // Add open to reset on dialog open

  const onSubmit = async (values: z.infer<typeof figureSchema>) => {
    const payload = {
      ...values,
      reparto_id: Number.parseInt(values.reparto_id, 10),
    }

    try {
      if (isEditMode) {
        await updateFigure({ id: figure.id, ...payload }).unwrap()
        toast.success("Figura professionale aggiornata!")
      } else {
        await createFigure(payload).unwrap()
        toast.success("Figura professionale creata!")
      }
      setOpen(false)
    } catch (err: any) {
      const errorMsg = err.data?.errors?.[0]?.message || err.data?.message || "Si è verificato un errore."
      toast.error(errorMsg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifica Figura Professionale" : "Crea Nuova Figura Professionale"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifica i dettagli della figura." : "Compila i dettagli per la nuova figura."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Sviluppatore Frontend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seniority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seniority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona seniority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Junior</SelectItem>
                      <SelectItem value="MID">Mid</SelectItem>
                      <SelectItem value="SENIOR">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reparto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reparto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDepartments}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un reparto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentsData?.data.map((dept: any) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descrizione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrivi la figura professionale, le sue responsabilità, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prerequisiti"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prerequisiti (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Elenca i prerequisiti tecnici e non." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : isEditMode ? "Salva Modifiche" : "Crea Figura"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
