import { NextResponse } from 'next/server'
import { callOpenRouter, AI_PROMPTS } from '@/lib/openrouter/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { draft } = await req.json()

        if (!draft) {
            return NextResponse.json({ error: 'Borrador requerido' }, { status: 400 })
        }

        const prompt = AI_PROMPTS.GENERATE_NOTICE(draft)
        const response = await callOpenRouter([
            { role: 'system', content: 'Actúa como un procesador de datos JSON puro. Devuelve sólo JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.7, model: process.env.OPENROUTER_MODEL || 'openrouter/auto' })

        let jsonMatch = response.match(/\{[\s\S]*\}/)
        let aiData = { title: '', formal_body: '', short_body: '' }

        if (jsonMatch) {
            try {
                aiData = JSON.parse(jsonMatch[0])
            } catch (err) {
                console.error('Error parsing AI response:', response)
            }
        }

        return NextResponse.json(aiData)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
    }
}
