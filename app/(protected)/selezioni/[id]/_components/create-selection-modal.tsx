"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useCreateSelectionMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetDepartmentsQuery } from "@/lib/redux/features/departments/departmentsApiSlice";
import { useGetProfessionalFiguresByDepartmentQuery } from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { PlusCircle, X } from "lucide-react";
import { User } from "@/types";
import { useUserRole } from "@/hooks/use-user-role";

const createSelectionSchema = z.object({
  titolo: z.string().min(5, "Il titolo deve contenere almeno 5 caratteri"),
  reparto_id: z.coerce
    .number({ required_error: "Seleziona un reparto" })
    .positive(),
  figura_professionale_id: z.coerce
    .number({ required_error: "Seleziona una figura professionale" })
    .positive(),
  tipo: z.enum(["INTERNO", "ESTERNO"], { required_error: "Seleziona un tipo" }),
  note: z.string().optional(),
});

type CreateSelectionFormValues = z.infer<typeof createSelectionSchema>;

export function CreateSelectionModal({
  isOpen,
  onClose,
  onSuccess,
  userData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userData: User;
}) {
  const [createSelection, { isLoading: isCreating }] =
    useCreateSelectionMutation();
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery({});

  const { isCEO } = useUserRole();

  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    userData.reparto_id
  );

  const { data: figuresData, isLoading: isLoadingFigures } =
    useGetProfessionalFiguresByDepartmentQuery(userData.reparto_id);



  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateSelectionFormValues>({
    resolver: zodResolver(createSelectionSchema),
  });

  const departmentId = watch("reparto_id");

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedDepartment(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (departmentId) {
      setSelectedDepartment(departmentId);
    }
  }, [departmentId]);

  const onSubmit = async (data: CreateSelectionFormValues) => {
    try {
      await createSelection(data).unwrap();
      toast.success(
        "Selezione creata con successo! In attesa di approvazione."
      );
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err.data?.message || "Errore nella creazione della selezione."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Crea Nuova Selezione
          </DialogTitle>
          <DialogDescription>
            Compila i campi per avviare un nuovo processo di selezione.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo Selezione</Label>
            <Input
              id="titolo"
              placeholder="Es. Ricerca Sviluppatore Senior"
              {...register("titolo")}
              className="w-full"
            />
            {errors.titolo && (
              <p className="text-sm text-red-500">{errors.titolo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="reparto_id">Reparto</Label>
              <Controller
                name="reparto_id"
                control={control}
                defaultValue={userData.reparto_id!}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDepartment(Number(value));
                    }}
                    defaultValue={
                      field.value?.toString() || userData.reparto_id?.toString()
                    }
                  >
                    <SelectTrigger
                      disabled={isLoadingDepartments || !isCEO}
                      className="w-full"
                    >
                      <SelectValue placeholder="Seleziona un reparto" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDepartments ? (
                        <SelectItem value="loading" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : isCEO ? (
                        departmentsData?.data.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.nome}
                          </SelectItem>
                        ))
                      ) : (
                        departmentsData?.data
                          .filter(
                            (dept: any) => dept.id === userData.reparto_id
                          )
                          .map((dept: any) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.nome}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reparto_id && (
                <p className="text-sm text-red-500">
                  {errors.reparto_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="figura_professionale_id">
                Figura Professionale
              </Label>
              <Controller
                name="figura_professionale_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona una figura" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingFigures ? (
                        <SelectItem value="loading" disabled>
                          Caricamento...
                        </SelectItem>
                      ) : !figuresData?.data?.length ? (
                        <SelectItem value="none" disabled>
                          Nessuna figura disponibile
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
                <p className="text-sm text-red-500">
                  {errors.figura_professionale_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo Selezione</Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona il tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESTERNO">Esterna</SelectItem>
                    <SelectItem value="INTERNO">Interna</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && (
              <p className="text-sm text-red-500">{errors.tipo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note Aggiuntive (Opzionale)</Label>
            <Textarea
              id="note"
              placeholder="Inserisci eventuali dettagli o requisiti aggiuntivi..."
              {...register("note")}
              className="min-h-[100px]"
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isCreating && <Spinner className="mr-2 h-4 w-4" />}
              Crea Selezione
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
