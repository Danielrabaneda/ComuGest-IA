"use client"

import Link from "next/link"
import { CheckCircle2, Bot, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white font-inter flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-white p-6 rounded-[35px] shadow-2xl border-4 border-emerald-500/20">
          <CheckCircle2 size={64} className="text-emerald-500" strokeWidth={3} />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bot className="text-primary w-6 h-6" />
          <span className="font-outfit font-black text-slate-900 uppercase tracking-tighter">ComuGest IA</span>
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
          ¡Pago Completado!
        </h1>
        
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Tu comunidad ha sido actualizada al <span className="text-primary font-bold">Plan Pro Vecinal</span>. 
          Ya puedes disfrutar del Secretario IA y la gestión de reservas ilimitada.
        </p>

        <div className="pt-8 flex flex-col gap-4">
          <Link href="/admin">
            <Button className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black italic uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-transform">
              Ir al Panel de Control <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
          
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 text-left">
            <div className="bg-primary/20 p-2.5 rounded-xl">
               <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Próximos pasos</p>
              <p className="text-xs font-bold text-slate-700 italic">Configura tus espacios comunes desde la pestaña "Espacios".</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">
        ComuGest IA © 2026 · Soluciones Inteligentes
      </div>
    </div>
  )
}
