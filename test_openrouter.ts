import { callOpenRouter } from './lib/openrouter/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function test() {
    console.log("Testing OpenRouter...")
    try {
        const response = await callOpenRouter([
            { role: 'user', content: 'Hola, di test' }
        ])
        console.log("Response:", response)
    } catch (error) {
        console.error("Test failed:", error)
    }
}

test()
