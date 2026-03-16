"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Bot, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Zap,
  Loader2
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "Pro IA"
  const communityId = searchParams.get("communityId")
  const price = plan.toLowerCase().includes("pro") ? "12€" : plan.toLowerCase().includes("básico") ? "7€" : "49€"
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    communityName: "",
    adminEmail: "",
    viviendas: "20"
  })

  const supabase = createClient()

  useEffect(() => {
    const loadCommunity = async () => {
      if (communityId && communityId !== 'undefined') {
        const { data: comm } = await supabase.from('communities').select('*').eq('id', communityId).single()
        if (comm) {
          setFormData(prev => ({
            ...prev,
            communityName: comm.name
          }))
        }
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setFormData(prev => ({
          ...prev,
          adminEmail: user.email || ""
        }))
      }
    }
    loadCommunity()
  }, [communityId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: plan,
          communityName: formData.communityName,
          email: formData.adminEmail,
          communityId: communityId
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "No se pudo crear la sesión de pago")
      }
    } catch (err: any) {
      alert("Error: " + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="text-primary w-6 h-6" />
            <span className="font-outfit font-bold text-slate-900 uppercase tracking-tighter">ComuGest IA</span>
          </div>
          <div className="w-20"></div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-12">
            
            {/* Formulario */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h1 className="text-3xl font-outfit font-heavy text-slate-900 mb-2">Configura tu comunidad</h1>
                <p className="text-slate-500">Completa los detalles para activar el servicio de inmediato.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Nombre de la Comunidad
                    </label>
                    <input 
                      required
                      type="text"
                      placeholder="Ej: Residencial Las Palmeras"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.communityName}
                      onChange={(e) => setFormData({...formData, communityName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Email del Administrador
                    </label>
                    <input 
                      required
                      type="email"
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nº de Viviendas</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                        value={formData.viviendas}
                        onChange={(e) => setFormData({...formData, viviendas: e.target.value})}
                      >
                        <option value="20">Hasta 20</option>
                        <option value="50">Hasta 50</option>
                        <option value="100">Hasta 100</option>
                        <option value="+100">+100</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Periodicidad</label>
                      <div className="px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 font-medium">
                        Mensual
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-primary/30 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Ir al Pago Seguro
                      <CreditCard className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Pago procesado de forma segura por Stripe. Cifrado AES-256.
                </p>
              </form>
            </div>

            {/* Resumen Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-28 shadow-2xl">
                <div className="inline-flex px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-heavy tracking-widest uppercase mb-6">
                  Resumen de orden
                </div>
                
                <h2 className="text-2xl font-bold mb-6">{plan}</h2>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Acceso App Vecinos",
                    "Gestión de Incidencias",
                    plan === "Pro IA" || plan === "Admin Packs" ? "Secretario IA 24/7" : "IA Básica",
                    plan === "Pro IA" || plan === "Admin Packs" ? "Resúmenes de Actas" : "Reservas estándar",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Subtotal</span>
                    <span>{price}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>IVA (21%)</span>
                    <span>Incluido</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold pt-2">
                    <span>Total a pagar</span>
                    <span className="text-primary text-3xl font-outfit">{price}<span className="text-sm font-normal text-slate-400 ml-1">/mes</span></span>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                   </div>
                   <p className="text-xs text-slate-400">
                     Garantía de reembolso de 14 días si no estás satisfecho.
                   </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default function PagarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
