import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error("Error:", error)
        return
    }

    data.users.forEach(u => {
        console.log(`User: ${u.email} | Confirmed: ${u.email_confirmed_at} | Created: ${u.created_at}`)
    })
}
run()
