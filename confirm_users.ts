import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
        console.error("List Error:", listError)
        return
    }

    for (const user of users) {
        if (!user.email_confirmed_at) {
            console.log(`Confirming user: ${user.email}`)
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            )
            if (updateError) console.error(`Error confirming ${user.email}:`, updateError)
            else console.log(`User ${user.email} confirmed!`)
        }
    }
}
run()
