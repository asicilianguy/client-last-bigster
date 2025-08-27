"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAnnouncementMutation } from "@/lib/redux/features/announcements/announcementsApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

// FIX: Align schema with backend DTO (use 'piattaforma' instead of 'canale')
const announcementSchema = z.object({
  titolo: z.string().min(5, "Il titolo è obbligatorio (min 5 caratteri)"),
  descrizione: z
    .string()
    .min(10, "La descrizione è obbligatoria (min 10 caratteri)"),
  piattaforma: z.enum(["LINKEDIN", "INDEED", "ALTRO"], {
    required_error: "La piattaforma di pubblicazione è obbligatoria.",
  }),
});

export function CreateAnnouncementDialog({
  selectionId,
}: {
  selectionId: number;
}) {
  const [open, setOpen] = useState(false);
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      titolo: "",
      descrizione: "",
      piattaforma: "LINKEDIN",
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    try {
      await createAnnouncement({
        ...values,
        selezione_id: selectionId,
      }).unwrap();
      toast.success("Annuncio creato con successo!");
      setOpen(false);
      form.reset();
    } catch (err: any) {
      toast.error(err.data?.message || "Errore nella creazione dell'annuncio.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crea Annuncio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Annuncio</DialogTitle>
          <DialogDescription>
            Compila i dettagli per il nuovo annuncio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titolo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es. Sviluppatore Frontend Senior"
                      {...field}
                    />
                  </FormControl>
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
                    <Textarea
                      placeholder="Descrivi la posizione, i requisiti, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="piattaforma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Piattaforma di Pubblicazione</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una piattaforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="INDEED">Indeed</SelectItem>
                      <SelectItem value="ALTRO">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Crea Annuncio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
