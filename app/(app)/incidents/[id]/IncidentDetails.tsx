'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Zap,
    MessageSquare,
    CheckCircle2,
    AlertTriangle,
    Send,
    Loader2,
    Trash2,
    ShieldCheck,
    Hammer,
    Clock3,
    ExternalLink,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function IncidentDetails({ incident: initialIncident, userId, userRole }: {
    incident: any,
    userId: string,
    userRole: string
}) {
    const [incident, setIncident] = useState(initialIncident)
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleUpdateStatus = async (newStatus: string) => {
        setIsUpdatingStatus(true)
        const { data, error } = await supabase
            .from('incidents')
            .update({ status: newStatus })
            .eq('id', incident.id)
            .select()
            .single()

        if (error) {
            toast.error('Error al actualizar estado.')
        } else {
            setIncident({ ...incident, status: data.status })
            toast.success(`Estado actualizado a ${newStatus === 'in_progress' ? 'En Curso' : 'Cerrado'}`)
        }
        setIsUpdatingStatus(false)
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmittingComment(true)
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
        const { data, error } = await supabase
            .from('incident_comments')
            .insert({
                incident_id: incident.id,
                user_id: userId,
                body: newComment
            })
            .select('*, profiles:user_id(full_name, avatar_url)')
            .single()

        if (error) {
            toast.error('Error al publicar comentario.')
        } else {
            setIncident({
                ...incident,
                comments: [...(incident.comments || []), data]
            })
            setNewComment('')
        }
        setIsSubmittingComment(false)
    }

    const isAdmin = userRole === 'admin' || userRole === 'president'

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-white" onClick={() => router.back()}>
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight line-clamp-1">{incident.title}</h1>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            <MapPin size={14} className="text-primary" />
                            ID: {incident.id.slice(0, 8)} • #{incident.category}
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex gap-3">
                    {isAdmin && incident.status === 'open' && (
                        <Button className="h-10 rounded-xl bg-blue-600 font-bold flex items-center gap-2" disabled={isUpdatingStatus} onClick={() => handleUpdateStatus('in_progress')}>
                            <Loader2 size={16} className={isUpdatingStatus ? "animate-spin" : "hidden"} />
                            <Hammer size={18} /> ATENDER AHORA
                        </Button>
                    )}
                    {isAdmin && incident.status !== 'closed' && (
                        <Button className="h-10 rounded-xl bg-emerald-600 font-bold flex items-center gap-2" disabled={isUpdatingStatus} onClick={() => handleUpdateStatus('closed')}>
                            <CheckCircle2 size={18} /> CERRAR CASO
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <div className="flex items-center justify-between mb-4">
                                <Badge className={cn(
                                    "text-[10px] font-black uppercase tracking-widest border-none px-4 py-1.5 h-auto",
                                    incident.status === 'open' ? "bg-amber-500" : incident.status === 'in_progress' ? "bg-blue-500" : "bg-emerald-500"
                                )}>
                                    {incident.status === 'open' ? 'PENDIENTE' : incident.status === 'in_progress' ? 'EN TRABAJO' : 'RESUELTA'}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={14} /> {formatDistanceToNow(new Date(incident.created_at), { locale: es })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-lg text-slate-300 leading-relaxed font-medium italic">
                                    "{incident.description || 'Sin descripción detallada.'}"
                                </p>
                                <div className="flex items-center gap-3 mt-4 pt-6 border-t border-slate-800">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                        {incident.profiles?.full_name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{incident.profiles?.full_name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VECINO EMISOR</div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* AI Box */}
                            {incident.ai_summary && (
                                <div className="bg-primary/5 rounded-3xl p-6 border-l-4 border-l-primary relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-3 text-primary font-black tracking-widest uppercase text-xs">
                                            <Zap size={18} className="fill-primary" /> ANÁLISIS DEL SECRETARIO IA
                                        </div>
                                        <p className="text-slate-700 italic font-medium leading-relaxed">
                                            {incident.ai_summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {incident.attachments && incident.attachments.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-900 tracking-widest uppercase flex items-center gap-2">
                                        <ImageIcon size={18} className="text-primary" /> Archivos Adjuntos ({incident.attachments.length})
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {incident.attachments.map((file: any) => (
                                            <div key={file.id} className="group relative aspect-video rounded-2xl bg-slate-50 border-2 border-slate-100 p-1 hover:border-primary transition-all cursor-pointer overflow-hidden shadow-sm">
                                                {file.file_type === 'image' ? (
                                                    <img src={file.file_url} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" alt="attachment" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                                        <ExternalLink size={24} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Documento</span>
                                                    </div>
                                                )}
                                                <a href={file.file_url} target="_blank" className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline / Comments */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="text-primary" size={24} />
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Historial y Discusión</h3>
                        </div>

                        <div className="space-y-4">
                            {incident.comments && incident.comments.map((comment: any) => (
                                <div key={comment.id} className={cn(
                                    "flex gap-4 p-5 rounded-3xl",
                                    comment.user_id === userId ? "bg-primary/5 flex-row-reverse" : "bg-white shadow-xl shadow-slate-200/50"
                                )}>
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                        {comment.profiles?.full_name[0]}
                                    </div>
                                    <div className={cn("space-y-1 max-w-[80%]", comment.user_id === userId ? "text-right" : "")}>
                                        <div className="flex items-center gap-2 mb-1 justify-end md:justify-start">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{comment.profiles?.full_name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• {formatDistanceToNow(new Date(comment.created_at), { locale: es })}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic bg-slate-50/50 p-3 rounded-2xl">
                                            {comment.body}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <form onSubmit={handlePostComment} className="mt-8 bg-white p-6 rounded-3xl shadow-2xl shadow-slate-200/50 flex items-center gap-4 group focus-within:ring-2 ring-primary ring-offset-4 transition-all">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold hidden sm:flex">
                                    {userId.slice(0, 1).toUpperCase()}
                                </div>
                                <input
                                    className="flex-1 bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="Escribe un mensaje o actualización..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                />
                                <Button type="submit" className="rounded-2xl h-12 w-12 bg-primary shadow-lg shadow-primary/20 hover:scale-110 transition-transform" disabled={isSubmittingComment}>
                                    {isSubmittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="fill-white" />}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar info */}
                <div className="space-y-6">
                    {/* Admin Quick Control for Mobile */}
                    <div className="md:hidden space-y-3">
                        {isAdmin && incident.status === 'open' && (
                            <Button className="w-full h-14 rounded-2xl bg-blue-600 font-bold flex items-center gap-2" disabled={isUpdatingStatus} onClick={() => handleUpdateStatus('in_progress')}>
                                <Hammer size={20} /> ATENDER INCIDENCIA
                            </Button>
                        )}
                        {isAdmin && incident.status !== 'closed' && (
                            <Button className="w-full h-14 rounded-2xl bg-emerald-600 font-bold flex items-center gap-2" disabled={isUpdatingStatus} onClick={() => handleUpdateStatus('closed')}>
                                <CheckCircle2 size={20} /> RESOLVER Y CERRAR
                            </Button>
                        )}
                    </div>

                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white p-6">
                        <h4 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} /> Estado Técnico
                        </h4>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgencia</span>
                                <Badge variant="outline" className={cn(
                                    "font-black border-none px-3 uppercase text-[10px] tracking-widest",
                                    incident.priority === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {incident.priority === 'high' ? 'Crítica' : 'Estándar'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</span>
                                <span className="text-xs font-black text-slate-900 uppercase italic tracking-widest">{incident.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Respuesta Media</span>
                                <span className="text-xs font-black text-slate-900 uppercase italic tracking-widest">~ 24 Horas</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <Button variant="outline" className="w-full rounded-2xl border-slate-200 text-slate-500 font-bold h-12 flex items-center gap-2 text-xs uppercase tracking-widest">
                                Generar Reporte PDF <ChevronRight size={14} />
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-slate-900 p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                        <div className="relative">
                            <div className="bg-primary/20 p-2.5 rounded-xl w-fit mb-4">
                                <Calendar size={20} className="text-primary" />
                            </div>
                            <h4 className="text-lg font-black tracking-tight leading-tight mb-2 italic">¿Necesitas contactar con el Operario?</h4>
                            <p className="text-slate-400 text-sm font-medium mb-6">
                                Utiliza el chat de abajo para preguntar por el estado o solicita un contacto directo.
                            </p>
                            <Button className="w-full bg-white text-slate-900 h-10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100">
                                Asegurar Seguimiento
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-amber-50 rounded-3xl p-6 border-l-4 border-l-amber-500 flex gap-4">
                        <Clock3 size={24} className="text-amber-600 shrink-0" />
                        <div>
                            <h5 className="text-sm font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Protección de Datos</h5>
                            <p className="text-xs font-medium text-amber-900/60 leading-relaxed italic">
                                Toda la comunicación está encriptada y solo es accesible por vecinos y administración.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
