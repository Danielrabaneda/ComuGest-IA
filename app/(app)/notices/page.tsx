'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Megaphone,
    Search,
    Plus,
    ChevronRight,
    Clock,
    User,
    Info,
    BadgeInfo,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Notice } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [userRole, setUserRole] = useState('')

    const supabase = createClient()

    useEffect(() => {
        const fetchNotices = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setUserRole(profile?.role || 'neighbor')

            const { data, error } = await supabase
                .from('notices')
                .select(`*, profiles:created_by(full_name)`)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching notices:', error)
            } else {
                setNotices(data as any[])
            }
            setIsLoading(false)
        }

        fetchNotices()
    }, [supabase])

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body.toLowerCase().includes(search.toLowerCase())
    )

    const isAdmin = userRole === 'admin' || userRole === 'president'

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Comunicados</h1>
                    <p className="text-slate-500 text-lg font-medium">Información relevante para toda la comunidad.</p>
                </div>
                {isAdmin && (
                    <Link href="/notices/new">
                        <Button className="rounded-2xl shadow-xl shadow-primary/20 bg-primary h-14 px-8 text-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                            <Plus size={24} /> Crear anuncio
                        </Button>
                    </Link>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <Input
                    placeholder="Buscar un aviso..."
                    className="pl-16 h-16 rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white text-xl font-medium focus-visible:ring-2 ring-primary transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
                    ))
                ) : filteredNotices.length === 0 ? (
                    <Card className="border-dashed border-2 py-20 bg-transparent shadow-none flex flex-col items-center justify-center text-slate-400">
                        <Megaphone size={64} className="mb-4 opacity-10" />
                        <p className="text-xl font-bold italic opacity-40">Sin comunicados aún.</p>
                    </Card>
                ) : (
                    filteredNotices.map((notice) => (
                        <Link key={notice.id} href={`/notices/${notice.id}`}>
                            <Card className="hover:shadow-2xl hover:shadow-primary/5 transition-all border-none bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    <div className="md:w-64 bg-slate-100 flex flex-col items-center justify-center p-8 text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Megaphone size={48} className="mb-4" />
                                        <div className="text-xs font-black uppercase tracking-widest text-center opacity-70">COMUNICADO OFICIAL</div>
                                    </div>
                                    <div className="flex-1 p-8 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">
                                                <Clock size={14} /> PUBLICADO HACE {formatDistanceToNow(new Date(notice.created_at), { locale: es }).toUpperCase()}
                                            </div>
                                            <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold py-1 px-3">#{notice.type || 'general'}</Badge>
                                        </div>

                                        <h2 className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight italic uppercase tracking-tighter">
                                            {notice.title}
                                        </h2>

                                        <p className="text-slate-500 text-lg leading-relaxed line-clamp-3 font-medium">
                                            {notice.short_body || notice.body}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {notice.profiles?.full_name?.[0] || 'U'}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{notice.profiles?.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase italic tracking-wider">
                                                LEER MÁS <ArrowRight size={18} />
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
