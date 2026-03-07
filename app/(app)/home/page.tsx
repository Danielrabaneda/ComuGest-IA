import { createClient } from '@/lib/supabase/server'
import Onboarding from '@/components/community/Onboarding'
import Dashboard from '@/components/community/Dashboard'
import { redirect } from 'next/navigation'

export default async function HomePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`*, communities(*)`)
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        // Should not happen as profile is created via trigger
        console.error('Profile not found', error)
        return <div>Error al cargar perfil</div>
    }

    if (!profile.community_id) {
        return <Onboarding userId={user.id} />
    }

    return <Dashboard profile={profile as any} />
}
