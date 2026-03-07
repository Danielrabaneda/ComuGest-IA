import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import {
    ArrowLeft,
    Clock,
    Megaphone,
    User,
    Info,
    Calendar,
    Share2,
    Printer,
    ChevronRight,
    TrendingUp,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: notice, error } = await supabase
        .from('notices')
        .select(`*, profiles:created_by(full_name, role)`)
        .eq('id', params.id)
        .single()

    if (error || !notice) {
        return notFound()
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Link href="/notices">
                    <Button variant="ghost" className="rounded-full h-12 w-12 p-0 hover:bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:scale-110">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold h-10 px-4 flex items-center gap-2">
                        <Printer size={18} /> Imprimir
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold h-10 px-4 flex items-center gap-2">
                        <Share2 size={18} /> Compartir
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-12 md:p-16 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
                    <div className="flex flex-wrap items-center gap-4 mb-4 relative">
                        <Badge className="bg-primary text-white font-black px-4 py-2 border-none h-auto text-xs tracking-widest leading-none drop-shadow-xl">
                            COMUNICADO OFICIAL
                        </Badge>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar size={14} className="text-primary" /> {formatDistanceToNow(new Date(notice.created_at), { locale: es }).toUpperCase()}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-[0.9] lg:leading-[0.85] animate-in slide-in-from-left duration-700">
                        {notice.title}
                    </h1>

                    <div className="flex items-center gap-4 pt-8 border-t border-slate-800 relative">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
                            {notice.profiles?.full_name[0]}
                        </div>
                        <div>
                            <div className="text-base font-black text-white uppercase tracking-tighter leading-none">{notice.profiles?.full_name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">FIRMA DE LA ADMINISTRACIÓN</div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-12 md:p-16 space-y-12 bg-[radial-gradient(circle_at_top_right,rgba(240,240,250,0.5),transparent_40%)]">
                    <div className="prose max-w-none">
                        <p className="text-2xl md:text-3xl font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary pl-8 py-2">
                            {notice.body}
                        </p>
                    </div>

                    {notice.short_body && (
                        <div className="bg-emerald-50 rounded-3xl p-8 border-l-8 border-emerald-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-30" />
                            <h4 className="text-sm font-black text-emerald-900 tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Megaphone size={18} /> Resumen Rápido (WhatsApp/RRSS)
                            </h4>
                            <p className="text-lg font-bold text-emerald-800/80 leading-relaxed italic">
                                {notice.short_body}
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-12 md:p-16 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
                    <div className="text-center space-y-2 mb-8">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fin del comunicado</p>
                        <p className="text-slate-400 text-sm italic font-medium">Gracias por mantenerte informado.</p>
                    </div>

                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-12" />

                    <Link href="/notices" className="group">
                        <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-transparent px-0 transition-all group-hover:gap-6">
                            VOLVER AL LISTADO <ArrowRight size={20} className="not-italic" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
