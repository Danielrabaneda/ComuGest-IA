'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, Users, Mail, Phone, MapPin, Clock, User } from 'lucide-react'
import { Profile, Community } from '@/types'

export default function CommunityInfoPage() {
    const [community, setCommunity] = useState<Community | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                if (profileData.community_id) {
                    const { data: communityData } = await supabase
                        .from('communities')
                        .select('*')
                        .eq('id', profileData.community_id)
                        .single()

                    if (communityData) {
                        setCommunity(communityData as Community)
                    }
                }
            }
            setIsLoading(false)
        }

        fetchData()
    }, [supabase])

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!community) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <Card className="text-center p-8 border-dashed flex flex-col items-center justify-center min-h-[400px]">
                    <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">No tienes comunidad asignada</h2>
                    <p className="text-slate-500 mb-6 max-w-md">Para ver la información de tu comunidad, un administrador debe asignarte a una o puedes usar un código de invitación.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 w-full space-y-6">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mi Comunidad</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Información general y detalles de tu vecindario</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resumen Card */}
                <Card className="shadow-lg border-0 bg-white md:col-span-2">
                    <CardHeader className="bg-primary pb-8 pt-6 rounded-t-xl text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
                        <CardTitle className="text-3xl font-black relative z-10 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8" />
                            {community.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dirección</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {community.address || 'Av. Principal 123, Madrid'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                                    <Users className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Plan</p>
                                    <p className="text-sm font-bold text-primary capitalize">
                                        Plan {community.plan || 'Básico'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Comunidad ID</p>
                                    <p className="text-sm font-semibold text-slate-500 font-mono">
                                        {community.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Contacto Admins (Mocked visual or data driven if exists) */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users size={18} className="text-primary" />
                            Administración
                        </CardTitle>
                        <CardDescription>Contacto de los gestores o presidente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User size={14} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Gestoría Fincas Sur</p>
                                    <p className="text-xs text-slate-500">Administrador</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone size={14} className="text-slate-400" />
                                <span>912 345 678</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail size={14} className="text-slate-400" />
                                <span>info@fincassur.com</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Horarios o Info extra */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Horarios de Interés
                        </CardTitle>
                        <CardDescription>Horas permitidas para áreas comunes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-sm font-semibold text-slate-700">Piscina</span>
                                <span className="text-sm font-bold text-emerald-600">10:00 - 22:00</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-sm font-semibold text-slate-700">Pádel</span>
                                <span className="text-sm font-bold text-emerald-600">09:00 - 23:00</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-sm text-slate-500">Recogida de basuras</span>
                                <span className="text-sm font-medium text-slate-600">20:00 - 23:00</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
