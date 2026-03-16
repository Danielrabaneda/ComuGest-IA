import { NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter/client'
import { createClient } from '@/lib/supabase/server'
import { BASE_KNOWLEDGE } from '@/lib/ai/knowledge-base'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { session: authSession } } = await supabase.auth.getSession()

        if (!authSession) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { message, sessionId } = await req.json()
        console.log('Chat Request:', { message, sessionId })

        if (!message) {
            return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
        }

        // 1. Get profile and community info for context
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, communities(*)')
            .eq('id', authSession.user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
        }

        const isNeighbor = profile.role === 'neighbor'
        const isAdmin = profile.role === 'admin'

        // 2. Fetch context in sequence according to user instructions
        
        // A. Legal Knowledge (Law) is already in BASE_KNOWLEDGE
        
        let knowledgeContext = ''
        let neighborActivity = ''

        if (isAdmin) {
            // ADMIN FLOW: Can see all communities to compare
            const { data: allCommunities } = await supabase.from('communities').select('id, name')
            const commIds = allCommunities?.map(c => c.id) || []

            if (commIds.length > 0) {
                const [allDocs, allSpaces] = await Promise.all([
                    supabase.from('docs').select('community_id, title, body, created_at').in('community_id', commIds).eq('type', 'other'),
                    supabase.from('spaces').select('community_id, name, rules, opening_time, closing_time, created_at').in('community_id', commIds)
                ])

                knowledgeContext = `ESTÁS EN MODO ADMINISTRADOR GLOBAL. Tienes acceso a información de múltiples comunidades para comparar:\n\n`
                knowledgeContext += allCommunities?.map(c => {
                    const cDocs = allDocs.data?.filter(d => d.community_id === c.id) || []
                    const cSpaces = allSpaces.data?.filter(s => s.community_id === c.id) || []
                    
                    const docText = cDocs.map(d => `[Documento: ${d.title}] ${d.body}`).join('\n')
                    const spaceText = cSpaces.map(s => `[Espacio: ${s.name}] Horario: ${s.opening_time}-${s.closing_time}, Reglas: ${s.rules}`).join('\n')
                    
                    return `--- COMUNIDAD: ${c.name} ---\n${docText}\n${spaceText}\n`
                }).join('\n') || ''
            }
        } else {
            // NEIGHBOR/SPECIFIC FLOW: Focus on their current community
            const [docsRes, spacesRes] = await Promise.all([
                supabase.from('docs').select('title, body, created_at').eq('community_id', profile.community_id).eq('type', 'other'),
                supabase.from('spaces').select('name, rules, opening_time, closing_time, created_at').eq('community_id', profile.community_id)
            ])

            const formatDate = (isoString?: string) => {
                if (!isoString) return 'Fecha desconocida'
                return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
            }

            const docText = docsRes.data?.map(d => `[Documento: ${d.title}] (Actualizado el: ${formatDate(d.created_at)})\nContenido: ${d.body}`).join('\n\n') || ''
            const spaceText = spacesRes.data?.map(s => `[Espacio: ${s.name}] (Configurado el: ${formatDate(s.created_at)})\nHorario: ${s.opening_time} a ${s.closing_time}\nReglas: ${s.rules || 'Ninguna'}`).join('\n\n') || ''
            
            knowledgeContext = `INFORMACIÓN ESPECÍFICA DE LA COMUNIDAD "${profile.communities?.name}":\n${docText}\n${spaceText}`

            if (isNeighbor) {
                const [myIncidents, myReservations] = await Promise.all([
                    supabase.from('incidents').select('title, description, status, created_at').eq('created_by', profile.id).order('created_at', { ascending: false }),
                    supabase.from('reservations').select('start_time, end_time, status, spaces(name)').eq('user_id', profile.id).order('start_time', { ascending: false })
                ])

                const incidentsText = myIncidents.data?.map(i => `- [Incidencia] Titulo: ${i.title}, Estado: ${i.status}, Descripción: ${i.description}`).join('\n') || 'No has reportado incidencias.'
                const reservationsText = myReservations.data?.map(r => {
                    const spaces = r.spaces as unknown as { name: string }[] | { name: string } | null
                    const spaceName = Array.isArray(spaces) ? spaces[0]?.name : spaces?.name || 'Espacio desconocido'
                    return `- [Reserva] Espacio: ${spaceName}, Desde: ${new Date(r.start_time).toLocaleString('es-ES')}, Hasta: ${new Date(r.end_time).toLocaleString('es-ES')}, Estado: ${r.status}`
                }).join('\n') || 'No tienes reservas.'

                neighborActivity = `
-- INFORMACIÓN Y ACTIVIDAD PERSONAL DEL VECINO (${profile.full_name}) --
TUS INCIDENCIAS RECIENTES:
${incidentsText}

TUS RESERVAS RECIENTES:
${reservationsText}
----------------------------------`
            }
        }

        // 3. Build system context following the requested order
        let systemMessage = `Eres el "Secretario IA" de la plataforma ComuGest IA. Tu tono es profesional, servicial y experto en gestión de comunidades.
Tu respuesta debe seguir estrictamente este flujo de información según el rol del usuario:

--- FLUJO PARA ${isAdmin ? 'ADMINISTRADORES' : 'VECINOS'} ---

1. LEY Y NORMATIVA BASE:
Usa esta información para consultas legales generales sobre la Ley de Propiedad Horizontal.
${BASE_KNOWLEDGE}

2. INFORMACIÓN ESPECÍFICA DE LA(S) COMUNIDAD(ES):
Usa esta información para normas, horarios y documentos propios de la(s) comunidad(es).
${knowledgeContext}
`

        if (isNeighbor) {
            systemMessage += `
3. ACTIVIDAD Y DATOS PERSONALES DEL VECINO:
Usa esta información para responder sobre incidencias que el vecino ha reportado, sus reservas o cualquier dato que él mismo haya proporcionado.
${neighborActivity}

REGLA PARA VECINOS: El vecino puede solicitar resúmenes de sus propias incidencias, estado de sus reservas o información que él mismo puso en la plataforma. Debes ser capaz de dárselo de forma clara.`
        }

        if (isAdmin) {
            systemMessage += `
REGLA PARA ADMINISTRADORES: Como administrador, puedes realizar preguntas generales sobre todas las comunidades gestionadas. Estás facultado para comparar normativas, estados o cualquier información entre las distintas comunidades listadas en la sección 2.`
        }

        systemMessage += `

--- REGLAS FINALES DE COMPORTAMIENTO ---
1. Identidad: Te diriges a ${profile.full_name}.
2. Veracidad: Si la información necesaria para responder no se encuentra en los puntos anteriores, indica amablemente que no dispones de esos datos específicos.
3. Comparación (Sólo Admin): Si se solicita comparar comunidades, presenta la información de forma estructurada destacando las diferencias clave.
4. Privacidad: Nunca reveles datos personales de un vecino a otro vecino. Los administradores sí tienen acceso a la visión global.`

        console.log('Calling OpenRouter for role:', profile.role)
        const response = await callOpenRouter([
            { role: 'system', content: systemMessage },
            { role: 'user', content: message }
        ], { 
            temperature: 0.7, 
            model: process.env.OPENROUTER_MODEL || 'openrouter/auto' 
        })

        console.log('OpenRouter Response:', response)

        return NextResponse.json({ response })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno'
        console.error('API Error details:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
