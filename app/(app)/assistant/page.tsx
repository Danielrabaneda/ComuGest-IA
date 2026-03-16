'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Send,
    Bot,
    Trash2,
    Calendar,
    MessageSquare,
    AlertTriangle,
    BadgeInfo,
    MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { PLAN_FEATURES } from '@/types'
import Link from 'next/link'

type Message = {
    role: 'user' | 'assistant'
    content: string
    time?: string
}

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu Secretario IA. ¿En qué puedo ayudarte hoy con la gestión de tu comunidad?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)
    const [isCheckingPlan, setIsCheckingPlan] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*, communities(*)')
                .eq('id', user.id)
                .single()

            const plan = profile?.communities?.plan || 'basic'
            if (!PLAN_FEATURES[plan as 'basic' | 'pro'].ai_chat) {
                setIsBlocked(true)
            }
            setIsCheckingPlan(false)
        }
        checkPlan()
    }, [supabase])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
        e?.preventDefault()
        const textToSend = overrideText || input
        if (!textToSend.trim() || isLoading) return

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        setMessages(prev => [...prev, { role: 'user', content: textToSend, time: currentTime }])
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
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const SUGGESTIONS = [
        { text: '¿Cuáles son las normas del garaje?', icon: <BadgeInfo size={14} /> },
        { text: 'Redacta un aviso sobre la limpieza.', icon: <MessageSquare size={14} /> },
        { text: '¿Cómo puedo reservar el pádel?', icon: <Calendar size={14} /> },
        { text: 'Tengo una avería, ¿qué hago?', icon: <AlertTriangle size={14} /> },
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-112px)] md:h-[calc(100vh-144px)] max-w-2xl mx-auto w-full border-x border-slate-200 bg-white shadow-xl overflow-hidden relative">

            {/* Header - WhatsApp style */}
            <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 shrink-0 border-b border-slate-200 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[16px] font-semibold text-[#111b21] leading-tight">Secretario IA</h1>
                        <span className="text-[13px] text-[#667781] leading-tight flex items-center gap-1.5">
                            en línea
                            <span className="w-1.5 h-1.5 bg-[#25d366] rounded-full animate-pulse" />
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[#54656f]">
                    <div className="h-full flex items-center pt-1" onClick={() => setMessages([messages[0]])} role="button" title="Limpiar chat">
                        <Trash2 size={20} className="hover:text-red-500 transition-colors" />
                    </div>
                    <MoreVertical size={20} />
                </div>
            </div>

            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]"
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2 relative min-h-0 bg-[#efeae2] flex flex-col z-0">

                {/* Initial verify badge mock */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white/80 py-1.5 px-3 rounded-xl shadow-sm text-[12px] text-[#54656f] font-medium backdrop-blur-sm">
                        Los mensajes están encriptados de extremo a extremo... bueno, casi.
                    </div>
                </div>

                {messages.map((message, i) => (
                    <div key={i} className={cn(
                        "flex w-full mb-1",
                        message.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                        <div className="flex gap-2 max-w-[85%]">
                            {message.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-slate-400 mt-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}
                            <div className={cn(
                                "px-3 py-1.5 rounded-lg relative text-[15px] shadow-sm whitespace-pre-wrap leading-snug",
                                message.role === 'user'
                                    ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none"
                                    : "bg-white text-[#111b21] rounded-tl-none"
                            )}>
                                {message.role === 'assistant' && (
                                    <div className="text-[13px] font-semibold text-[#075e54] text-left leading-tight mb-1">
                                        Secretario IA
                                    </div>
                                )}

                                <span className="align-middle">{message.content}</span>

                                <span className="float-right text-[11px] text-[#667781] ml-3 mt-2 h-3 items-end flex pb-0.5 select-none">
                                    {message.time || '12:00'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex w-full mb-1 justify-start">
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="w-7 h-7 rounded-full bg-slate-400 mt-1 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="px-4 py-3 bg-white text-[#111b21] rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 justify-center rounded-full animate-bounce delay-75" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
            </div>

            {/* Suggestions block (floating above input) */}
            {messages.length === 1 && (
                <div className="absolute bottom-20 left-4 right-4 z-10">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth w-full">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#54656f] hover:bg-[#d9fdd3] hover:text-[#111b21] transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                onClick={() => handleSend(undefined, s.text)}
                            >
                                {s.icon} {s.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-2 md:p-3 bg-[#f0f2f5] flex items-end gap-2 shrink-0 z-10 relative">

                <form onSubmit={handleSend} className="flex-1 flex items-center m-0 p-0 relative min-w-0">
                    <div className="flex-1 bg-white border border-slate-200 rounded-[20px] flex items-end pr-2 pl-3 py-1 min-h-[40px] shadow-sm">
                        <textarea
                            rows={1}
                            style={{ resize: 'none' }}
                            className="flex-1 bg-transparent outline-none text-[15px] pt-1.5 pb-1 max-h-24 overflow-y-auto"
                            placeholder="Escribe un mensaje..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend(e)
                                }
                            }}
                        />
                    </div>
                </form>

                <button
                    onClick={(e) => handleSend(e)}
                    disabled={isLoading || !input.trim()}
                    className="p-2 mb-0.5 shrink-0"
                >
                    <div className={cn(
                        "text-white rounded-full w-[40px] h-[40px] flex items-center justify-center shadow-md transition-colors",
                        input.trim() ? "bg-primary" : "bg-slate-300"
                    )}>
                        <Send size={18} className={cn("translate-x-[2px]", !input.trim() && "opacity-50")} />
                    </div>
                </button>
            </div>

            {/* Blocked Overlay */}
            {isBlocked && (
                <div className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 rounded-[30px] flex items-center justify-center mb-8 ring-8 ring-primary/10">
                        <Bot size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Secretario IA Bloqueado</h2>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-sm">
                        La gestión inteligente y el chat con el Secretario IA son exclusivos para comunidades con el <span className="text-primary font-bold">Plan Pro Vecinal</span>.
                    </p>
                    <Link href="/admin" className="w-full max-w-xs">
                        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic uppercase text-sm tracking-widest shadow-2xl shadow-primary/20 transition-transform active:scale-95">
                            Mejorar mi Plan
                        </Button>
                    </Link>
                    <Link href="/home" className="mt-6 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors">
                        Volver al Inicio
                    </Link>
                </div>
            )}

            {isCheckingPlan && (
                <div className="absolute inset-0 z-[100] bg-white flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}

function Button({ className, children, ...props }: any) {
    return (
        <button className={cn("inline-flex items-center justify-center transition-all", className)} {...props}>
            {children}
        </button>
    )
}

