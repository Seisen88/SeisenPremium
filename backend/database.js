const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseDB {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase Client initialized for SupabaseDB');
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
        // 1. Save Payment
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
                generated_keys: paymentData.keys ? JSON.stringify(paymentData.keys) : null, // Legacy support
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error saving payment to Supabase:', error);
            throw error;
        }

        // 2. Save Keys to new table
        if (paymentData.keys && paymentData.keys.length > 0) {
            await this.saveKeys(paymentData.transactionId, paymentData.keys);
        }

        return data[0].id;
    }

    async saveKeys(transactionId, keys) {
        const rows = keys.map(key => ({
            transaction_id: transactionId,
            key_value: key,
            status: 'active'
        }));

        const { error } = await this.supabase
            .from('license_keys')
            .insert(rows);

        if (error) {
            console.error('Error saving keys to license_keys table:', error);
        } else {
            console.log(`Saved ${keys.length} keys to license_keys table`);
        }
    }
    
    async updatePaymentKeys(transactionId, keys) {
        // 1. Update legacy column
        const { error } = await this.supabase
            .from('payments')
            .update({ 
                generated_keys: JSON.stringify(keys),
                updated_at: new Date().toISOString()
            })
            .eq('transaction_id', transactionId);

        if (error) {
            console.error('Error updating payment keys legacy column:', error);
        }

        // 2. Insert into new table
        await this.saveKeys(transactionId, keys);
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
        // Fetch payment and join keys
        const { data: payment, error } = await this.supabase
            .from('payments')
            .select('*, license_keys(key_value)')
            .eq('transaction_id', transactionId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching payment:', error);
        }

        if (payment) {
            // Normalize keys from relation
            if (payment.license_keys && payment.license_keys.length > 0) {
                payment.generated_keys = payment.license_keys.map(k => k.key_value);
            } else if (typeof payment.generated_keys === 'string') {
                // Fallback to parsing legacy JSON
                try {
                    payment.generated_keys = JSON.parse(payment.generated_keys);
                } catch (e) {
                    payment.generated_keys = [payment.generated_keys];
                }
            }
        }
        return payment;
    }
    
    async getUserPayments(email) {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*, license_keys(key_value)')
            .eq('payer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user payments:', error);
            return [];
        }

        return data.map(payment => {
            // Normalize keys
            if (payment.license_keys && payment.license_keys.length > 0) {
                payment.generated_keys = payment.license_keys.map(k => k.key_value);
            } else if (typeof payment.generated_keys === 'string') {
                 try {
                    payment.generated_keys = JSON.parse(payment.generated_keys);
                } catch (e) {
                    payment.generated_keys = [payment.generated_keys];
                }
            }
            return payment;
        });
    }
    
    async getAllPayments() {
        // Join with license_keys
        const { data, error } = await this.supabase
            .from('payments')
            .select('*, license_keys(key_value)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all payments:', error);
            return [];
        }

        // Normalize data structure for frontend
        return data.map(payment => {
            // Prefer keys from new table
            if (payment.license_keys && payment.license_keys.length > 0) {
                payment.generated_keys = payment.license_keys.map(k => k.key_value);
            } else {
                // Fallback to legacy column
                 if (typeof payment.generated_keys === 'string') {
                    try {
                        payment.generated_keys = JSON.parse(payment.generated_keys);
                    } catch (e) {
                        payment.generated_keys = [payment.generated_keys];
                    }
                } else if (!Array.isArray(payment.generated_keys)) {
                    payment.generated_keys = [];
                }
            }
            return payment;
        });
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

module.exports = SupabaseDB;
