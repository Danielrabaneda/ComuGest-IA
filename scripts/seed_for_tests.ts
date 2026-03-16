
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('Seeding data for tests...')

    // 1. Ensure a community exists
    const { data: community, error: communityError } = await supabase
        .from('communities')
        .upsert({
            name: 'Comunidad de Prueba',
            address: 'Calle Falsa 123',
            code: 'TEST1234',
            plan: 'pro',
            subscription_status: 'trial'
        }, { onConflict: 'code' })
        .select()
        .single()

    if (communityError) {
        console.error('Error seeding community:', communityError)
        return
    }
    console.log('Community seeded:', community.id)

    // 2. Ensure test users have profiles and are in the community
    const testUserIds = [
        '63ef41a2-7be7-41de-b44b-0baf02d367f7',
        '95d4e1c1-5b4b-459f-96dd-8efbe15a9871',
        'bb6059e6-b7ac-4d0d-8799-5b30fa53df4a'
    ]

    for (const userId of testUserIds) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: 'Test User ' + userId.substring(0, 4),
                role: 'admin',
                community_id: community.id,
                email: userId === 'bb6059e6-b7ac-4d0d-8799-5b30fa53df4a' ? 'danidos@hotmail.com' : 'test@example.com'
            })
        
        if (profileError) {
            console.error(`Error seeding profile for ${userId}:`, profileError)
        } else {
            console.log(`Profile seeded/updated for ${userId}`)
        }
    }

    const userId = testUserIds[0]

    // 3. Seed an incident
    const { error: incidentError } = await supabase
        .from('incidents')
        .upsert({
            community_id: community.id,
            created_by: userId,
            title: 'Gotera en el portal',
            description: 'Hay una gotera persistente en la entrada principal.',
            category: 'cleaning',
            priority: 'medium',
            status: 'open'
        })
    if (incidentError) console.error('Error seeding incident:', incidentError)
    else console.log('Incident seeded.')

    // 4. Seed a notice
    const { error: noticeError } = await supabase
        .from('notices')
        .upsert({
            community_id: community.id,
            created_by: userId,
            title: 'Reunión de vecinos',
            body: 'La próxima reunión será el lunes a las 20:00.',
            short_body: 'Reunión lunes 20:00',
            type: 'meeting'
        })
    if (noticeError) console.error('Error seeding notice:', noticeError)
    else console.log('Notice seeded.')

    // 5. Seed Spaces
    const { error: spaceError } = await supabase
        .from('spaces')
        .upsert([
            {
                community_id: community.id,
                name: 'Piscina',
                description: 'Piscina comunitaria exterior.',
                opening_time: '10:00:00',
                closing_time: '20:00:00',
                reservation_duration: 120,
                max_capacity: 40
            },
            {
                community_id: community.id,
                name: 'Pista de Pádel',
                description: 'Reserva tu pista para jugar.',
                opening_time: '08:00:00',
                closing_time: '23:00:00',
                reservation_duration: 90,
                max_capacity: 4
            }
        ])
    if (spaceError) console.error('Error seeding spaces:', spaceError)
    else console.log('Spaces seeded.')
}

seed()
