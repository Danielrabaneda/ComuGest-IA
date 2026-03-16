import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function autoConfirm() {
  const { data: users, error } = await supabase.auth.admin.listUsers()
  if (users?.users) {
    for (const u of users.users) {
      if (!u.email_confirmed_at) {
        console.log('Confirming', u.email)
        await supabase.auth.admin.updateUserById(u.id, { email_confirm: true })
      }
    }
  }
}

autoConfirm()
