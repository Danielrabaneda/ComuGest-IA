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

        const { title, description } = await req.json()

        if (!title) {
            return NextResponse.json({ error: 'Título requerido' }, { status: 400 })
        }

        const prompt = AI_PROMPTS.CLASSIFY_INCIDENT(title, description || '')
        const response = await callOpenRouter([
            { role: 'system', content: 'Actúa como un procesador de datos JSON puro. Devuelve sólo JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.1, model: process.env.OPENROUTER_MODEL || 'openrouter/auto' })

        // OpenRouter sometimes returns text around JSON, attempt to extract
        let jsonMatch = response.match(/\{[\s\S]*\}/)
        let aiData = { category: 'other', priority: 'medium', ai_summary: '' }

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
