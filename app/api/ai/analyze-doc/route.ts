import { NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { docTitle, docContent, communityName } = await req.json()

        if (!docContent) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })

        const prompt = `Eres el asistente del administrador de la comunidad "${communityName}".
Acaba de subir este documento a la base de conocimiento:

TÍTULO: ${docTitle}
CONTENIDO:
${docContent.slice(0, 4000)}

Analiza si el contenido contiene información relevante para los vecinos que merezca ser comunicada como aviso oficial (nuevas normas, cambios de horario, obras, reuniones, recordatorios importantes, etc.).

Responde EXCLUSIVAMENTE en formato JSON con esta estructura:
{
  "should_notify": true/false,
  "reason": "breve explicación de por qué sí o no",
  "notice": {
    "title": "título del aviso (máx 80 caracteres)",
    "body": "cuerpo del aviso redactado de forma clara y amable para los vecinos (máx 500 caracteres)",
    "type": "general|meeting|maintenance|cleaning|works"
  }
}

Si "should_notify" es false, el objeto "notice" puede ser null.`

        const response = await callOpenRouter([
            { role: 'user', content: prompt }
        ], { temperature: 0.3, model: process.env.OPENROUTER_MODEL || 'openrouter/auto' })

        // Extraer JSON de la respuesta
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ should_notify: false, reason: 'No se pudo analizar el documento' })
        }

        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json(result)

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error analyzing doc:', message)
        return NextResponse.json({ should_notify: false, reason: 'Error al analizar' })
    }
}
