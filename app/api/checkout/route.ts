import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any,
  })

  try {
    const { planName, communityName, email, communityId } = await req.json()

    let unitAmount = 0
    const currency = "eur"

    const planLower = planName.toLowerCase()
    if (planLower.includes("básico")) {
      unitAmount = 700 // 7.00€
    } else if (planLower.includes("pro")) {
      unitAmount = 1200 // 12.00€
    } else if (planLower.includes("admin")) {
      unitAmount = 4900 // 49.00€
    } else {
      unitAmount = 1200 // Default to Pro
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `ComuGest IA - ${planName}`,
              description: `Gestión para la comunidad: ${communityName}`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/hire/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagar?plan=${encodeURIComponent(planName)}`,
      customer_email: email,
      metadata: {
        planName,
        communityName,
        email,
        communityId: communityId || "new_community",
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error("Stripe Error:", err)
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 })
  }
}
