"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { useCreateAnnouncementMutation } from "@/lib/redux/features/announcements/announcementsApiSlice"
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
import { PlusCircle } from "lucide-react"
import { useState } from "react"

const announcementSchema = z.object({
  titolo: z.string().min(5, "Il titolo deve contenere almeno 5 caratteri."),
  descrizione: z.string().min(20, "La descrizione deve contenere almeno 20 caratteri."),
  canale: z.enum(["LINKEDIN", "INDEED", "SITO_AZIENDALE"], { required_error: "Seleziona un canale." }),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

export function CreateAnnouncementDialog({ selectionId }: { selectionId: number }) {
  const [open, setOpen] = useState(false)
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
  })

  const onSubmit = async (data: AnnouncementFormValues) => {
    try {
      await createAnnouncement({ ...data, selezione_id: selectionId }).unwrap()
      toast.success("Annuncio creato con successo in bozza.")
      reset()
      setOpen(false)
    } catch (err: any) {
      toast.error(err.data?.message || "Errore nella creazione dell'annuncio.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Crea Annuncio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Annuncio</DialogTitle>
          <DialogDescription>Compila i dettagli per il nuovo annuncio. Verrà salvato in bozza.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo Annuncio</Label>
            <Input id="titolo" {...register("titolo")} />
            {errors.titolo && <p className="text-sm text-red-500">{errors.titolo.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="canale">Canale di Pubblicazione</Label>
            <Controller
              name="canale"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un canale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="INDEED">Indeed</SelectItem>
                    <SelectItem value="SITO_AZIENDALE">Sito Aziendale</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.canale && <p className="text-sm text-red-500">{errors.canale.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea id="descrizione" {...register("descrizione")} rows={8} />
            {errors.descrizione && <p className="text-sm text-red-500">{errors.descrizione.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Annulla
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Salva Bozza
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
