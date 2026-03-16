import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import IncidentDetails from './IncidentDetails'

export const dynamic = 'force-dynamic'

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: incident, error } = await supabase
        .from('incidents')
        .select(`
      *,
      profiles(id, full_name, avatar_url, role),
      attachments:incident_attachments(*),
      comments:incident_comments(
        id,
        incident_id,
        user_id:author_id,
        body:message,
        created_at,
        profiles(full_name, avatar_url)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !incident) {
        console.error('Incident not found:', error)
        return notFound()
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return (
        <IncidentDetails
            incident={incident as any}
            userId={user.id}
            userRole={(myProfile?.role as 'neighbor' | 'admin' | 'president') || 'neighbor'}
        />
    )
}
