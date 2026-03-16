"use client"

import Link from "next/link"
import { ArrowLeft, Bot, ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="text-primary w-6 h-6" />
            <span className="font-outfit font-bold text-slate-900 uppercase tracking-tighter">ComuGest IA</span>
          </div>
          <div className="w-24"></div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-outfit font-heavy text-slate-900 leading-none">Política de Privacidad</h1>
              <p className="text-slate-500 mt-2 italic">Última actualización: 12 de Marzo, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">1. Introducción</h2>
              <p>
                En ComuGest IA, valoramos tu privacidad y la de tus vecinos. Esta política describe cómo recopilamos, usamos y protegemos la información personal en el marco de la administración de comunidades y el uso de Inteligencia Artificial.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">2. Información que Recopilamos</h2>
              <p>Recopilamos datos estrictamente necesarios para la gestión comunitaria:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Datos de identificación del administrador y vecinos (nombre, email).</li>
                <li>Información de la vivienda (identificador de piso/letra).</li>
                <li>Comunicaciones procesadas por nuestra IA para generar resúmenes y respuestas.</li>
                <li>Registros de acceso y logs de seguridad.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">3. Uso de la Inteligencia Artificial</h2>
              <p>
                Nuestra IA procesa mensajes de texto y actas de reuniones para facilitar la comunicación. Importante:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Los datos no se utilizan para entrenar modelos públicos externos.</li>
                <li>Toda la información reside en servidores europeos cumpliendo con el RGPD.</li>
                <li>El procesamiento es transitorio para generar el contenido solicitado.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">4. Tus Derechos (ARCO)</h2>
              <p>
                Como usuario, tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos enviando un correo electrónico a <span className="font-bold text-primary">privacidad@comugest.ia</span>.
              </p>
            </section>

            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-sm">Si tienes alguna duda sobre nuestra política de privacidad, no dudes en contactar con nuestro responsable de protección de datos.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
