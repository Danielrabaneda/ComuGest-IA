import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY
    console.log("Using API Key starting with:", apiKey?.substring(0, 10))

    if (!apiKey || apiKey === 'sk-or-v1-...') {
        console.error("ERROR: OPENROUTER_API_KEY is not configured correctly in .env.local")
        return
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: 'Say hello' }],
            }),
        })

        const data: any = await response.json()
        if (response.ok) {
            console.log("SUCCESS! Response:", data.choices[0].message.content)
        } else {
            console.error("API ERROR:", data)
        }
    } catch (err) {
        console.error("FETCH ERROR:", err)
    }
}

testOpenRouter()
