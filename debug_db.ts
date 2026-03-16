
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const { data: profilesData } = await supabase.from('profiles').select('*')
    const { data: communitiesData } = await supabase.from('communities').select('*')

    console.log('--- USERS ---')
    usersData?.users.forEach(u => console.log(`${u.email} | ${u.id}`))
    console.log('--- PROFILES ---')
    profilesData?.forEach(p => console.log(`${p.email || 'no-email'} | ${p.id} | Community: ${p.community_id}`))
    console.log('--- COMMUNITIES ---')
    communitiesData?.forEach(c => console.log(`${c.name} | ${c.code} | ${c.id}`))
}
run()
