'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLink, setIsMagicLink] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('¡Bienvenido!')
                router.push('/home')
                router.refresh()
            }
        } catch {
            toast.error('Ocurrió un error inesperado al iniciar sesión.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('¡Enlace de acceso enviado! Revisa tu email.')
            }
        } catch {
            toast.error('Ocurrió un error inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center">
                    <h1 className="sr-only">Login</h1>
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100">
                            <Image src="/logo.png" alt="ComuGest IA Logo" width={200} height={200} className="object-contain" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">ComuGest<span className="text-[#41B7C1]"> - IA</span></CardTitle>
                    <CardDescription className="text-lg">
                        Gestión inteligente para tu comunidad
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={isMagicLink ? handleMagicLink : handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 text-lg"
                            />
                        </div>
                        {!isMagicLink && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Button variant="link" className="px-0 font-normal text-muted-foreground" size="sm" type="button">
                                            ¿Olvidaste tu contraseña?
                                        </Button>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 text-lg"
                                    />
                                </div>
                            </>
                        )}
                        <Button className="w-full h-12 text-lg font-semibold" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isMagicLink ? 'Enviar enlace mágico' : 'Iniciar sesión'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">O continúa con</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => setIsMagicLink(!isMagicLink)}
                        disabled={isLoading}
                    >
                        {isMagicLink ? 'Usar contraseña' : 'Usar Email Magic Link'}
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿No tienes cuenta?{' '}
                        <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push('/register')}>
                            Regístrate aquí
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
