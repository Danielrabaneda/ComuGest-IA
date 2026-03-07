'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Key, Loader2, Home, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function Onboarding({ userId }: { userId: string }) {
    const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection')
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [code, setCode] = useState('')

    const router = useRouter()
    const supabase = createClient()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Generate a simple unique code
        const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase()

        try {
            const { data: community, error: communityError } = await supabase
                .from('communities')
                .insert({
                    name,
                    address,
                    code: uniqueCode,
                    plan: 'basic',
                    subscription_status: 'trial'
                })
                .select()
                .single()

            if (communityError) throw communityError

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ community_id: community.id, role: 'admin' })
                .eq('id', userId)

            if (profileError) throw profileError

            toast.success('¡Comunidad creada correctamente!')
            setMode('selection')
            router.refresh()
        } catch (err: unknown) {
            const error = err as { message: string }
            toast.error('Error al crear comunidad: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data: community, error: communityError } = await supabase
                .from('communities')
                .select('id, name')
                .eq('code', code.trim().toUpperCase())
                .single()

            if (communityError || !community) {
                toast.error('Código inválido o comunidad no encontrada.')
                return
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    community_id: community.id,
                    role: 'neighbor',
                    status: 'pending'
                })
                .eq('id', userId)

            if (profileError) throw profileError

            toast.success(`¡Solicitud enviada a ${community.name}!`)
            toast.info('Esperando aprobación del administrador...')
            router.refresh()
        } catch (err: unknown) {
            const error = err as { message: string }
            toast.error('Error al unirse: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (mode === 'selection') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto py-12">
                <div className="bg-primary/10 p-4 rounded-full text-primary mb-6">
                    <Home size={48} />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Bienvenido a ComuGest IA</h1>
                <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                    Parece que aún no formas parte de ninguna comunidad.
                    ¿Qué deseas hacer hoy?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <Card
                        className="hover:border-primary cursor-pointer transition-all hover:bg-slate-50 border-2 border-slate-200 group h-72 flex flex-col justify-center"
                        onClick={() => setMode('join')}
                    >
                        <CardHeader className="flex items-center">
                            <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
                                <Key size={36} />
                            </div>
                            <CardTitle className="text-2xl">Unirme con código</CardTitle>
                            <CardDescription className="text-base text-center max-w-[200px] mt-2">
                                Usa el código facilitado por tu administrador.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary cursor-pointer transition-all hover:bg-slate-50 border-2 border-slate-200 group h-72 flex flex-col justify-center"
                        onClick={() => setMode('create')}
                    >
                        <CardHeader className="flex items-center">
                            <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
                                <PlusCircle size={36} />
                            </div>
                            <CardTitle className="text-2xl">Crear Comunidad</CardTitle>
                            <CardDescription className="text-base text-center max-w-[200px] mt-2">
                                Registra tu comunidad y gestiona tú mismo los vecinos.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <Button variant="ghost" className="mb-6 -ml-4 h-10 px-4 flex items-center gap-2 hover:bg-slate-100 rounded-full" onClick={() => setMode('selection')}>
                &larr; Volver
            </Button>

            {mode === 'create' ? (
                <Card className="shadow-xl border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Nueva Comunidad</CardTitle>
                        <CardDescription className="text-base">
                            Configura los datos básicos de tu edificio o garaje.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleCreate}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nombre de la Comunidad</label>
                                <Input placeholder="Residencial Los Olivos" value={name} onChange={e => setName(e.target.value)} required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Dirección</label>
                                <Input placeholder="Calle Ejemplo 123, Madrid" value={address} onChange={e => setAddress(e.target.value)} required className="h-11" />
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-6 flex gap-3 text-amber-800 text-sm leading-relaxed">
                                <CheckCircle2 size={24} className="shrink-0 mt-0.5" />
                                <p>Al crearla, serás el <strong>Administrador Principal</strong>. Podrás invitar vecinos después.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full h-12 text-lg font-bold" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Crear Comunidad y Empezar
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            ) : (
                <Card className="shadow-xl border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Unirse a una Comunidad</CardTitle>
                        <CardDescription className="text-base">
                            Introduce el código de 8 caracteres que te han facilitado.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleJoin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Código de Acceso</label>
                                <Input
                                    placeholder="EX-AB1234"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    required
                                    className="h-14 text-center text-3xl font-black tracking-widest uppercase border-primary/30"
                                    maxLength={10}
                                />
                            </div>
                            <p className="text-sm text-center text-slate-500 font-medium pb-4 px-6">
                                Si no tienes un código, solicítalo al administrador de tu comunidad.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full h-12 text-lg font-bold" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Ingresar a la Comunidad
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
    )
}
