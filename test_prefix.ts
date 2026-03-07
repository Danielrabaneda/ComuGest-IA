import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Try with 'publishable' instead of 'publicable'
const url = "https://jcuawejqnjbncaczxmtt.supabase.co"
const key = "sb_publishable_GhoGUVP9qmeGGKbgYvbaNg_nmpBuIkT"

const supabase = createClient(url, key)

async function run() {
    const { data, error } = await supabase.from('communities').select('*').limit(1)
    if (error) {
        console.error("Test with 'publishable' failed:", error.message)
    } else {
        console.log("Test with 'publishable' SUCCESS!", data)
    }
}
run()
