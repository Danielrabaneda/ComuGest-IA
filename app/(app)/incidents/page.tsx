'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Search,
    Plus,
    ChevronRight,
    Clock,
    AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Incident, IncidentStatus } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [filter, setFilter] = useState<IncidentStatus | 'all'>('all')
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                let query = supabase
                    .from('incidents')
                    .select(`*, profiles(full_name)`)
                    .order('created_at', { ascending: false })

                if (filter !== 'all') {
                    query = query.eq('status', filter)
                }

                const { data, error } = await query

                if (error) {
                    console.error('Error fetching incidents:', error)
                } else {
                    setIncidents(data as (Incident & { profiles: { full_name: string } })[])
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchIncidents()
    }, [filter, supabase])

    const filteredIncidents = incidents.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase())
    )

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-red-50 text-red-600 border-red-200'
            case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200'
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-200'
            default: return 'bg-slate-50 text-slate-600 border-slate-200'
        }
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'open': return <Badge className="bg-amber-500 hover:bg-amber-600 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Abierta</Badge>
            case 'in_progress': return <Badge className="bg-blue-500 hover:bg-blue-600 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">En proceso</Badge>
            case 'closed': return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Cerrada</Badge>
            default: return null
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Incidencias</h1>
                    <p className="text-slate-500 text-lg font-medium">Gestiona y reporta averías de tu comunidad.</p>
                </div>
                <Link href="/incidents/new">
                    <Button className="rounded-2xl shadow-xl shadow-primary/20 bg-primary h-14 px-8 text-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                        <Plus size={24} /> Reportar problema
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <Input
                        placeholder="Buscar por título o descripción..."
                        className="pl-12 h-14 rounded-2xl border-none shadow-md shadow-slate-200/50 bg-white text-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-md shadow-slate-200/50">
                    <Button
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold h-10 px-4", filter === 'all' ? "shadow-md" : "text-slate-500")}
                        onClick={() => setFilter('all')}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={filter === 'open' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold h-10 px-4", filter === 'open' ? "shadow-md" : "text-slate-500")}
                        onClick={() => setFilter('open')}
                    >
                        Abiertas
                    </Button>
                    <Button
                        variant={filter === 'in_progress' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold h-10 px-4", filter === 'in_progress' ? "shadow-md" : "text-slate-500")}
                        onClick={() => setFilter('in_progress')}
                    >
                        En Curso
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
                    ))
                ) : filteredIncidents.length === 0 ? (
                    <Card className="border-dashed border-2 py-20 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                        <AlertTriangle size={48} className="mb-4 opacity-20" />
                        <p className="text-xl font-bold italic opacity-40">No se encontraron incidencias.</p>
                    </Card>
                ) : (
                    filteredIncidents.map((incident) => (
                        <Link 
                            key={incident.id} 
                            href={`/incidents/${incident.id}`}
                            className="block"
                            role="link"
                            aria-label={`Ver detalle de incidencia: ${incident.title}`}
                        >
                            <Card className="hover:shadow-2xl hover:shadow-primary/5 transition-all border-none bg-white shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden group cursor-pointer">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        {/* Status vertical bar */}
                                        <div className={cn(
                                            "w-full h-2 md:w-2 md:h-28",
                                            incident.status === 'open' ? "bg-amber-500" :
                                                incident.status === 'in_progress' ? "bg-blue-500" : "bg-emerald-500"
                                        )} />

                                        <div className="p-6 flex-1 min-w-0 pr-4">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                {getStatusBadge(incident.status)}
                                                <Badge variant="outline" className={cn("border px-2 text-[10px] font-bold uppercase tracking-wider", getPriorityColor(incident.priority))}>
                                                    {incident.priority === 'high' ? 'Alta' : incident.priority === 'medium' ? 'Media' : 'Baja'}
                                                </Badge>
                                                <span className="text-slate-300 font-black px-1">/</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Categoría: {incident.category}</span>
                                            </div>

                                            <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-primary transition-colors truncate tracking-tight uppercase">
                                                {incident.title}
                                            </h3>

                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">
                                                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                                    <Clock size={12} className="text-primary" />
                                                    {formatDistanceToNow(new Date(incident.created_at), { locale: es })}
                                                </div>
                                                <div className="flex items-center gap-1.5 italic">
                                                    Por: <span className="text-slate-600">{incident.profiles?.full_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-8 pb-6 md:pb-0">
                                            <div className="bg-slate-50 p-4 rounded-2xl text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                <ChevronRight size={28} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
