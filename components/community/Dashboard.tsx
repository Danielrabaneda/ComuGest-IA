'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    AlertCircle,
    Megaphone,
    Calendar,
    ArrowRight,
    Clock,
    Plus,
    Info,
    ChevronRight,
    TrendingUp,
    LayoutGrid,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Profile, Incident, Notice, Reservation } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function Dashboard({ profile }: { profile: Profile & { communities: any } }) {
    const [stats, setStats] = useState({
        incidentsOpen: 0,
        noticesActive: 0,
        reservationsNext: 0,
    })
    const [recentIncidents, setRecentIncidents] = useState<Incident[]>([])
    const [recentNotices, setRecentNotices] = useState<Notice[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!profile.community_id) return

            // Parallel queries for speed
            const [incidentsRes, noticesRes, reservationsRes] = await Promise.all([
                supabase
                    .from('incidents')
                    .select('*')
                    .eq('community_id', profile.community_id)
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('notices')
                    .select('*')
                    .eq('community_id', profile.community_id)
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase
                    .from('reservations')
                    .select('*', { count: 'exact', head: true })
                    .eq('community_id', profile.community_id)
                    .eq('status', 'confirmed')
                    .gte('start_time', new Date().toISOString())
            ])

            if (incidentsRes.data) setRecentIncidents(incidentsRes.data as any)
            if (noticesRes.data) setRecentNotices(noticesRes.data as any)

            setStats({
                incidentsOpen: incidentsRes.data?.filter((i: any) => i.status !== 'closed').length || 0,
                noticesActive: noticesRes.data?.length || 0,
                reservationsNext: reservationsRes.count || 0
            })

            setIsLoading(false)
        }

        fetchDashboardData()
    }, [profile.community_id, supabase])

    const communityName = profile.communities?.name || 'Mi Comunidad'

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-1">Resumen General</h2>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">¡Hola, {profile.full_name?.split(' ')[0]}!</h1>
                    <p className="text-slate-500 font-medium text-lg mt-1 leading-relaxed">Bienvenido al panel de {communityName}.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/incidents/new">
                        <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary h-12 px-6 font-bold flex items-center gap-2 transition-transform hover:scale-105">
                            <Plus size={20} />
                            Nueva Incidencia
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                    <CardHeader className="pb-2 relative">
                        <div className="bg-amber-100/50 p-2.5 w-fit rounded-xl text-amber-600 mb-4 ring-4 ring-amber-50">
                            <AlertCircle size={24} />
                        </div>
                        <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-wider">Incidencias Abiertas</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">{stats.incidentsOpen}</span>
                            <span className="text-slate-400 font-bold">activas</span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Link href="/incidents" className="text-xs font-bold text-amber-600 flex items-center gap-1.5 hover:underline">
                            VER TODAS <ChevronRight size={14} />
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                    <CardHeader className="pb-2 relative">
                        <div className="bg-blue-100/50 p-2.5 w-fit rounded-xl text-blue-600 mb-4 ring-4 ring-blue-50">
                            <Megaphone size={24} />
                        </div>
                        <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-wider">Comunicados</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">{stats.noticesActive}</span>
                            <span className="text-slate-400 font-bold">este mes</span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Link href="/notices" className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:underline">
                            VER AVISOS <ChevronRight size={14} />
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                    <CardHeader className="pb-2 relative">
                        <div className="bg-emerald-100/50 p-2.5 w-fit rounded-xl text-emerald-600 mb-4 ring-4 ring-emerald-50">
                            <Calendar size={24} />
                        </div>
                        <CardTitle className="text-slate-500 text-sm font-bold uppercase tracking-wider">Reservas</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">{stats.reservationsNext}</span>
                            <span className="text-slate-400 font-bold">pendientes</span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Link href="/reservations" className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:underline">
                            RESERVAR ESPACIO <ChevronRight size={14} />
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Incidents */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                            <TrendingUp className="text-primary not-italic" size={24} />
                            Incidencias Recientes
                        </h3>
                        <Link href="/incidents">
                            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 px-2">Ver todas &rarr;</Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentIncidents.length === 0 ? (
                            <Card className="border-dashed border-2 py-10 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                                <Info size={32} className="mb-2 opacity-50" />
                                <p className="font-medium">No hay incidencias reportadas recientemente.</p>
                            </Card>
                        ) : (
                            recentIncidents.map((incident) => (
                                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                                    <Card className="hover:bg-slate-50/50 hover:shadow-lg transition-all border-none bg-white shadow-md shadow-slate-100 mb-4 border-l-4 border-l-white group overflow-hidden">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className={cn(
                                                            "text-[10px] uppercase font-heavy tracking-widest border-none px-2",
                                                            incident.status === 'open' ? "bg-amber-500" : "bg-emerald-500"
                                                        )}>
                                                            {incident.status === 'open' ? 'Abierta' : 'Cerrada'}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400 font-bold">•</span>
                                                        <span className="text-xs text-slate-400 font-medium">#{incident.category}</span>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">{incident.title}</h4>
                                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2 font-medium">
                                                        <Clock size={12} />
                                                        hace {formatDistanceToNow(new Date(incident.created_at), { locale: es })}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Notices */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic underline decoration-blue-500/20 underline-offset-8">
                            <Megaphone className="text-blue-500 not-italic" size={24} />
                            Avisos
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {recentNotices.length === 0 ? (
                            <Card className="border-dashed border-2 py-10 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                                <p className="font-medium text-center">No hay comunicados activos.</p>
                            </Card>
                        ) : (
                            recentNotices.map((notice) => (
                                <Card key={notice.id} className="bg-gradient-to-br from-white to-blue-50/20 border-l-4 border-l-blue-500 shadow-md shadow-blue-100/50 border-r-0 border-t-0 border-b-0 overflow-hidden">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">{notice.title}</CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-500">
                                            Publicado hace {formatDistanceToNow(new Date(notice.created_at), { locale: es })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                                            {notice.short_body || notice.body}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Link href={`/notices/${notice.id}`}>
                                            <Button variant="link" className="p-0 h-auto text-xs font-bold text-blue-600 flex items-center gap-1">
                                                LEER COMPLETO <ArrowRight size={14} />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))
                        )}

                        {/* IA Secretary Promo Card */}
                        <Card className="bg-slate-900 text-white rounded-2xl overflow-hidden relative shadow-2xl shadow-slate-900/30">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(60,60,246,0.2),transparent_70%)]" />
                            <CardHeader className="relative">
                                <div className="bg-primary p-2 w-fit rounded-xl mb-4 shadow-lg shadow-primary/20">
                                    <Zap size={20} className="fill-white" />
                                </div>
                                <CardTitle className="text-xl font-extrabold tracking-tight">Secretario IA</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Pregúntame sobre normas, horarios o solicita gestiones.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="relative">
                                <Link href="/assistant" className="w-full">
                                    <Button className="w-full h-10 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100">
                                        Hablar ahora
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
