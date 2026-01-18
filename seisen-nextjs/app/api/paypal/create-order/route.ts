import { NextRequest, NextResponse } from 'next/server';
import { PayPalSDK } from '@/lib/server/paypal';
import { VatCalculator } from '@/lib/server/vat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier } = body;

    // Pricing (Server-side validation)
    const pricing: Record<string, number> = {
        weekly: 3,
        monthly: 5,
        lifetime: 10
    };

    if (!tier || !pricing[tier]) {
         return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const baseAmount = pricing[tier];

    const paypal = new PayPalSDK({
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        sandboxMode: process.env.PAYPAL_SANDBOX === 'true'
    });

    // Default URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/premium`;
    const cancelUrl = `${frontendUrl}/premium?canceled=true`;
    
    const orderData = {
        amount: baseAmount,
        currency: 'EUR',
        description: 'Seisen Hub Premium Key',
        tier,
        returnUrl,
        cancelUrl
    };

    const order = await paypal.createOrder(orderData);
    return NextResponse.json(order);

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json(
        { error: error.message || 'Failed to create order' }, 
        { status: 500 }
    );
  }
}
