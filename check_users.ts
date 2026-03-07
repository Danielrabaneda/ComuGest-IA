import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    users.forEach(u => console.log(`Email: ${u.email}, ID: ${u.id}`))
    if (error) console.error("Error:", error)
}
run()
