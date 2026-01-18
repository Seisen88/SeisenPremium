import { NextRequest, NextResponse } from 'next/server';
import { TicketDatabase } from '@/lib/server/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: ticketId } = await params;
        const db = new TicketDatabase();
        
        const ticket = await db.getTicket(ticketId);
        
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const replies = await db.getReplies(ticketId);

        return NextResponse.json({ success: true, ticket, replies });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
