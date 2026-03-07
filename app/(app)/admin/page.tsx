'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Settings,
    Users,
    ShieldCheck,
    Plus,
    Trash2,
    CheckCircle2,
    Copy,
    Zap,
    Loader2,
    ChevronRight,
    Sparkles,
    Clock,
    X,
    Upload
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Community, Space, Doc, Profile } from '@/types'
import { cn } from '@/lib/utils'

export default function AdminPage() {
    const [community, setCommunity] = useState<Community | null>(null)
    const [spaces, setSpaces] = useState<Space[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'spaces' | 'communities' | 'ai' | 'neighbors'>('info')
    const [allCommunities, setAllCommunities] = useState<Community[]>([])

    // Info state
    const [editName, setEditName] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [isRegeneratingCode, setIsRegeneratingCode] = useState(false)

    // Spaces state
    const [isCreatingSpace, setIsCreatingSpace] = useState(false)
    const [newSpaceName, setNewSpaceName] = useState('')
    const [newSpaceCapacity, setNewSpaceCapacity] = useState('10')
    const [newSpaceOpening, setNewSpaceOpening] = useState('09:00')
    const [newSpaceClosing, setNewSpaceClosing] = useState('22:00')
    const [isSavingSpace, setIsSavingSpace] = useState(false)
    const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null)

    // AI Knowledge state
    const [aiDocs, setAiDocs] = useState<Doc[]>([])
    const [newDocTitle, setNewDocTitle] = useState('')
    const [newDocContent, setNewDocContent] = useState('')
    const [isSavingDoc, setIsSavingDoc] = useState(false)
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
    const [isExtractingText, setIsExtractingText] = useState(false)
    const [suggestedNotice, setSuggestedNotice] = useState<{ title: string; body: string; type: string } | null>(null)
    const [isPublishingNotice, setIsPublishingNotice] = useState(false)

    // Neighbors management state
    const [neighbors, setNeighbors] = useState<Profile[]>([])
    const [isProcessingNeighbor, setIsProcessingNeighbor] = useState<string | null>(null)

    const supabase = createClient()

    const fetchAdminData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('community_id, role').eq('id', user.id).single()
            if (!profile?.community_id) return

            const [commRes, spacesRes, allCommRes, docsRes, neighborsRes] = await Promise.all([
                supabase.from('communities').select('*').eq('id', profile.community_id).single(),
                supabase.from('spaces').select('*').eq('community_id', profile.community_id).order('created_at', { ascending: false }),
                supabase.from('communities').select('*').order('name', { ascending: true }),
                supabase.from('docs').select('*').eq('community_id', profile.community_id).eq('type', 'other').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*').eq('community_id', profile.community_id).order('status', { ascending: false })
            ])

            if (commRes.data) {
                setCommunity(commRes.data as Community)
                setEditName(commRes.data.name)
                setEditAddress(commRes.data.address || '')
            }
            if (spacesRes.data) setSpaces(spacesRes.data)
            if (allCommRes.data) setAllCommunities(allCommRes.data as Community[])
            if (docsRes.data) setAiDocs(docsRes.data as Doc[])
            if (neighborsRes.data) setNeighbors(neighborsRes.data)
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSwitchCommunity = async (communityId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('profiles').update({ community_id: communityId }).eq('id', user.id)
            if (error) throw error

            toast.success('Comunidad cambiada correctamente')
            window.location.reload()
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error('Error al cambiar de comunidad: ' + (err.message || 'Error desconocido'))
        }
    }

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || file.type !== 'application/pdf') return
        setIsExtractingText(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const req = await fetch('/api/ai/upload-pdf', { method: 'POST', body: formData })
            const res = await req.json()
            if (!req.ok) throw new Error(res.error || 'Error al procesar el PDF')
            setNewDocContent(prev => prev ? prev + '\n\n' + res.text : res.text)
            if (!newDocTitle) setNewDocTitle(file.name.replace('.pdf', ''))
            toast.success('Texto extraído del PDF con éxito')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al procesar el PDF')
        } finally {
            setIsExtractingText(false)
            e.target.value = ''
        }
    }

    const handleCreateAiDoc = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!community || !newDocTitle.trim() || !newDocContent.trim()) return
        setIsSavingDoc(true)
        try {
            const { data, error } = await supabase
                .from('docs')
                .insert({
                    community_id: community.id,
                    title: newDocTitle,
                    body: newDocContent,
                    type: 'other'
                })
                .select()
                .single()
            if (error) throw error
            setAiDocs([data, ...aiDocs])
            toast.success('Documento guardado. Analizando si hay avisos relevantes...')

            // Analizar el documento para detectar avisos
            const analysisRes = await fetch('/api/ai/analyze-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docTitle: newDocTitle,
                    docContent: newDocContent,
                    communityName: community.name
                })
            })
            const analysis = await analysisRes.json()

            if (analysis.should_notify && analysis.notice) {
                setSuggestedNotice(analysis.notice)
                toast.success('¡La IA ha redactado un aviso para los vecinos!')
            }

            setNewDocTitle('')
            setNewDocContent('')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar el documento')
        } finally {
            setIsSavingDoc(false)
        }
    }

    const handlePublishNotice = async () => {
        if (!suggestedNotice || !community) return
        setIsPublishingNotice(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase.from('notices').insert({
                community_id: community.id,
                created_by: user!.id,
                title: suggestedNotice.title,
                body: suggestedNotice.body,
                short_body: suggestedNotice.body.slice(0, 120),
                type: suggestedNotice.type as 'general' | 'meeting' | 'maintenance' | 'cleaning' | 'works',
            })
            if (error) throw error
            toast.success('¡Aviso publicado para todos los vecinos!')
            setSuggestedNotice(null)
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al publicar el aviso')
        } finally {
            setIsPublishingNotice(false)
        }
    }

    const handleDeleteAiDoc = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento de contexto?')) return
        setDeletingDocId(id)
        try {
            const { error } = await supabase.from('docs').delete().eq('id', id)
            if (error) throw error
            setAiDocs(aiDocs.filter(d => d.id !== id))
            toast.success('Documento eliminado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al eliminar el documento')
        } finally {
            setDeletingDocId(null)
        }
    }

    const handleApproveNeighbor = async (neighborId: string) => {
        setIsProcessingNeighbor(neighborId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: 'active' })
                .eq('id', neighborId)
            if (error) throw error
            setNeighbors(neighbors.map(n => n.id === neighborId ? { ...n, status: 'active' } : n))
            toast.success('Vecino aprobado correctamente')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al aprobar vecino')
        } finally {
            setIsProcessingNeighbor(null)
        }
    }

    const handleRejectNeighbor = async (neighborId: string) => {
        setIsProcessingNeighbor(neighborId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ community_id: null, status: 'active' }) // Se le quita la comunidad
                .eq('id', neighborId)
            if (error) throw error
            setNeighbors(neighbors.filter(n => n.id !== neighborId))
            toast.success('Solicitud rechazada')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al rechazar solicitud')
        } finally {
            setIsProcessingNeighbor(null)
        }
    }

    const copyInviteCode = () => {
        if (community?.code) {
            navigator.clipboard.writeText(community.code)
            toast.success('¡Código copiado al portapapeles!')
        }
    }

    const handleSaveInfo = async () => {
        if (!community) return
        if (!editName.trim()) {
            toast.error('El nombre no puede estar vacío')
            return
        }
        setIsSavingInfo(true)
        try {
            const { error } = await supabase
                .from('communities')
                .update({ name: editName, address: editAddress })
                .eq('id', community.id)

            if (error) throw error
            setCommunity({ ...community, name: editName, address: editAddress })
            toast.success('Información de la comunidad actualizada')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al guardar la información')
        } finally {
            setIsSavingInfo(false)
        }
    }

    const handleRegenerateCode = async () => {
        if (!community) return
        if (!confirm('¿Estás seguro de regenerar el código? Los vecinos que no hayan entrado necesitarán el nuevo código para registrarse.')) return
        setIsRegeneratingCode(true)
        try {
            const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
            const { data, error } = await supabase
                .from('communities')
                .update({ code: newCode })
                .eq('id', community.id)
                .select('code')
                .single()
            if (error) throw error
            setCommunity({ ...community, code: data.code })
            toast.success('Código de invitación regenerado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al regenerar el código')
        } finally {
            setIsRegeneratingCode(false)
        }
    }

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!community) return
        setIsSavingSpace(true)
        try {
            const { data, error } = await supabase
                .from('spaces')
                .insert({
                    community_id: community.id,
                    name: newSpaceName,
                    max_capacity: parseInt(newSpaceCapacity) || 10,
                    opening_time: newSpaceOpening + ':00',
                    closing_time: newSpaceClosing + ':00',
                    reservation_duration: 60,
                })
                .select()
                .single()
            if (error) throw error
            setSpaces([data, ...spaces])
            toast.success('Espacio creado con éxito')
            setIsCreatingSpace(false)
            setNewSpaceName('')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al crear el espacio')
        } finally {
            setIsSavingSpace(false)
        }
    }

    const handleDeleteSpace = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el espacio "${name}"? Todas las reservas asociadas se perderán.`)) return
        setDeletingSpaceId(id)
        try {
            const { error } = await supabase.from('spaces').delete().eq('id', id)
            if (error) throw error
            setSpaces(spaces.filter(s => s.id !== id))
            toast.success('Espacio eliminado')
        } catch (error: unknown) {
            const err = error as { message: string }
            toast.error(err.message || 'Error al eliminar el espacio')
        } finally {
            setDeletingSpaceId(null)
        }
    }

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">Configuración del Panel</h1>
                    <p className="text-slate-500 text-lg font-medium">Gestión administrativa de la comunidad {community?.name}.</p>
                </div>
                <div className="flex gap-3 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
                    <Button
                        variant={activeTab === 'info' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'info' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('info')}
                    >
                        Información
                    </Button>
                    <Button
                        variant={activeTab === 'spaces' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'spaces' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('spaces')}
                    >
                        Espacios
                    </Button>
                    <Button
                        variant={activeTab === 'communities' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6", activeTab === 'communities' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('communities')}
                    >
                        Comunidades
                    </Button>
                    <Button
                        variant={activeTab === 'ai' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6 text-primary", activeTab === 'ai' ? "shadow-md bg-primary text-white" : "")}
                        onClick={() => setActiveTab('ai')}
                    >
                        Secretario IA
                    </Button>
                    <Button
                        variant={activeTab === 'neighbors' ? 'default' : 'ghost'}
                        className={cn("rounded-xl font-bold italic tracking-tight uppercase px-6 relative", activeTab === 'neighbors' ? "shadow-md bg-slate-900 text-white" : "text-slate-500")}
                        onClick={() => setActiveTab('neighbors')}
                    >
                        Vecinos
                        {neighbors.some(n => n.status === 'pending') && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                {neighbors.filter(n => n.status === 'pending').length}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {activeTab === 'communities' && (
                    <div className="col-span-1 lg:col-span-3 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary/20 underline-offset-8 decoration-4">
                                SELECCIONA UNA COMUNIDAD
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCommunities.map(comm => (
                                <Card
                                    key={comm.id}
                                    className={cn(
                                        "border-2 transition-all cursor-pointer rounded-3xl hover:shadow-xl hover:border-primary/50",
                                        comm.id === community?.id ? "border-primary shadow-lg bg-primary/5" : "border-slate-100"
                                    )}
                                    onClick={() => handleSwitchCommunity(comm.id)}
                                >
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-xl font-black italic tracking-tighter uppercase mb-1">{comm.name}</CardTitle>
                                        <Badge className="w-fit">{comm.plan === 'pro' ? 'PRO' : 'BÁSICO'}</Badge>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <p className="text-xs font-bold text-slate-400">Dirección: {comm.address || 'No definida'}</p>
                                    </CardContent>
                                    {comm.id === community?.id && (
                                        <div className="absolute top-6 right-6 text-primary">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="lg:col-span-3 space-y-10">
                        <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Zap size={32} className="text-primary fill-primary/50" />
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
                                    Base de Conocimiento IA
                                </h3>
                            </div>
                            <p className="text-slate-600 font-medium mb-8">
                                Sube documentos, normas o información general que quieres que el <b>Secretario IA</b> lea y tenga en cuenta para contestar a los vecinos de tu comunidad de forma inteligente.
                            </p>

                            <Card className="border-none shadow-xl bg-white rounded-3xl p-8 mb-8">
                                <form onSubmit={handleCreateAiDoc} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título del Documento o Fragmento</Label>
                                        <Input required placeholder="Ej: Normativa de la piscina 2024, Problemas con el ascensor..." className="h-12 rounded-xl bg-slate-50" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contenido</Label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handlePdfUpload}
                                                    disabled={isExtractingText}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                                />
                                                <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 text-primary border-primary/20 bg-primary/5 pointer-events-none relative z-0" disabled={isExtractingText}>
                                                    {isExtractingText ? <Loader2 className="animate-spin mr-2" size={14} /> : <Upload className="mr-2" size={14} />}
                                                    {isExtractingText ? 'Analizando PDF...' : 'Subir y extraer PDF'}
                                                </Button>
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            placeholder="Pega aquí el contenido o usa el botón de arriba para extraer el texto de un archivo PDF..."
                                            className="w-full min-h-[250px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-primary/50 resize-y font-mono text-sm leading-relaxed"
                                            value={newDocContent}
                                            onChange={(e) => setNewDocContent(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isSavingDoc} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest italic bg-primary text-white shadow-lg w-full">
                                        {isSavingDoc ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Enseñar a la IA
                                    </Button>
                                </form>
                            </Card>

                            {suggestedNotice && (
                                <div className="mb-8 animate-in fade-in zoom-in duration-500">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-amber-500 fill-amber-500/20" size={20} />
                                        <h4 className="text-lg font-black text-slate-900 italic tracking-tighter uppercase">Aviso Sugerido por la IA</h4>
                                    </div>
                                    <Card className="border-2 border-amber-200 shadow-xl bg-amber-50/30 rounded-3xl overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="bg-amber-100/50 border-amber-200 text-amber-700 font-bold uppercase tracking-widest text-[10px]">
                                                        {suggestedNotice.type}
                                                    </Badge>
                                                    <h5 className="text-xl font-black text-slate-900 italic uppercase leading-tight">
                                                        {suggestedNotice.title}
                                                    </h5>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600"
                                                    onClick={() => setSuggestedNotice(null)}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>
                                            <p className="text-slate-700 font-medium leading-relaxed leading-snug">
                                                {suggestedNotice.body}
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <Button
                                                    onClick={handlePublishNotice}
                                                    disabled={isPublishingNotice}
                                                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase italic text-xs tracking-widest shadow-lg shadow-amber-500/20"
                                                >
                                                    {isPublishingNotice ? <Loader2 className="animate-spin mr-2" size={14} /> : <Zap size={14} className="mr-2 fill-white" />}
                                                    Publicar Aviso Ahora
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setSuggestedNotice(null)}
                                                    className="h-10 px-6 rounded-xl text-slate-400 hover:text-slate-600 font-black uppercase italic text-xs tracking-widest"
                                                >
                                                    Descartar Sugerencia
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase mb-6">Documentos Guardados</h4>
                            <div className="space-y-4">
                                {aiDocs.length === 0 && (
                                    <p className="text-slate-400 text-center py-6 font-medium italic">Aún no le has dado información al Secretario IA.</p>
                                )}
                                {aiDocs.map((doc) => (
                                    <div key={doc.id} className="bg-white rounded-2xl p-6 flex items-start justify-between shadow-sm border border-slate-100">
                                        <div>
                                            <h5 className="font-bold text-lg mb-1">{doc.title}</h5>
                                            <p className="text-slate-500 text-sm line-clamp-2">{doc.body}</p>
                                        </div>
                                        <Button disabled={deletingDocId === doc.id} variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl px-3" onClick={() => handleDeleteAiDoc(doc.id)}>
                                            {deletingDocId === doc.id ? <Loader2 className="animate-spin" size={18} /> : 'Eliminar'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'info' && (
                    <>
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                                <CardHeader className="bg-slate-900 text-white p-10">
                                    <div className="bg-primary/20 p-3 rounded-2xl w-fit mb-6">
                                        <Settings size={32} className="text-primary" />
                                    </div>
                                    <CardTitle className="text-3xl font-black italic tracking-tighter uppercase mb-2">Comunidad Oficial</CardTitle>
                                    <p className="text-slate-400 font-medium">Datos informativos básicos para el panel vecinal.</p>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del proyecto</Label>
                                            <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identificador Fiscal / NIF</Label>
                                            <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" defaultValue="G-12345678" disabled />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección Física Completa</Label>
                                        <Input className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-lg bg-slate-50" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 bg-slate-50 flex justify-end">
                                    <Button onClick={handleSaveInfo} disabled={isSavingInfo} className="h-12 rounded-xl bg-primary font-black uppercase italic px-10 shadow-lg shadow-primary/20">
                                        {isSavingInfo ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Guardar Cambios
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <Card className="bg-primary/5 border-none rounded-[40px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="bg-primary/10 p-2.5 rounded-xl w-fit mb-6 shadow-sm">
                                        <Users size={24} className="text-primary fill-primary/20" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase mb-1">CÓDIGO DE ACCESO</h4>
                                    <p className="text-slate-500 font-medium leading-relaxed italic mb-8">
                                        Comparte este código exclusivo con los vecinos para que puedan unirse al panel oficial.
                                    </p>

                                    <div className="bg-white p-6 rounded-[24px] border-2 border-dashed border-primary/20 flex items-center justify-between mb-8 shadow-inner">
                                        <span className="text-3xl font-black text-primary tracking-[0.3em] font-mono leading-none">{community?.code}</span>
                                        <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-primary hover:bg-primary/5" onClick={copyInviteCode}>
                                            <Copy size={24} />
                                        </Button>
                                    </div>

                                    <Button variant="link" onClick={handleRegenerateCode} disabled={isRegeneratingCode} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary uppercase tracking-widest p-0 h-auto">
                                        {isRegeneratingCode ? <Loader2 className="animate-spin text-primary" size={14} /> : <Sparkles size={14} className="text-primary animate-pulse" />} Regenerar código de seguridad
                                    </Button>
                                </div>
                            </Card>

                            <Card className="bg-slate-900 border-none rounded-[40px] p-8 text-white">
                                <div className="bg-white/10 p-3 rounded-2xl w-fit mb-6">
                                    <Zap size={24} className="text-primary fill-primary" />
                                </div>
                                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-1 leading-none">Tu Plan SaaS</h4>
                                <Badge className="bg-primary/20 text-primary border-none font-black italic px-4 py-1.5 h-auto text-[10px] tracking-widest mt-2 mb-6 uppercase">
                                    {community?.plan === 'pro' ? 'PRO VECINAL ACTIVO' : 'PLAN BÁSICO'}
                                </Badge>
                                <p className="text-slate-400 font-medium text-sm italic mb-10 leading-relaxed">
                                    {community?.plan === 'pro' ? 'Disfrutas de IA ilimitada, gestión de 10 espacios comunes y almacenamiento de 50GB.' : 'Explora las ventajas de mejorar al nivel PRO para acceder a todas las funciones.'}
                                </p>
                                <Button className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black italic uppercase text-xs tracking-widest shadow-2xl">
                                    Gestionar Suscripción
                                </Button>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'spaces' && (
                    <div className="lg:col-span-3 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary/20 underline-offset-8 decoration-4">
                                GESTIÓN DE ESPACIOS COMUNES
                            </h3>
                            <Button onClick={() => setIsCreatingSpace(!isCreatingSpace)} className="rounded-2xl bg-primary h-12 px-8 font-black flex items-center gap-2 shadow-lg shadow-primary/20 italic tracking-tight">
                                {isCreatingSpace ? <X size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                                {isCreatingSpace ? 'CANCELAR' : 'AÑADIR NUEVO ESPACIO'}
                            </Button>
                        </div>

                        {isCreatingSpace && (
                            <Card className="border-none shadow-xl bg-white rounded-3xl p-8 mb-6 animate-in slide-in-from-top-4 duration-500">
                                <form onSubmit={handleCreateSpace} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del espacio</Label>
                                            <Input required placeholder="Piscina, Pista de Pádel..." className="h-12 rounded-xl bg-slate-50" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Capacidad Max.</Label>
                                            <Input required type="number" min="1" className="h-12 rounded-xl bg-slate-50" value={newSpaceCapacity} onChange={(e) => setNewSpaceCapacity(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Apertura</Label>
                                            <Input required type="time" className="h-12 rounded-xl bg-slate-50" value={newSpaceOpening} onChange={(e) => setNewSpaceOpening(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cierre</Label>
                                            <Input required type="time" className="h-12 rounded-xl bg-slate-50" value={newSpaceClosing} onChange={(e) => setNewSpaceClosing(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-slate-100">
                                        <Button type="submit" disabled={isSavingSpace} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest italic bg-slate-900 text-white shadow-lg">
                                            {isSavingSpace ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                            Crear Espacio
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {spaces.length === 0 && !isCreatingSpace && (
                                <div className="col-span-full py-20 text-center text-slate-400 font-medium">
                                    <p>No hay espacios creados en tu comunidad.</p>
                                </div>
                            )}
                            {spaces.map((space) => (
                                <Card key={space.id} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                                    <div className="h-40 relative overflow-hidden">
                                        <Image
                                            src={space.image_url || 'https://images.unsplash.com/photo-1575429198097-0414ec08e8b6?q=80&w=2070&auto=format&fit=crop'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={space.name}
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Button disabled={deletingSpaceId === space.id} onClick={() => handleDeleteSpace(space.id, space.name)} className="bg-red-500/90 text-white h-10 w-10 p-0 rounded-xl hover:bg-red-600 shadow-xl">
                                                {deletingSpaceId === space.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                            </Button>
                                        </div>
                                    </div>
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-xl font-black italic tracking-tighter uppercase truncate leading-none mb-2">{space.name}</CardTitle>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                            <Clock size={14} className="text-primary not-italic" /> {space.opening_time.slice(0, 5)} - {space.closing_time.slice(0, 5)}
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="px-6 py-6 pt-0 border-t border-slate-50 mt-4 flex justify-between items-center bg-slate-50/50">
                                        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Capacidad: {space.max_capacity} Per.</div>
                                        <Link href={`/assistant?q=Redacta%20reglamento%20para%20${encodeURIComponent(space.name)}`}>
                                            <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest h-auto p-0 hover:bg-transparent hover:gap-3 transition-all">
                                                CREAR REGLAS <ChevronRight size={14} />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="bg-slate-900 text-white p-12 rounded-[50px] flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="bg-white/10 p-4 rounded-3xl w-fit shadow-2xl">
                                <ShieldCheck size={48} className="text-primary fill-primary" />
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase max-w-2xl leading-[0.9]">
                                ¿Necesitas ayuda con las reglas de acceso?
                            </h3>
                            <p className="text-slate-400 font-medium text-lg italic max-w-xl">
                                Nuestro Secretario IA puede redactar por ti el reglamento de uso de cada espacio basado en las leyes locales.
                            </p>
                            <Link href="/assistant">
                                <Button className="bg-white text-slate-900 h-14 px-12 rounded-2xl font-black italic uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl relative z-10">
                                    Solicitar a mi Secretario IA
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {activeTab === 'neighbors' && (
                    <div className="col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.9] mb-2">
                                    Gestión de Vecinos
                                </h3>
                                <p className="text-slate-500 font-medium text-lg italic uppercase tracking-tighter">
                                    Aprueba el acceso de nuevos residentes a la comunidad
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Solicitudes Pendientes</CardTitle>
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nuevos vecinos esperando aprobación</p>
                                </CardHeader>
                                <CardContent className="px-10 pb-10 space-y-4">
                                    {neighbors.filter(n => n.status === 'pending').length === 0 ? (
                                        <div className="py-12 flex flex-col items-center text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <div className="bg-white p-4 rounded-2xl shadow-sm text-slate-300">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">No hay solicitudes pendientes</p>
                                        </div>
                                    ) : (
                                        neighbors.filter(n => n.status === 'pending').map(neighbor => (
                                            <div key={neighbor.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                        <Users size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-black italic uppercase text-slate-900 truncate">{neighbor.full_name || 'Nuevo Vecino'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{neighbor.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleApproveNeighbor(neighbor.id)}
                                                        disabled={isProcessingNeighbor === neighbor.id}
                                                        className="h-9 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black uppercase italic text-[10px] tracking-widest"
                                                    >
                                                        {isProcessingNeighbor === neighbor.id ? <Loader2 size={14} className="animate-spin" /> : 'Aprobar'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleRejectNeighbor(neighbor.id)}
                                                        disabled={isProcessingNeighbor === neighbor.id}
                                                        className="h-9 px-4 rounded-xl text-red-500 hover:bg-red-50 font-black uppercase italic text-[10px] tracking-widest"
                                                    >
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Vecinos Activos</CardTitle>
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Residentes con acceso total</p>
                                </CardHeader>
                                <CardContent className="px-10 pb-10 space-y-4">
                                    {neighbors.filter(n => n.status === 'active').map(neighbor => (
                                        <div key={neighbor.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black italic uppercase text-slate-900">{neighbor.full_name || 'Sin Nombre'}</p>
                                                        {neighbor.role === 'admin' && <Badge className="bg-slate-900 text-[8px] h-4">ADMIN</Badge>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{neighbor.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-black italic uppercase border-primary/20 text-primary">ACTIVO</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
