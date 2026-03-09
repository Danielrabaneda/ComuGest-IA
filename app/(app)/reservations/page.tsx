'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Calendar,
    MapPin,
    Clock,
    ChevronRight,
    Plus,
    Info,
    CalendarCheck,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Space, Reservation } from '@/types'
import Link from 'next/link'
import { format, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function ReservationsPage() {
    const [spaces, setSpaces] = useState<Space[]>([])
    const [myReservations, setMyReservations] = useState<Reservation[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: spacesData } = await supabase.from('spaces').select('*').order('name')
            const { data: myResData } = await supabase
                .from('reservations')
                .select('*, spaces(name)')
                .eq('user_id', user.id)
                .order('start_time', { ascending: false })

            if (spacesData) setSpaces(spacesData)
            if (myResData) setMyReservations(myResData as any)
            setIsLoading(false)
        }

        fetchData()
    }, [supabase])

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reservas</h1>
                    <p className="text-slate-500 text-lg font-medium">Reserva espacios comunes como pádel, piscina o sala multiusos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Available Spaces */}
                <div className="lg:col-span-3 space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic underline decoration-primary/20 underline-offset-8">
                        <CalendarCheck className="text-primary not-italic" size={24} /> ESPACIOS DISPONIBLES
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-slate-200 rounded-[32px] animate-pulse" />
                            ))
                        ) : spaces.length === 0 ? (
                            <Card className="col-span-full border-dashed border-2 py-20 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                                <AlertCircle size={48} className="mb-4 opacity-20" />
                                <p className="text-xl font-bold italic opacity-40">No hay espacios configurados en esta comunidad.</p>
                            </Card>
                        ) : (
                            spaces.map((space) => (
                                <Card key={space.id} className="group hover:shadow-2xl hover:shadow-primary/10 transition-all border-none bg-white shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden flex flex-col">
                                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                                        <img
                                            src={space.image_url || `https://source.unsplash.com/featured/?${space.name.split(' ')[0]}`}
                                            alt={space.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-slate-900 font-black h-fit px-4 py-1.5 border-none shadow-lg tracking-widest text-[10px]">
                                                {space.max_capacity} PERSONAS MÁX.
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase mb-1">{space.name}</CardTitle>
                                        <CardDescription className="text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                                            {space.description || 'Sin descripción adicional.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 flex-1">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                                <Clock size={16} className="text-primary not-italic" /> HORARIO: {space.opening_time.slice(0, 5)} - {space.closing_time.slice(0, 5)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                                <Info size={16} className="text-primary not-italic" /> DURACIÓN: {space.reservation_duration} MINUTOS
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
                                                res.status === 'confirmed' ? "bg-emerald-500" : "bg-amber-500"
                                            )}>
                                                {res.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400">{format(new Date(res.start_time), 'HH:mm', { locale: es })}</span>
                                        </div>
                                        <CardTitle className="text-lg font-black italic uppercase tracking-tighter truncate leading-none">
                                            {res.spaces?.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-2 pb-5">
                                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-center gap-3">
                                            <Calendar size={18} className="text-primary" />
                                            <span className="text-sm font-bold text-slate-700 capitalize">
                                                {format(new Date(res.start_time), "EEEE, d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                    </CardContent>
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
                            <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 rounded-xl h-10 font-bold text-xs uppercase tracking-widest">
                                REGLAMENTO INTERNO
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
