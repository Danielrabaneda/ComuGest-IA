'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    Plus,
    Trash2,
    Image as ImageIcon,
    Loader2,
    Zap,
    CheckCircle2,
    UploadCloud,
    ChevronRight,
    ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewIncidentPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isClassifying, setIsClassifying] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)])
        }
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            // 1. Get profile/community
            const { data: profile } = await supabase
                .from('profiles')
                .select('community_id')
                .eq('id', user.id)
                .single()

            if (!profile?.community_id) throw new Error('No perteneces a ninguna comunidad.')

            // 2. Classify with AI first (optional but nice)
            setIsClassifying(true)
            const aiRes = await fetch('/api/ai/classify-incident', {
                method: 'POST',
                body: JSON.stringify({ title, description }),
                headers: { 'Content-Type': 'application/json' }
            })
            const aiData = await aiRes.ok ? await aiRes.json() : { category: 'other', priority: 'medium', ai_summary: '' }
            setIsClassifying(false)

            // 3. Create incident record
            const { data: incident, error: incidentError } = await supabase
                .from('incidents')
                .insert({
                    community_id: profile.community_id,
                    created_by: user.id,
                    title,
                    description,
                    category: aiData.category,
                    priority: aiData.priority,
                    ai_summary: aiData.ai_summary,
                    status: 'open'
                })
                .select()
                .single()

            if (incidentError) throw incidentError

            // 4. Upload files if any
            if (files.length > 0) {
                toast.info('Subiendo fotos...')
                for (const file of files) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                    const filePath = `${incident.id}/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('incident-attachments')
                        .upload(filePath, file)

                    if (uploadError) {
                        console.error('Upload error:', uploadError)
                        continue
                    }

                    // 108: Get public URL
                    const { data } = supabase.storage
                        .from('incident-attachments')
                        .getPublicUrl(filePath)

                    const publicUrl = data.publicUrl
                    console.log('Generated public URL:', publicUrl)

                    const { error: insertError } = await supabase.from('incident_attachments').insert({
                        incident_id: incident.id,
                        file_url: publicUrl,
                        file_type: file.type.startsWith('image/') ? 'image' : 'other'
                    })

                    if (insertError) {
                        console.error('Error inserting attachment record:', insertError)
                        toast.error(`Error al registrar foto: ${file.name}`)
                    }
                }
            }

            toast.success('¡Incidencia reportada correctamente!')
            router.push(`/incidents/${incident.id}`)
            router.refresh()
        } catch (err: any) {
            toast.error('Error: ' + err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-white" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nueva Incidencia</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <div className="bg-primary p-2 w-fit rounded-xl mb-4 shadow-lg shadow-primary/20">
                                <ShieldAlert size={24} className="fill-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold italic tracking-tight uppercase">Datos del problema</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">
                                Explícanos qué sucede. Nuestra IA clasificará la urgencia automáticamente.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-bold text-slate-700 uppercase tracking-widest">¿Qué sucede? <span className="text-primary">*</span></Label>
                                    <Input
                                        id="title"
                                        placeholder="Ej: Fugas de agua en garaje sótano -1"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        className="h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all text-lg font-medium shadow-none px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-bold text-slate-700 uppercase tracking-widest">Descripción / Detalles adicionales</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Danos más información para que el administrador pueda actuar rápido..."
                                        rows={6}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full flex min-h-[140px] rounded-2xl border-2 border-slate-100 bg-transparent px-6 py-4 text-lg font-medium shadow-none transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-base font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon size={18} /> Adjuntar fotos o vídeos
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {files.map((file, i) => (
                                            <div key={i} className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center p-2 group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeFile(i)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary p-4">
                                            <div className="bg-white p-2 rounded-full shadow-sm">
                                                <UploadCloud size={24} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Añadir</span>
                                            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-0">
                                <Button className="w-full h-16 rounded-3xl text-xl font-black italic tracking-tight bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            {isClassifying ? 'LA IA ESTÁ CLASIFICANDO...' : 'REPORTANDO...'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Plus size={24} strokeWidth={3} />
                                            CONFIRMAR Y REPORTAR
                                        </div>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-none rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-widest uppercase text-xs">
                                <Zap size={16} className="fill-primary" /> IA Secretary Power
                            </div>
                            <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">Clasificación Automática</h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                                Nuestro Secretario IA analizará tu reporte en tiempo real para:
                            </p>
                            <div className="space-y-3">
                                {[
                                    "Asignar prioridad técnica",
                                    "Categorizar el problema",
                                    "Avisar al administrador correcto",
                                    "Generar resumen para actas"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700 text-sm font-bold italic">
                                        <CheckCircle2 size={18} className="text-primary shrink-0" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-amber-50 border-none rounded-3xl p-6 border-l-4 border-l-amber-500">
                        <h4 className="text-sm font-black text-amber-800 tracking-widest uppercase mb-2">🚨 IMPORTANTE</h4>
                        <p className="text-amber-800/70 text-sm font-medium leading-relaxed italic">
                            Si la incidencia supone un peligro inminente (incendio, derrumbe, pánico), por favor llame directamente a emergencias antes de reportarlo aquí.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
