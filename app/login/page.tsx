"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLoginMutation } from "@/lib/redux/features/auth/authApiSlice"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Image from "next/image"
import { Check } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data).unwrap()
      toast.success("Login effettuato con successo!")
      router.push("/selezioni")
    } catch (err: any) {
      toast.error(err.data?.message || "Credenziali non valide.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 via-yellow-50 to-white p-4">
      <div className="mb-8 text-center">
        <Image src="/logo.png" alt="BigSter Logo" width={200} height={200} className="mx-auto" />
        <h1 className="mt-4 text-4xl font-bold text-gray-800">BigSter</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esegui l'accesso</CardTitle>
          <CardDescription>Inserisci le tue credenziali per continuare</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="inserisci la tua email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Dimenticata?
                </a>
              </div>
              <Input id="password" type="password" placeholder="inserisci la tua password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
              Esegui l'accesso
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>BigSter © 2025. All Rights Reserved.</p>
      </footer>
    </div>
  )
}
