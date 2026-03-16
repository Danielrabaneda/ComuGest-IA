"use client"

import Link from "next/link"
import Image from "next/image"
import { 
  Bot, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Users
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="ComuGest IA" width={48} height={48} className="object-contain" />
            <span className="text-2xl font-outfit font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">ComuGest</span>
              <span className="text-[#41B7C1]"> - IA</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#messaging" className="text-slate-600 hover:text-primary transition-colors font-medium">Concepto</a>
            <a href="#about" className="text-slate-600 hover:text-primary transition-colors font-medium">Nosotros</a>
            <a href="#pricing" className="text-slate-600 hover:text-primary transition-colors font-medium">Planes</a>
            <a href="#contact" className="text-slate-600 hover:text-primary transition-colors font-medium">Contacto</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-slate-600 hover:text-primary transition-colors font-semibold">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#41B7C1]/10 border border-[#41B7C1]/20 text-[#41B7C1] font-bold text-sm mb-6 animate-fade-in shadow-sm shadow-[#41B7C1]/5">
                <Zap className="w-4 h-4 fill-[#41B7C1]" />
                No somos otro programa contable. Somos tu IA.
              </div>
              <h1 className="text-5xl lg:text-7xl font-outfit font-heavy tracking-tighter-3 leading-[1.1] mb-6 text-slate-900">
                La IA que <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#41B7C1] to-blue-600">lee, resume y responde</span> por ti.
              </h1>
              <h2 className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg font-normal">
                ComuGest IA es la capa de comunicación inteligente que reduce llamadas, WhatsApps y tiempo perdido. Tu secretario virtual 24/7.
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#pricing" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/30 group">
                  Ver Planes Especiales
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-lg">
                  <Globe className="w-5 h-5 text-primary" />
                  Acceso Inmediato
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                      <Image 
                        src={`https://i.pravatar.cc/150?u=${i + 20}`} 
                        alt="User" 
                        width={48} 
                        height={48} 
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <p className="text-sm font-bold text-slate-500">Únete a la Beta para Administradores</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#41B7C1]/15 via-indigo-400/5 to-transparent rounded-full blur-3xl -z-10"></div>
              <div className="animate-float">
                <Image 
                  src="/landing-hero.png" 
                  alt="ComuGest IA Mockup" 
                  width={800} 
                  height={800} 
                  className="w-full h-auto drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)] rounded-[2.5rem]"
                  priority
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-10 -right-4 glass p-4 rounded-2xl animate-float [animation-delay:1s] hidden md:block border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <ShieldCheck className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Secretario IA</p>
                    <p className="font-bold text-slate-900">Acta resumida con éxito</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-20 -left-10 glass p-6 rounded-3xl animate-float [animation-delay:2s] hidden md:block border-white/50">
                <div className="flex items-center gap-4">
                  <Bot className="text-primary w-10 h-10" />
                  <div>
                    <p className="text-sm italic text-slate-600">&quot;Generando comunicado oficial...&quot;</p>
                    <p className="font-bold text-primary mt-1">IA Procesando</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Messaging Section */}
        <section id="messaging" className="py-20 bg-slate-900 text-white overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-outfit font-heavy mb-8 leading-tight">
                  Digitalizar no es suficiente. <br/>
                  <span className="text-[#41B7C1]">Necesitas un Secretario.</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Reduce la carga de gestión</h4>
                      <p className="text-slate-400">Mientras otros solo guardan datos, ComuGest IA los entiende, resume actas y responde dudas de vecinos.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-500">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Comunicación Instantánea</h4>
                      <p className="text-slate-400">Generación automática de comunicados en versión formal para el tablón y versión corta para el móvil.</p>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="glass bg-white/5 border-white/10 p-8 rounded-[2.5rem]">
                    <p className="text-2xl font-medium italic text-slate-300 leading-relaxed">
                      &quot;Otras apps digitalizan tu comunidad; ComuGest IA se convierte en tu secretario: lee, resume y responde por ti.&quot;
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold">CG</div>
                      <div>
                        <p className="font-bold">Visión ComuGest</p>
                        <p className="text-sm text-slate-500">El futuro de la administración</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center border border-slate-100 rounded-[3rem] p-8 lg:p-16">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-[2.5rem] flex items-center justify-center overflow-hidden">
                  <Users className="w-48 h-48 text-primary opacity-20" />
                </div>
                <div className="absolute -bottom-8 -right-8 glass p-8 rounded-3xl border-white/40 max-w-xs shadow-2xl">
                  <p className="text-slate-600 italic text-sm mb-4">
                    &quot;Nuestra misión es devolver el tiempo a los administradores y la tranquilidad a los vecinos.&quot;
                  </p>
                  <p className="font-bold text-slate-900">Equipo ComuGest IA</p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Sobre Nosotros</h3>
                  <h2 className="text-4xl font-outfit font-heavy text-slate-900 leading-tight">
                    Redefiniendo la vida en <span className="text-[#41B7C1] italic">comunidad</span>.
                  </h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  ComuGest IA nació de una frustración compartida: la burocracia interminable en la gestión de fincas. Somos un equipo de ingenieros y expertos en administración que cree que la tecnología debe trabajar para las personas, no al revés.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-3xl font-heavy font-outfit text-primary">100%</p>
                    <p className="text-sm font-bold text-slate-500 uppercase">Foco en IA</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-heavy font-outfit text-emerald-500">24/7</p>
                    <p className="text-sm font-bold text-slate-500 uppercase">Soporte Virtual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-outfit font-heavy tracking-tighter mb-6 text-slate-900">
                Modelo Simple por <span className="text-[#41B7C1]">Comunidad</span>.
              </h2>
              <p className="text-lg text-slate-600">
                Precios agresivos diseñados para administradores de fincas. Prueba 30 días gratis sin tarjeta.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Plan Básico",
                  price: "7€",
                  desc: "Ideal para control esencial.",
                  features: ["Incidencias y Avisos", "Reservas Sencillas", "Acceso Web/Móvil", "IA: Clasificación básica"],
                  cta: "Empezar Gratis",
                  popular: false
                },
                {
                  name: "Pro IA",
                  price: "12€",
                  desc: "Tu foco: Gestión inteligente.",
                  features: ["Todo lo del Básico", "Chat Secretario IA", "Generación de Comunicados", "Resúmenes de Actas"],
                  cta: "Contratar Pro IA",
                  popular: true
                },
                {
                  name: "Admin Packs",
                  price: "49€",
                  desc: "Para grandes carteras.",
                  features: ["Hasta 10 comunidades", "Todo el Plan Pro IA", "Soporte Prioritario", "Ideal para administradores"],
                  cta: "Ver Pack 99€ (25 C.)",
                  popular: false
                }
              ].map((plan, i) => (
                <div key={i} className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? 'bg-slate-900 text-white border-slate-800 shadow-2xl scale-105 z-10' : 'bg-white border-slate-200 text-slate-900'}`}>
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#41B7C1] rounded-full text-white text-xs font-heavy tracking-widest uppercase shadow-lg shadow-[#41B7C1]/20">
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-primary">{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-heavy font-outfit">{plan.price}</span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                  
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#41B7C1]" />
                        <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    href={`/pagar?plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-20 p-8 rounded-3xl bg-white border border-slate-200 text-center">
              <h3 className="text-xl font-bold mb-4">¿Prefieres pago por vivienda?</h3>
              <p className="text-slate-600 mb-0">
                Paga solo <span className="font-bold text-slate-900">2,50€ / vivienda / AÑO</span>. Todo incluido.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
                <div className="lg:w-2/5 bg-primary p-12 lg:p-16 text-white space-y-12">
                  <div>
                    <h2 className="text-3xl font-outfit font-heavy mb-4">Hablemos</h2>
                    <p className="text-indigo-100">¿Tienes dudas sobre cómo implementar ComuGest en tu cartera de comunidades?</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <p className="font-medium">hola@comugest.ia</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <p className="font-medium">+34 912 345 678</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="font-medium">Madrid, España</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-3/5 p-12 lg:p-16 text-white bg-slate-900">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-heavy tracking-widest uppercase text-slate-500">Nombre</label>
                        <input type="text" className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all" placeholder="Juan Pérez" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-heavy tracking-widest uppercase text-slate-500">Email</label>
                        <input type="email" className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all" placeholder="juan@admin.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-heavy tracking-widest uppercase text-slate-500">Mensaje</label>
                      <textarea rows={4} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all" placeholder="Cuéntanos qué necesitas..."></textarea>
                    </div>
                    <button className="w-full lg:w-auto px-12 py-4 bg-primary rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20 text-lg">
                      Enviar Mensaje
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="bg-primary rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-4xl lg:text-6xl font-outfit font-heavy tracking-tight mb-8">
                    Tu comunidad, <span className="underline decoration-indigo-300">en cualquier lugar</span>.
                  </h2>
                  <p className="text-xl text-indigo-100 mb-12">
                    Sin instalaciones ni complicaciones. Accede desde tu móvil, tablet u ordenador de forma instantánea.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="bg-white text-primary px-10 py-5 rounded-2xl font-heavy text-xl hover:scale-105 transition-all shadow-xl">
                      Empezar Prueba Gratis
                    </Link>
                    <Link href="#contact" className="bg-slate-900/40 backdrop-blur text-white border border-white/20 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-slate-900/60 transition-all flex items-center gap-2">
                       Consultar con un agente
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative animate-float">
                    <div className="absolute inset-0 bg-white/20 rounded-[3rem] blur-2xl -rotate-6 scale-95"></div>
                    <Image 
                      src="/landing-hero.png" 
                      alt="App Interface" 
                      width={500} 
                      height={900} 
                      className="rounded-[3rem] shadow-2xl rotate-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-outfit font-heavy text-slate-900 mb-4">Preguntas Frecuentes</h2>
              <p className="text-slate-500">Todo lo que necesitas saber sobre el secretario del futuro.</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "¿Cómo funciona el Secretario IA exactamente?",
                  a: "Nuestra IA no es un bot de respuestas genéricas. Se entrena con los datos específicos de tu comunidad para poder responder sobre horarios de piscina, próximas juntas o normas de convivencia con total precisión."
                },
                {
                  q: "¿Es seguro para los datos de los vecinos?",
                  a: "Absolutamente. Cumplimos con el RGPD de forma estricta. Los datos se cifran en reposo y nunca se utilizan para entrenar modelos públicos externos. La privacidad es nuestro pilar fundamental."
                },
                {
                  q: "¿Qué pasa si ya tengo un software de contabilidad?",
                  a: "ComuGest IA no sustituye a tu programa contable, lo complementa. Somos la capa de comunicación que ahorra tiempo al administrador. Puedes seguir llevando las cuentas donde siempre y usar nuestra IA para la gestión del día a día."
                },
                {
                  q: "¿Cómo la instalo en mi móvil sin Play Store?",
                  a: "Es muy sencillo. Abre la web en tu móvil, pulsa en 'Compartir' (en iPhone/Safari) o en los tres puntos (en Android/Chrome) y selecciona 'Añadir a la pantalla de inicio'. Así tendrás nuestro icono y acceso directo como cualquier otra app, pero sin ocupar espacio."
                }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-between">
                    {item.q}
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">+</div>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <Image src="/logo-icon.png" alt="ComuGest IA" width={40} height={40} className="object-contain" />
                <span className="text-2xl font-bold font-outfit uppercase tracking-tighter">
                  <span className="text-slate-900">ComuGest</span>
                  <span className="text-[#41B7C1]"> - IA</span>
                </span>
              </div>
              <p className="text-slate-600 max-w-sm leading-relaxed mb-8">
                No somos otro programa contable; somos la capa de comunicación inteligente que reduce llamadas, WhatsApps y tiempo perdido.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                  <a key={social} href={`#${social}`} className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:-translate-y-1 transition-all shadow-sm">
                    <span className="sr-only">{social}</span>
                    <Globe className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Producto</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#messaging" className="hover:text-primary transition-colors">Concepto</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">Nosotros</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Precios</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Compañía</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#about" className="hover:text-primary transition-colors">Equipo</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contacto</a></li>
                <li><Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">© 2026 ComuGest IA. Premium Community Management.</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              Hecho con <span className="text-rose-500 animate-pulse">♥</span> para las comunidades del mañana.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
