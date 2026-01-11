const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class TicketDatabase {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase Client initialized for TicketDatabase');
    }

    generateTicketNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6);
        return `TKT-${timestamp}-${random}`.toUpperCase();
    }

    async createTicket(ticketData) {
        const ticketNumber = this.generateTicketNumber();
        const { data, error } = await this.supabase
            .from('tickets')
            .insert([{
                ticket_number: ticketNumber,
                user_name: ticketData.userName,
                user_email: ticketData.userEmail,
                category: ticketData.category,
                subject: ticketData.subject,
                description: ticketData.description,
                status: 'open',
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error creating ticket in Supabase:', error);
            throw error;
        }
        return { id: data[0].id, ticketNumber };
    }

    async getTicket(ticketNumber) {
        const cleanNumber = ticketNumber ? ticketNumber.trim() : '';
        const { data, error } = await this.supabase
            .from('tickets')
            .select('*')
            .eq('ticket_number', cleanNumber)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching ticket:', error);
        }
        return data;
    }

    async getAllTickets() {
        const { data, error } = await this.supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all tickets:', error);
            return [];
        }
        return data;
    }

    async getTicketsByEmail(email) {
        const { data, error } = await this.supabase
            .from('tickets')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets by email:', error);
            return [];
        }
        return data;
    }

    async addReply(ticketId, replyData) {
        // First, check if ticketId is actually a ticket_number or internal ID
        // The original code used parseInt(ticketId), implying internal ID.
        // However, ticket_replies.ticket_id in SQL is TEXT (ticket_number).
        // Let's ensure we use the ticket_number for the foreign key.
        
        let ticketNumber = ticketId;
        if (!isNaN(ticketId)) {
            // If it's a numeric ID, we should find the ticket_number first
            const { data: ticket } = await this.supabase
                .from('tickets')
                .select('ticket_number')
                .eq('id', ticketId)
                .single();
            if (ticket) ticketNumber = ticket.ticket_number;
        }

        const { data, error } = await this.supabase
            .from('ticket_replies')
            .insert([{
                ticket_id: ticketNumber,
                author_type: replyData.authorType,
                author_name: replyData.authorName,
                message: replyData.message
            }])
            .select();

        if (error) {
            console.error('Error adding reply to Supabase:', error);
            throw error;
        }

        // Update ticket's updated_at
        await this.supabase
            .from('tickets')
            .update({ updated_at: new Date().toISOString() })
            .eq('ticket_number', ticketNumber);

        return data[0].id;
    }

    async getReplies(ticketNumber) {
        const { data, error } = await this.supabase
            .from('ticket_replies')
            .select('*')
            .eq('ticket_id', ticketNumber)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
        return data;
    }

    async updateStatus(ticketId, status) {
        const query = isNaN(ticketId) 
            ? this.supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('ticket_number', ticketId)
            : this.supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
            
        const { error } = await query;

        if (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
    }

    close() {
        console.log('✅ Ticket database (Supabase) connection closed');
    }
}

module.exports = TicketDatabase;
