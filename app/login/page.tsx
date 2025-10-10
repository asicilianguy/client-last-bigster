"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginMutation } from "@/lib/redux/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { Check, Key, Users, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CustomDialog from "@/components/ui/bigster/CustomDialog";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type User = {
  email: string;
  password: string;
  name: string;
  role: string;
  roleBadgeColor: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [showUserSelector, setShowUserSelector] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data).unwrap();
      toast.success("Login effettuato con successo!");
      router.push("/accesso-fattureincloud");
    } catch (err: any) {
      toast.error(err.data?.message || "Credenziali non valide.");
    }
  };

  const availableUsers: User[] = [
    {
      email: "ceo@dentalead.it",
      password: "admin123",
      name: "Marco Bianchi",
      role: "CEO",
      roleBadgeColor: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    },
    {
      email: "responsabile.it@dentalead.it",
      password: "password123",
      name: "Roberto Neri",
      role: "Responsabile IT",
      roleBadgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      email: "responsabile.consulenza@dentalead.it",
      password: "password123",
      name: "Laura Ferrari",
      role: "Responsabile Consulenza",
      roleBadgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      email: "responsabile.marketing@dentalead.it",
      password: "password123",
      name: "Marco Rossi",
      role: "Responsabile Marketing",
      roleBadgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      email: "responsabile.risorseumane@dentalead.it",
      password: "password123",
      name: "Giulia Bianchi",
      role: "Responsabile Risorse Umane",
      roleBadgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      email: "mario.verdi@dentalead.it",
      password: "password123",
      name: "Mario Verdi",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "sara.marini@dentalead.it",
      password: "password123",
      name: "Sara Marini",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "luigi.ricci@dentalead.it",
      password: "password123",
      name: "Luigi Ricci",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "anna.conti@dentalead.it",
      password: "password123",
      name: "Anna Conti",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "paolo.esposito@dentalead.it",
      password: "password123",
      name: "Paolo Esposito",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "developer@dentalead.it",
      password: "dev123",
      name: "Developer Test",
      role: "Developer",
      roleBadgeColor: "bg-green-500/20 text-green-600 border-green-500/30",
    },
  ];

  const fillCredentials = (user: User) => {
    setValue("email", user.email);
    setValue("password", user.password);
    setShowUserSelector(false);
    toast.success(`Credenziali impostate per ${user.name}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 via-yellow-50 to-white p-4">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="BigSter Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esegui l'accesso</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per continuare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="inserisci la tua email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Dimenticata?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="inserisci la tua password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Esegui l'accesso
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="px-3"
              >
                <Users size={18} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CustomDialog
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        title="Seleziona un utente"
      >
        <div className="space-y-2 max-h-[60vh]">
          {availableUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => fillCredentials(user)}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-100 cursor-pointer border transition-colors last:mb-4"
            >
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                <Users size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Badge
                variant="outline"
                className={cn("font-medium", user.roleBadgeColor)}
              >
                {user.role}
              </Badge>
              <div className="flex-shrink-0 text-gray-400">
                <Key size={14} />
              </div>
            </div>
          ))}
        </div>
      </CustomDialog>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>BigSter © 2025. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
