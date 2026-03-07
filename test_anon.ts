import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function run() {
    // Try to reach the REST API with the anon key
    const { data, error } = await supabase.from('communities').select('*').limit(1)
    if (error) {
        console.error("Rest Error:", error.message)
    } else {
        console.log("Rest Success:", data)
    }
}
run()
