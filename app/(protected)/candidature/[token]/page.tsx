// app/candidatura/[token]/page.tsx

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Upload } from "lucide-react";
import Image from "next/image";

const applicationSchema = z.object({
  nome: z.string().min(2, "Il nome è obbligatorio"),
  cognome: z.string().min(2, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(5, "Numero di telefono non valido"),
  messaggio: z.string().optional(),
  // CV would be handled separately
});

export default function CandidaturaPage() {
  const params = useParams();
  const token = params.token as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      messaggio: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    setIsSubmitting(true);

    try {
      // In a real implementation, we would call an API to submit the application
      // including uploading the CV file

      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting application", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 via-yellow-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">
              Candidatura Inviata!
            </CardTitle>
            <CardDescription>
              Grazie per aver inviato la tua candidatura. Ti contatteremo
              presto.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 via-yellow-50 to-white p-4">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="BigSter Logo"
          width={150}
          height={150}
          className="mx-auto"
        />
        <h1 className="mt-2 text-3xl font-bold text-gray-800">Candidatura</h1>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Invia la tua candidatura</CardTitle>
          <CardDescription>
            Compila il modulo sottostante e allega il tuo CV per candidarti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cognome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo cognome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="La tua email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Il tuo numero di telefono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messaggio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Messaggio (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Aggiungi informazioni sulla tua candidatura"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Curriculum Vitae</FormLabel>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Clicca per caricare
                        </span>{" "}
                        o trascina qui il file
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC o DOCX (max 5MB)
                      </p>
                    </div>
                    <input
                      id="cv-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {cvFile && (
                  <p className="text-sm text-green-600">
                    File selezionato: {cvFile.name}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !cvFile}
              >
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                Invia Candidatura
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
