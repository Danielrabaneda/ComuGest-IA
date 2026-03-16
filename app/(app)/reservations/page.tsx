'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    Search,
    ChevronRight,

} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Space, Reservation } from '@/types'
import Link from 'next/link'
import { format, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PLAN_FEATURES } from '@/types'

export default function ReservationsPage() {
    const [spaces, setSpaces] = useState<Space[]>([])
    const [myReservations, setMyReservations] = useState<Reservation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isBlocked, setIsBlocked] = useState(false)
    const [isCheckingPlan, setIsCheckingPlan] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: spacesData, error: spacesError } = await supabase.from('spaces').select('*').order('name')
            const { data: myResData, error: myResError } = await supabase
                .from('reservations')
                .select('*, spaces(name)')
                .eq('user_id', user.id)
                .order('start_time', { ascending: false })

            if (spacesError) {
                console.error('Error fetching spaces:', spacesError)
            } else {
                setSpaces(spacesData as Space[])
            }

            if (myResError) {
                console.error('Error fetching reservations:', myResError)
            } else {
                setMyReservations(myResData as unknown as Reservation[])
            }

            // Check plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, communities(*)')
                .eq('id', user.id)
                .single()

            const plan = profile?.communities?.plan || 'basic'
            if (!PLAN_FEATURES[plan as 'basic' | 'pro'].reservations) {
                setIsBlocked(true)
            }
            setIsCheckingPlan(false)
            setIsLoading(false)
        }

        fetchData()
    }, [supabase])

    const filteredSpaces = spaces.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCancel = async (id: string) => {
        try {
            const { error } = await supabase
                .from('reservations')
                .update({ status: 'cancelled' })
                .eq('id', id)

            if (error) throw error

            toast.success('Reserva cancelada correctamente')
            setMyReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r))
        } catch (err: unknown) {
            console.error('Error cancelling reservation:', err)
            toast.error('No se pudo cancelar la reserva')
        }
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reservas</h1>
                    <p className="text-slate-500 text-lg font-medium">Reserva espacios comunes como pádel, piscina o sala multiusos.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar espacio..."
                        className="w-full h-14 pl-12 pr-4 bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl text-slate-900 font-bold italic focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Available Spaces */}
                <div className="lg:col-span-3 space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic underline decoration-primary/20 underline-offset-8">
                        <Search className="text-primary not-italic" size={24} /> ESPACIOS DISPONIBLES
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-slate-200 rounded-[32px] animate-pulse" />
                            ))
                        ) : filteredSpaces.length === 0 ? (
                            <Card className="col-span-full border-dashed border-2 py-20 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                                <Calendar size={48} className="mb-4 opacity-20" />
                                <p className="text-xl font-bold italic opacity-40">
                                    {searchTerm ? 'No se encontraron espacios con ese nombre.' : 'No hay espacios configurados en esta comunidad.'}
                                </p>
                            </Card>
                        ) : (
                            filteredSpaces.map((space) => (
                                <Card key={space.id} className="group hover:shadow-2xl hover:shadow-primary/10 transition-all border-none bg-white shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden flex flex-col">
                                    <div className="h-64 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                                        {space.image_url ? (
                                            <Image
                                                src={space.image_url}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={space.name}
                                            />
                                        ) : (
                                            <Calendar size={64} className="text-slate-200" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                                        <h3 className="absolute bottom-6 left-8 text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-xl">{space.name}</h3>
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-slate-900 font-black h-fit px-4 py-1.5 border-none shadow-lg tracking-widest text-[10px]">
                                                {space.max_capacity} PERSONAS MÁX.
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-8 pb-4">
                                        <CardDescription className="text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                                            {space.description || 'Sin descripción adicional.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 flex-1">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                                <Clock size={16} className="text-primary not-italic" /> HORARIO: {space.opening_time ? space.opening_time.slice(0, 5) : '09:00'} - {space.closing_time ? space.closing_time.slice(0, 5) : '22:00'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                                <Users size={16} className="text-primary not-italic" /> DURACIÓN: {space.reservation_duration || 60} MINUTOS
                                            </div>

                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 pt-0">
                                        <Link href={`/reservations/book/${space.id}`} className="w-full">
                                            <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black italic tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                                RESERVAR AHORA <ChevronRight size={18} strokeWidth={3} className="ml-2" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* My Reservations sidebar */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter italic">
                        MIS PRÓXIMAS CITAS
                        {myReservations.filter(r => r.status === 'confirmed' && isAfter(new Date(r.start_time), new Date())).length > 0 && (
                            <span className="bg-primary text-white text-[10px] font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                                {myReservations.filter(r => r.status === 'confirmed' && isAfter(new Date(r.start_time), new Date())).length}
                            </span>
                        )}
                    </h3>

                    <div className="space-y-4">
                        {myReservations.filter(r => isAfter(new Date(r.start_time), new Date())).length === 0 ? (
                            <Card className="bg-slate-50 border-none rounded-3xl p-8 py-10 flex flex-col items-center justify-center text-slate-400 text-center">
                                <Calendar size={32} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold opacity-50">No tienes reservas activas.</p>
                            </Card>
                        ) : (
                            myReservations.filter(r => isAfter(new Date(r.start_time), new Date())).map((res) => (
                                <Card key={res.id} className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group">
                                    <CardHeader className="p-5 pb-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className={cn(
                                                "text-[10px] uppercase font-black tracking-widest border-none px-3 h-auto",
                                                res.status === 'confirmed' ? "bg-emerald-500" : "bg-rose-500 text-white"
                                            )}>
                                                {res.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                                            </Badge>

                                            <span className="text-[10px] font-bold text-slate-400">{format(new Date(res.start_time), 'HH:mm', { locale: es })}</span>
                                        </div>
                                        <CardTitle className="text-lg font-black italic uppercase tracking-tighter truncate leading-none">
                                            {res.spaces?.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-2 pb-2">
                                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-center gap-3">
                                            <Calendar size={18} className="text-primary" />
                                            <span className="text-sm font-bold text-slate-700 capitalize">
                                                {format(new Date(res.start_time), "EEEE, d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-5 pt-0">
                                        {res.status === 'confirmed' && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest"
                                                onClick={() => handleCancel(res.id)}
                                            >
                                                CANCELAR RESERVA
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    <Card className="bg-slate-900 border-none rounded-3xl p-8 text-white relative overflow-hidden mt-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16" />
                        <div className="relative">
                            <div className="bg-primary/20 p-2.5 rounded-xl w-fit mb-6">
                                <CheckCircle2 size={24} className="text-primary" />
                            </div>
                            <h4 className="text-xl font-black italic uppercase italic tracking-tighter mb-2">Reserva Consciente</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
                                Respeta los horarios y a tus vecinos. Cancela con al menos 2h de antelación si no vas a asistir.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reservation History */}
            {myReservations.filter(r => !isAfter(new Date(r.start_time), new Date())).length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic underline decoration-primary/20 underline-offset-8">
                        <Calendar className="text-primary not-italic" size={24} /> HISTORIAL DE RESERVAS
                    </h3>
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                        <div className="divide-y divide-slate-50">
                            {myReservations
                                .filter(r => !isAfter(new Date(r.start_time), new Date()))
                                .slice(0, 10)
                                .map((res) => (
                                    <div key={res.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                                                res.status === 'confirmed' ? "bg-emerald-50" : "bg-slate-100"
                                            )}>
                                                <Calendar size={18} className={res.status === 'confirmed' ? "text-emerald-500" : "text-slate-400"} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm italic uppercase tracking-tighter">{res.spaces?.name}</p>
                                                <p className="text-xs text-slate-400 font-medium capitalize">
                                                    {format(new Date(res.start_time), "EEEE, d 'de' MMMM · HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[10px] uppercase font-black tracking-widest border-none shrink-0",
                                            res.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {res.status === 'confirmed' ? 'Completada' : 'Cancelada'}
                                        </Badge>
                                    </div>
                                ))
                            }
                        </div>
                    </Card>
                </div>
            )}
            {/* Blocked Overlay */}
            {isBlocked && (
                <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 rounded-[32px]">
                    <div className="w-20 h-20 bg-primary/20 rounded-[30px] flex items-center justify-center mb-8 ring-8 ring-primary/10">
                        <Calendar size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Gestión de Reservas Bloqueada</h2>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-sm">
                        La reserva de espacios comunes y la gestión de aforos están disponibles exclusivamente en el <span className="text-primary font-bold">Plan Pro Vecinal</span>.
                    </p>
                    <Link href="/admin" className="w-full max-w-xs">
                        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic uppercase text-sm tracking-widest shadow-2xl shadow-primary/20 transition-transform active:scale-95">
                            Mejorar mi Plan
                        </Button>
                    </Link>
                    <Link href="/home" className="mt-6 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors">
                        Volver al Inicio
                    </Link>
                </div>
            )}

            {isCheckingPlan && (
                <div className="absolute inset-0 z-[100] bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-[32px]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}
