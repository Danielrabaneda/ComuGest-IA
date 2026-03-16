'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    Send,
    Loader2,
    Zap,
    PenLine,
    Megaphone,
    Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewNoticePage() {
    const [draft, setDraft] = useState('')
    const [title, setTitle] = useState('')
    const [formalBody, setFormalBody] = useState('')
    const [shortBody, setShortBody] = useState('')
    const [type, setType] = useState('general')

    const [isGenerating, setIsGenerating] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    // Map UI labels to database types
    const categoryMap: Record<string, string> = {
        'General': 'general',
        'Obras': 'works',
        'Junta': 'meeting',
        'Garaje': 'maintenance',
        'Limpieza': 'cleaning'
    }

    const handleGenerateAI = async () => {
        if (!draft.trim()) {
            toast.warning('Escribe un borrador primero para que la IA pueda ayudarte.')
            return
        }

        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai/generate-notice', {
                method: 'POST',
                body: JSON.stringify({ draft }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) throw new Error('Error al conectar con la IA')

            const data = await res.json()

            setTitle(data.title || '')
            setFormalBody(data.formal_body || '')
            setShortBody(data.short_body || '')
            setHasGenerated(true)
            toast.success('¡Comunicado generado correctamente!')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePublish = async () => {
        if (!title || !formalBody) {
            toast.error('Title and draft required')
            return
        }

        setIsPublishing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autorizado')

            const { data: profile } = await supabase.from('profiles').select('community_id').eq('id', user.id).single()
            if (!profile?.community_id) throw new Error('No perteneces a ninguna comunidad.')

            const { data: notice, error } = await supabase
                .from('notices')
                .insert({
                    community_id: profile.community_id,
                    created_by: user.id,
                    title,
                    body: formalBody,
                    short_body: shortBody,
                    type: type,
                })
                .select()
                .single()

            if (error) throw error

            toast.success('Comunicado publicado oficialmente.')
            router.push(`/notices/${notice.id}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido'
            toast.error('Error al publicar: ' + message)
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 overflow-hidden">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-white" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">Nuevo Comunicado</h1>
                    <p className="text-slate-500 font-medium">Usa la IA para redactar un aviso formal a partir de tus notas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Input area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 border-b-0 space-y-4 p-8">
                            <div className="bg-primary/20 p-2.5 rounded-xl w-fit">
                                <PenLine size={24} className="text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">FASE 1: TU BORRADOR</CardTitle>
                            <CardDescription className="text-slate-400 font-medium text-base">
                                Escribe tus ideas en bruto. No te preocupes por el tono, la IA lo profesionalizará.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Tus notas o borrador</Label>
                                <textarea
                                    rows={8}
                                    placeholder="Ej: 'Chicos hay que recordar que no se puede aparcar en el vado. Mañana viene el camión de las basuras a las 10 y necesita espacio. Gracias.'"
                                    className="w-full bg-slate-50 rounded-2xl border-2 border-slate-100 p-6 text-slate-700 font-medium text-lg focus:border-primary transition-all outline-none italic"
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Categoría</Label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(categoryMap).map(([label, value]) => (
                                        <Button
                                            key={value}
                                            variant={type === value ? 'default' : 'outline'}
                                            className={cn("rounded-full border-slate-200 font-bold text-xs uppercase h-10 px-6", type === value ? "bg-slate-900" : "text-slate-500")}
                                            onClick={() => setType(value)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        className="w-full h-16 rounded-3xl bg-primary text-xl font-black italic tracking-tight shadow-xl shadow-primary/20 hover:scale-105 transition-transform group overflow-hidden"
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        data-testid="generate-ai-button"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 size={24} className="animate-spin" />
                                                IA ESTÁ REDACTANDO...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Zap size={24} className="fill-white group-hover:animate-pulse" />
                                                MEJORAR CON IA
                                            </div>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-16 rounded-3xl border-2 border-slate-200 text-xl font-black italic uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50"
                                        onClick={handlePublish} // This will fail if title is missing, which is good for validation test
                                        disabled={isPublishing}
                                        data-testid="publish-button"
                                    >
                                        Publicar
                                    </Button>
                                </div>
                        </CardFooter>
                    </Card>

                    <div className="bg-amber-50 rounded-3xl p-6 border-l-4 border-l-amber-500 text-amber-900/80 italic font-medium">
                        Consigue el tono perfecto para la comunidad: profesional pero cercano.
                    </div>
                </div>

                {/* AI Output / Final Area */}
                <div className="lg:col-span-3 space-y-6">
                    {!hasGenerated ? (
                        <Card className="h-full border-dashed border-2 bg-transparent flex flex-col items-center justify-center p-20 text-slate-400 space-y-6">
                            <div className="bg-white p-6 rounded-full shadow-2xl shadow-primary/5">
                                <Megaphone size={64} className="opacity-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-black italic uppercase opacity-20 tracking-tighter">FASE 2: REDACCIÓN OFICIAL</p>
                                <p className="text-slate-400 font-medium">El borrador mejorado aparecerá aquí para tu revisión.</p>
                            </div>
                        </Card>
                    ) : (
                        <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-3xl overflow-hidden bg-white animate-in zoom-in-95 duration-500">
                            <CardHeader className="bg-emerald-600 text-white p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Check size={24} />
                                    </div>
                                    <Badge className="bg-white text-emerald-600 font-black h-fit px-4 py-1.5 border-none tracking-widest">IA LISTO PARA REVISIÓN</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">REVISA Y EDITA</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Título del aviso</Label>
                                    <Input
                                        className="h-14 rounded-2xl border-none bg-slate-100 font-bold text-lg px-6"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Cuerpo Formal (Completo)</Label>
                                    <textarea
                                        rows={10}
                                        className="w-full bg-slate-100 rounded-2xl border-none p-6 text-slate-700 font-medium leading-relaxed outline-none focus:ring-2 ring-primary transition-all"
                                        value={formalBody}
                                        onChange={e => setFormalBody(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Resumen cortito (Telegram/WhatsApp)</Label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-slate-100 rounded-2xl border-none p-6 text-slate-700 font-medium italic leading-relaxed outline-none focus:ring-2 ring-primary transition-all"
                                        value={shortBody}
                                        onChange={e => setShortBody(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 bg-slate-50 border-t border-slate-100">
                                <Button
                                    className="w-full h-16 rounded-3xl bg-slate-900 text-white text-xl font-black italic uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:scale-[1.02] transition-transform"
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    data-testid="publish-final-button"
                                >
                                    {isPublishing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            PUBLICANDO...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Send size={24} strokeWidth={3} />
                                            PUBLICAR OFICIALMENTE
                                        </div>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
