import { ChatMessage } from '@/types'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function callGroq(
    messages: ChatMessage[],
    options: {
        model?: string
        temperature?: number
        max_tokens?: number
        stream?: boolean
    } = {}
) {
    const apiKey = process.env.GROQ_API_KEY
    const defaultModel = 'llama-3.3-70b-versatile'

    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not defined in environment variables.')
    }

    console.log('Groq Fallback Request Body:', JSON.stringify({
        model: defaultModel,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
    }, null, 2))

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: defaultModel,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens,
        }),
    })

    console.log('Groq Response Status:', response.status, response.statusText)

    if (!response.ok) {
        let errorData
        try {
            errorData = await response.json()
        } catch {
            errorData = { error: { message: 'Unknown error' } }
        }
        console.error('Groq error details:', errorData)
        throw new Error(errorData?.error?.message || `Groq API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content as string
}

export async function callOpenRouter(
    messages: ChatMessage[],
    options: {
        model?: string
        temperature?: number
        max_tokens?: number
        stream?: boolean
    } = {}
) {
    const apiKey = process.env.OPENROUTER_API_KEY
    const defaultModel = process.env.OPENROUTER_MODEL || 'openrouter/auto'

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not defined in environment variables.')
    }

    try {
        console.log('OpenRouter Request Body:', JSON.stringify({
            model: options.model || defaultModel,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens,
        }, null, 2))

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'ComuGest IA',
            },
            body: JSON.stringify({
                model: options.model || defaultModel,
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens,
            }),
        })

        console.log('OpenRouter Response Status:', response.status, response.statusText)

        if (!response.ok) {
            let errorData
            try {
                errorData = await response.json()
            } catch {
                errorData = { error: { message: 'Unknown error' } }
            }
            console.error('OpenRouter error details:', errorData)
            throw new Error(errorData?.error?.message || `OpenRouter API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.choices[0].message.content as string
    } catch (error) {
        console.error('Error calling OpenRouter. Falling back to Groq...', error)
        try {
            return await callGroq(messages, options)
        } catch (groqError) {
            console.error('Error calling Groq fallback:', groqError)
            throw groqError
        }
    }
}

/**
 * Common prompts for specific business tasks
 */
export const AI_PROMPTS = {
    CLASSIFY_INCIDENT: (title: string, description: string) => `
    Eres un asistente experto en gestión de comunidades de vecinos.
    Analiza la siguiente incidencia y devuelve UNICAMENTE un objeto JSON con:
    - category: 'elevator' | 'garage' | 'cleaning' | 'noise' | 'other'
    - priority: 'low' | 'medium' | 'high'
    - ai_summary: un resumen de máximo 100 caracteres.

    Incidencia:
    Título: ${title}
    Descripción: ${description}
  `,
    GENERATE_NOTICE: (draft: string) => `
    Eres el secretario IA de una comunidad de vecinos.
    Toma este borrador y devuelve UNICAMENTE un objeto JSON con:
    - title: Un título corto y descriptivo para el comunicado.
    - formal_body: El texto formal, profesional y claro para el comunicado.
    - short_body: Una versión muy corta e impactante para WhatsApp o SMS.

    Borrador:
    ${draft}
  `,
    SUMMARIZE_DOC: (text: string) => `
    Eres experto en actas de comunidades. 
    Resume el siguiente texto en 5 puntos clave (bullets). Devuelve solo los puntos.

    Texto:
    ${text}
  `,
}
