'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    Bot,
    Loader2,
    Sparkles,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

interface AssistantDrawerProps {
    isOpen: boolean
    onClose: () => void
    context?: {
        type: 'space_rules'
        spaceName: string
        spaceId: string
    }
    onApplyAction?: (content: string) => void
}

export function AssistantDrawer({ isOpen, onClose, context, onApplyAction }: AssistantDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const handleSend = useCallback(async (e?: React.FormEvent, overrideText?: string) => {
        e?.preventDefault()
        const textToSend = overrideText || input
        if (!textToSend.trim() || isLoading) return

        setMessages(prev => [...prev, { role: 'user', content: textToSend }])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ message: textToSend }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) throw new Error('Error al conectar con el asistente')

            const { response } = await res.json()
            setMessages(prev => [...prev, { role: 'assistant', content: response }])
        } catch (err: unknown) {
            const error = err as { message: string }
            toast.error(error.message || 'Error en el chat')
        } finally {
            setIsLoading(false)
        }
    }, [input, isLoading])

    useEffect(() => {
        if (isOpen && context && messages.length === 0) {
            const initialPrompt = `Hola Secretario IA, necesito ayuda para redactar las reglas básicas del espacio "${context.spaceName}". ¿Podrías darme algunas sugerencias profesionales y claras?`
            handleSend(undefined, initialPrompt)
        }
    }, [isOpen, context, messages.length, handleSend])


    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-500 rounded-l-[40px]">
                    {/* Header */}
                    <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black italic uppercase tracking-tighter leading-none">Secretario IA</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Asistente de Comunidad</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.length === 0 && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
                                <Sparkles size={48} className="text-slate-300" />
                                <p className="text-sm font-bold uppercase tracking-widest">¿En qué puedo ayudarte?</p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex flex-col space-y-2",
                                m.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "max-w-[90%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                    m.role === 'user'
                                        ? "bg-slate-900 text-white rounded-tr-none"
                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                )}>
                                    {m.content}
                                </div>
                                {m.role === 'assistant' && onApplyAction && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onApplyAction(m.content)}
                                        className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                    >
                                        <Check size={12} className="mr-1" /> Integrar como reglas
                                    </Button>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                                    <Loader2 className="animate-spin text-slate-400" size={16} />
                                </div>
                                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <form
                            onSubmit={(e) => handleSend(e)}
                            className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-primary transition-all"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe al secretario..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-2"
                            />
                            <Button
                                size="icon"
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="rounded-xl h-10 w-10 bg-primary shadow-lg shadow-primary/20"
                            >
                                <Send size={18} />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
