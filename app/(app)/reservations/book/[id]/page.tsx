'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Space } from '@/types'
import { format, addMinutes, startOfToday, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function BookSpacePage() {
    const { id } = useParams()
    const router = useRouter()
    const [space, setSpace] = useState<Space | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isBooking, setIsBooking] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const fetchSpace = async () => {
            const { data } = await supabase.from('spaces').select('*').eq('id', id).single()
            if (data) setSpace(data)
            setIsLoading(false)
        }
        fetchSpace()
    }, [id, supabase])

    const generateTimeSlots = () => {
        if (!space) return []
        const slots = []
        const [openH, openM] = space.opening_time.split(':').map(Number)
        const [closeH, closeM] = space.closing_time.split(':').map(Number)

        let current = new Date()
        current.setHours(openH, openM, 0, 0)

        const end = new Date()
        end.setHours(closeH, closeM, 0, 0)

        while (current < end) {
            slots.push(format(current, 'HH:mm'))
            current = addMinutes(current, space.reservation_duration)
        }
        return slots
    }

    const handleBook = async () => {
        if (!selectedTime || !space) return

        setIsBooking(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autorizado')

            const startTime = new Date(selectedDate)
            const [h, m] = selectedTime.split(':').map(Number)
            startTime.setHours(h, m, 0, 0)

            const endTime = addMinutes(startTime, space.reservation_duration)

            const { error } = await supabase.from('reservations').insert({
                community_id: space.community_id,
                space_id: space.id,
                user_id: user.id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'confirmed'
            })

            if (error) throw error

            toast.success('¡Reserva confirmada con éxito!')
            router.push('/reservations')
        } catch (err: any) {
            toast.error('Error al reservar: ' + err.message)
        } finally {
            setIsBooking(false)
        }
    }

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>
    if (!space) return <div>Espacio no encontrado.</div>

    const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

    return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-white" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">Reservar {space.name}</h1>
                    <p className="text-slate-500 font-medium italic">Confirma tu horario y disfruta con tus vecinos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                <div className="md:col-span-3 space-y-10">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 text-white p-10">
                            <div className="bg-primary/20 p-2.5 rounded-xl w-fit mb-6">
                                <CalendarIcon size={32} className="text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase mb-2 leading-none">SELECCIONA DÍA Y HORA</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Usa el calendario rápido para ver disponibilidad.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="space-y-4">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">¿Para cuándo?</Label>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {dates.map((date) => (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "flex flex-col items-center justify-center min-w-[80px] h-24 rounded-3xl border-2 transition-all shrink-0",
                                                isSameDay(date, selectedDate)
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105"
                                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-primary/20"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest mb-1">{format(date, 'eee', { locale: es })}</span>
                                            <span className="text-2xl font-black">{format(date, 'd')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Horarios Disponibles</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {generateTimeSlots().map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedTime === slot ? 'default' : 'outline'}
                                            className={cn(
                                                "h-12 rounded-xl font-bold italic tracking-tight uppercase border-2",
                                                selectedTime === slot ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-105" : "border-slate-100 text-slate-500 hover:bg-slate-50"
                                            )}
                                            onClick={() => setSelectedTime(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card className="bg-white border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden sticky top-8">
                        <div className="h-40 relative">
                            <img src={space.image_url || 'https://via.placeholder.com/400x200'} className="w-full h-full object-cover" alt={space.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                            <h3 className="absolute bottom-6 left-8 text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{space.name}</h3>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-bold border-b border-slate-50 pb-4">
                                    <span className="text-slate-400 uppercase tracking-widest italic">Fecha</span>
                                    <span className="text-slate-900">{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold border-b border-slate-50 pb-4">
                                    <span className="text-slate-400 uppercase tracking-widest italic">Hora</span>
                                    <span className="text-slate-900">{selectedTime || '--:--'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold border-b border-slate-50 pb-4">
                                    <span className="text-slate-400 uppercase tracking-widest italic">Duración</span>
                                    <span className="text-slate-900">{space.reservation_duration} min</span>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-2xl flex items-start gap-4 italic font-medium text-slate-600 text-sm">
                                <Info size={20} className="text-primary shrink-0" />
                                Recuerda llegar puntual y dejar el espacio limpio para el siguiente vecino.
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                className="w-full h-16 rounded-3xl bg-slate-900 text-white text-xl font-black italic tracking-tighter uppercase shadow-2xl shadow-slate-900/40 hover:scale-[1.02] transition-transform disabled:opacity-50"
                                disabled={!selectedTime || isBooking}
                                onClick={handleBook}
                            >
                                {isBooking ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        CONFIRMAR RESERVA <CheckCircle2 size={24} strokeWidth={3} className="text-primary" />
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
