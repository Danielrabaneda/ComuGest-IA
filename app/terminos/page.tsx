"use client"

import Link from "next/link"
import { ArrowLeft, Bot, ShieldCheck, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-slate-600 font-medium">Volver a la web</span>
          </Link>
          <div className="flex items-center gap-3">
            <Bot className="text-primary w-6 h-6" />
            <span className="text-xl font-bold font-outfit text-slate-900 uppercase tracking-tighter">ComuGest IA</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
              <FileText className="w-3 h-3" />
              Términos de Servicio
            </div>
            <h1 className="text-4xl lg:text-5xl font-outfit font-heavy text-slate-900 mb-6">
              Condiciones de Uso
            </h1>
            <p className="text-lg text-slate-500">Última actualización: 12 de marzo, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-slate-600 leading-relaxed">
                Al acceder y utilizar ComuGest IA, aceptas cumplir con estos Términos de Servicio. Si no estás de acuerdo con alguna de estas condiciones, te rogamos que no utilices nuestra plataforma.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Descripción del Servicio</h2>
              <p className="text-slate-600 leading-relaxed">
                ComuGest IA proporciona una herramienta de gestión de comunidades basada en inteligencia artificial. El servicio incluye la automatización de comunicaciones, gestión de incidencias y soporte inteligente mediante chat para vecinos.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Suscripciones y Pagos</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Ofrecemos varios planes de suscripción (Básico, Pro IA, Admin Pack). Al contratar un plan:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Te comprometes a proporcionar información de facturación veraz.</li>
                <li>Los pagos se procesan de forma segura a través de Stripe.</li>
                <li>La suscripción es recurrente y se renovará automáticamente a menos que se cancele.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Responsabilidad del Usuario</h2>
              <p className="text-slate-600 leading-relaxed">
                Como administrador, eres responsable del contenido que subas a la plataforma (actas, avisos, etc.). Te comprometes a no utilizar la IA para fines fraudulentos, spam o acoso.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitación de Responsabilidad</h2>
              <p className="text-slate-600 leading-relaxed">
                Aunque nuestra IA es avanzada, no sustituye el juicio legal o profesional de un administrador de fincas. ComuGest IA no se hace responsable de las decisiones tomadas basándose únicamente en las respuestas de la IA.
              </p>
            </section>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Compromiso ComuGest</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Actualizamos estos términos periódicamente para reflejar mejoras en nuestro servicio y cambios en la normativa vigente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          © 2026 ComuGest IA. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
