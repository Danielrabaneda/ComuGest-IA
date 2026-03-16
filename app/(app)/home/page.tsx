import { createClient } from '@/lib/supabase/server'
import Onboarding from '@/components/community/Onboarding'
import Dashboard from '@/components/community/Dashboard'
import { redirect } from 'next/navigation'

import { Profile, Community } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    console.log('DEBUG: HomePage session user ID:', user.id)

    const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`*, communities(*)`)
        .eq('id', user.id)
        .single()

    if (error || !profileData) {
        console.error('DEBUG: Profile error in HomePage:', error)
        return <div>Error al cargar perfil</div>
    }

    const profile = profileData as Profile & { communities: Community | null }

    console.log('DEBUG: HomePage Profile data - Community:', profile.community_id, 'Role:', profile.role)
    
    // Si no tiene comunidad
    if (!profile.community_id) {
        // Pero es administrador, le dejamos entrar al panel de gestión global
        if (profile.role === 'admin') {
            redirect('/admin')
        }
        // Si no es admin, tiene que elegir o crear una comunidad
        return <Onboarding userId={user.id} />
    }

    // Si tiene comunidad, comprobamos el estado de su cuenta
    if (profile.role === 'neighbor') {
        if (profile.status === 'pending') {
            return (
                <div className="h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Solicitud en revisión</h1>
                    <p className="text-slate-500 max-w-md">
                        ¡Hola {profile.full_name}! Tu solicitud para unirte a <strong>{profile.communities?.name}</strong> ha sido enviada correctamente. 
                        El administrador debe aprobar tu acceso. Te notificaremos por email.
                    </p>
                    <Onboarding userId={user.id} /> {/* Permitirle cambiar de comunidad si se equivocó */}
                </div>
            )
        }

        if (profile.status === 'rejected') {
            return (
                <div className="h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                    <div className="bg-red-100 p-4 rounded-full text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Acceso denegado</h1>
                    <p className="text-slate-500 max-w-md">
                        Lo sentimos, tu acceso a esta comunidad no ha sido autorizado o ha sido desactivado. 
                        Contacta con tu administrador si crees que es un error.
                    </p>
                    <Onboarding userId={user.id} />
                </div>
            )
        }
    }

    return <Dashboard profile={profile} />
}
