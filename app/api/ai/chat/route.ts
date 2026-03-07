import { NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter/client'
import { createClient } from '@/lib/supabase/server'

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

        console.log('User Profile:', profile?.full_name)

        // Fetch AI knowledge base (spaces and custom docs)
        const [docsRes, spacesRes] = await Promise.all([
            supabase.from('docs').select('title, body, created_at').eq('community_id', profile?.community_id).eq('type', 'other'),
            supabase.from('spaces').select('name, rules, opening_time, closing_time, created_at').eq('community_id', profile?.community_id)
        ])

        const formatDate = (isoString?: string) => {
            if (!isoString) return 'Fecha desconocida'
            return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
        }

        const communityKnowledge = docsRes.data?.map(d => `[Documento: ${d.title}] (Actualizado el: ${formatDate(d.created_at)})\nContenido: ${d.body}`).join('\n\n') || ''
        const spacesKnowledge = spacesRes.data?.map(s => `[Espacio: ${s.name}] (Configurado el: ${formatDate(s.created_at)})\nHorario: ${s.opening_time} a ${s.closing_time}\nReglas: ${s.rules || 'Ninguna'}`).join('\n\n') || ''

        // 2. Build system context
        const systemMessage = `Eres el "Secretario IA" de la comunidad "${profile?.communities?.name || 'Comunidad'}". 
Tu objetivo es responder y ayudar a los vecinos con dudas sobre la comunidad basándote EXCLUSIVAMENTE en el siguiente conocimiento configurado por el administrador:

-- CONOCIMIENTO DEL ADMINISTRADOR --
${communityKnowledge}

${spacesKnowledge}
----------------------------------

REGLAS ESTRICTAS:
1. Si la respuesta no está en el bloque de conocimiento o no lo sabes, indica que no tienes esa información y que el vecino puede contactar al administrador.
2. TEN EN CUENTA LAS FECHAS DE ACTUALIZACIÓN: Si una información o norma tiene una fecha asignada en el bloque de conocimiento superior, indícaselo al vecino sutilmente (ej: "Según la normativa actualizada de Octubre de 2024...").
3. El usuario que te habla se llama ${profile?.full_name}. Sé profesional, servicial y educado.`

        // 3. Simple message history (could fetch from DB if sessionId provided)
        // For now, stateless for brevity but sessionId ready for extension

        console.log('Calling OpenRouter...')
        const response = await callOpenRouter([
            { role: 'system', content: systemMessage },
            { role: 'user', content: message }
        ], { temperature: 0.7, model: process.env.OPENROUTER_MODEL || 'openrouter/auto' })

        console.log('OpenRouter Response:', response)

        return NextResponse.json({ response })
    } catch (error: any) {
        console.error('API Error details:', error)
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
    }
}
