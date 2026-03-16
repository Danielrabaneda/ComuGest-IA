import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers()
  console.log('Users:', users?.users.length)
  if (users?.users.length) {
    const lastUser = users.users[users.users.length - 1]
    console.log('Last User:', lastUser.email, lastUser.id)
    
    // check profile
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', lastUser.id).single()
    console.log('Profile:', profile, error)
  }
}

check()
