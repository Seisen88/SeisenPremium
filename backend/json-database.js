const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class JsonDatabase {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase Client initialized for JsonDatabase');
    }

    // Payment Methods
    async transactionExists(transactionId) {
        const { data, error } = await this.supabase
            .from('payments')
            .select('transaction_id')
            .eq('transaction_id', transactionId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means not found
            console.error('Error checking transaction:', error);
        }
        return !!data;
    }
    
    async savePayment(paymentData) {
        const { data, error } = await this.supabase
            .from('payments')
            .insert([{
                transaction_id: paymentData.transactionId,
                payer_email: paymentData.payerEmail,
                payer_id: paymentData.payerId || null,
                roblox_username: paymentData.robloxUsername || null,
                roblox_uaid: paymentData.robloxUaid || null,
                tier: paymentData.tier,
                amount: paymentData.amount,
                currency: paymentData.currency,
                payment_status: paymentData.status,
                generated_keys: paymentData.keys ? JSON.stringify(paymentData.keys) : null,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error saving payment to Supabase:', error);
            throw error;
        }
        return data[0].id;
    }
    
    async updatePaymentKeys(transactionId, keys) {
        const { error } = await this.supabase
            .from('payments')
            .update({ 
                generated_keys: JSON.stringify(keys),
                updated_at: new Date().toISOString()
            })
            .eq('transaction_id', transactionId);

        if (error) {
            console.error('Error updating payment keys:', error);
        }
    }

    async updateRobloxPurchase(transactionId, uaid) {
        const { error } = await this.supabase
            .from('payments')
            .update({ 
                roblox_uaid: uaid,
                created_at: new Date().toISOString(), // Reset creation time for renewal
                updated_at: new Date().toISOString()
            })
            .eq('transaction_id', transactionId);

        if (error) {
            console.error('Error updating roblox purchase:', error);
            return false;
        }
        return true;
    }
    
    async getPayment(transactionId) {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching payment:', error);
        }
        return data;
    }
    
    async getUserPayments(email) {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('payer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user payments:', error);
            return [];
        }
        return data;
    }
    
    async getAllPayments() {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all payments:', error);
            return [];
        }
        return data;
    }

    // Visitor tracking methods
    async getVisitorStats() {
        const { data, error } = await this.supabase
            .from('visitors')
            .select('*');

        if (error) {
            console.error('Error fetching visitor stats:', error);
            return { totalVisits: 0, uniqueVisitors: 0 };
        }

        const totalVisits = data.reduce((sum, v) => sum + v.visit_count, 0);
        return {
            totalVisits,
            uniqueVisitors: data.length,
            lastUpdated: new Date().toISOString()
        };
    }

    async recordVisit(ipAddress, userAgent) {
        // Find existing visitor
        const { data: existing, error: fetchError } = await this.supabase
            .from('visitors')
            .select('*')
            .eq('ip', ipAddress)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching visitor:', fetchError);
        }

        if (existing) {
            // Update existing
            await this.supabase
                .from('visitors')
                .update({
                    last_visit: new Date().toISOString(),
                    visit_count: existing.visit_count + 1,
                    user_agent: userAgent
                })
                .eq('ip', ipAddress);
        } else {
            // Insert new
            await this.supabase
                .from('visitors')
                .insert([{
                    ip: ipAddress,
                    user_agent: userAgent,
                    visit_count: 1
                }]);
        }
        
        return await this.getVisitorStats();
    }
}

module.exports = JsonDatabase;
