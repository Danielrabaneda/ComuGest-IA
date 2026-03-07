'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('¡Registro exitoso! Por favor, verifica tu email o inicia sesión.')
                router.push('/login')
            }
        } catch (err) {
            toast.error('Ocurrió un error inesperado al registrarse.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary p-3 rounded-2xl text-white shadow-lg shadow-primary/20">
                            <Zap size={32} />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Crea tu cuenta</CardTitle>
                    <CardDescription className="text-lg">
                        Únete a ComuGest IA y mejora tu comunidad
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input
                                id="fullName"
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <Button className="w-full h-11 text-lg font-semibold mt-4" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Registrarse
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{' '}
                        <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push('/login')}>
                            Inicia sesión
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
