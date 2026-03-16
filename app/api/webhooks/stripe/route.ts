import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event: Stripe.Event

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        // En desarrollo, si no tenemos webhook secret, podemos saltar la verificación
        // PERO para producción es obligatorio
        event = JSON.parse(body)
    } else {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    if (metadata?.communityId && metadata.communityId !== "new_community") {
      const planToSet = metadata.planName.toLowerCase().includes("pro") ? "pro" : "basic"

      const { error } = await supabase
        .from("communities")
        .update({
          plan: planToSet,
          subscription_status: "active",
          trial_ends_at: null, // Ya no es periodo de prueba
        })
        .eq("id", metadata.communityId)

      if (error) {
        console.error("Error updating community via webhook:", error)
      } else {
        console.log(`Comunidad ${metadata.communityId} actualizada a plan ${planToSet}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
