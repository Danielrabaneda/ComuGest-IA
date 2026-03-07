'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    Home,
    MessageSquare,
    AlertCircle,
    Megaphone,
    Calendar,
    Settings,
    Clock,
    LogOut,
    Menu,
    X,
    User,
    ShieldCheck,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select(`*, communities(*)`)
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data as Profile)
            }
            setIsLoading(false)
        }

        fetchProfile()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const navigation = [
        { name: 'Inicio', href: '/home', icon: Home, exact: true },
        { name: 'Mi Comunidad', href: '/home/community', icon: ShieldCheck },
        { name: 'Incidencias', href: '/incidents', icon: AlertCircle },
        { name: 'Avisos', href: '/notices', icon: Megaphone },
        { name: 'Reservas', href: '/reservations', icon: Calendar },
        { name: 'Secretario IA', href: '/assistant', icon: MessageSquare },
    ]

    // Add Admin tools if applicable
    const isAdmin = profile?.role === 'admin' || profile?.role === 'president'
    if (isAdmin) {
        navigation.push({ name: 'Gestión Admin', href: '/admin', icon: Settings })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Zap className="animate-pulse text-primary h-12 w-12" />
            </div>
        )
    }

    if (profile?.status === 'pending') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                        <div className="bg-amber-100 h-24 w-24 rounded-[30px] flex items-center justify-center text-amber-600 mx-auto shadow-xl shadow-amber-100/50">
                            <Clock size={48} className="animate-spin-slow" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                            <ShieldCheck className="text-primary" size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-tight">
                            Cuenta en Revisión
                        </h1>
                        <p className="text-slate-500 font-medium text-lg italic leading-relaxed">
                            ¡Hola, <span className="text-slate-900 font-bold">{profile.full_name}</span>! Hemos recibido tu solicitud para unirte a
                            <span className="text-primary font-bold"> {profile.communities?.name}</span>.
                        </p>
                        <div className="bg-white p-6 rounded-[30px] shadow-2xl shadow-slate-200/50 border border-white/20 text-left space-y-4">
                            <p className="text-sm text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-primary fill-primary" /> Próximos pasos
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-slate-600 font-medium text-sm">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                                    El administrador recibirá una notificación de tu llegada.
                                </li>
                                <li className="flex gap-3 text-slate-600 font-medium text-sm">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                                    Verificará que eres residente de la comunidad.
                                </li>
                                <li className="flex gap-3 text-slate-600 font-medium text-sm">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</div>
                                    Una vez aprobado, tendrás acceso a todas las herramientas.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button variant="ghost" className="text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 rounded-xl px-8" onClick={handleLogout}>
                            <LogOut size={16} className="mr-2" /> Cerrar sesión y ver más tarde
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Overlay */}
            <aside className={cn(
                "fixed inset-y-0 left-0 bg-white border-r w-72 transform transition-transform duration-200 ease-in-out z-50 lg:relative lg:translate-x-0 overflow-y-auto",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-md shadow-primary/20">
                            <Zap size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ComuGest IA</span>
                        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </Button>
                    </div>

                    <nav className="space-y-1.5 flex-1">
                        {navigation.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : (pathname === item.href || pathname.startsWith(item.href + '/'))
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-slate-600 hover:bg-slate-100"
                                    )}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="bg-slate-100 h-10 w-10 flex items-center justify-center rounded-full text-slate-500">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate leading-tight">{profile?.full_name}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                                    {profile?.role === 'neighbor' ? 'Vecino' : 'Administrador'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-slate-200 text-slate-600" onClick={handleLogout}>
                            <LogOut size={18} />
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden max-h-screen">
                <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </Button>

                    <div className="flex items-center gap-4 ml-auto">
                        {profile?.communities && (
                            <div className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                                    📍 {profile.communities?.name}
                                </p>
                            </div>
                        )}
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                            Plan {profile?.communities?.plan || 'basic'}
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto h-full">
                        {children}
                    </div>
                </section>
            </main>
        </div>
    )
}
