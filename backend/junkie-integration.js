// Junkie Development Key System Integration
// Handles webhook calls to Junkie's API for automatic key generation

const axios = require('axios');
const crypto = require('crypto');

class JunkieKeySystem {
    constructor(config) {
        // Support both single webhook (legacy) and tier-specific webhooks
        this.webhookUrl = config.webhookUrl; // Legacy single webhook
        this.webhookUrls = {
            weekly: config.webhookUrlWeekly || config.webhookUrl,
            monthly: config.webhookUrlMonthly || config.webhookUrl,
            lifetime: config.webhookUrlLifetime || config.webhookUrl
        };
        this.hmacSecret = config.hmacSecret;
        this.provider = config.provider || 'seisenhub';
        this.defaultService = config.defaultService || 'Premium Key';
    }

    /**
     * Generate HMAC signature for webhook security
     * @param {Object} payload - The webhook payload
     * @returns {string} - HMAC signature
     */
    generateHMAC(payload) {
        if (!this.hmacSecret) {
            return null;
        }

        const payloadString = JSON.stringify(payload);
        return crypto
            .createHmac('sha256', this.hmacSecret)
            .update(payloadString)
            .digest('hex');
    }

    /**
     * Trigger Junkie webhook to generate premium key
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} - Generated key data
     */
    async generateKey(options) {
        const {
            tier = 'weekly',
            validity = 168, // hours
            quantity = 1,
            userInfo = {},
            paymentInfo = {}
        } = options;

        // Construct webhook payload based on Junkie's expected format
        const payload = {
            item: {
                product: {
                    name: 'Premium Key' // This triggers the webhook condition
                },
                quantity: quantity
            },
            user: {
                email: userInfo.email || '',
                payerId: userInfo.payerId || '',
                robloxUsername: userInfo.robloxUsername || userInfo.custom || ''
            },
            payment: {
                tier: tier,
                amount: paymentInfo.amount || 0,
                currency: paymentInfo.currency || 'EUR',
                transactionId: paymentInfo.transactionId || '',
                timestamp: new Date().toISOString()
            },
            metadata: {
                provider: this.provider,
                service: this.defaultService,
                validity: validity,
                source: 'paypal_webhook'
            }
        };

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add HMAC signature if secret is configured
            if (this.hmacSecret) {
                headers['X-Webhook-Signature'] = this.generateHMAC(payload);
            }

            // Select webhook URL based on tier
            const webhookUrl = this.webhookUrls[tier] || this.webhookUrl;
            
            console.log('Calling Junkie webhook for tier:', tier);
            console.log('Webhook URL:', webhookUrl);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await axios.post(webhookUrl, payload, {
                headers,
                timeout: 30000
            });

            console.log('Junkie webhook response:', response.data);

            // Parse keys - Junkie might return a string or an array
            let keys = [];
            if (typeof response.data === 'string') {
                // Single key returned as string
                keys = [response.data];
            } else if (response.data.keys && Array.isArray(response.data.keys)) {
                // Keys in array format
                keys = response.data.keys;
            } else if (response.data.key) {
                // Single key in 'key' field
                keys = [response.data.key];
            } else if (Array.isArray(response.data)) {
                // Response is an array of keys
                keys = response.data;
            }

            return {
                success: true,
                keys: keys,
                webhookResponse: response.data
            };

        } catch (error) {
            console.error('Junkie webhook error:', error.response?.data || error.message);
            
            return {
                success: false,
                error: error.response?.data || error.message,
                details: error.response?.status || 'Unknown error'
            };
        }
    }

    /**
     * Get service name based on tier
     * @param {string} tier - Payment tier (weekly, monthly, lifetime)
     * @returns {string} - Service name
     */
    getServiceForTier(tier) {
        const services = {
            'weekly': 'Premium Key - Weekly',
            'monthly': 'Premium Key - Monthly',
            'lifetime': 'Premium Key - Lifetime'
        };

        return services[tier] || this.defaultService;
    }

    /**
     * Get validity hours based on tier
     * @param {string} tier - Payment tier
     * @returns {number} - Validity in hours (0 = unlimited)
     */
    getValidityForTier(tier) {
        const validities = {
            'weekly': 168,    // 7 days
            'monthly': 720,   // 30 days
            'lifetime': 0     // unlimited
        };

        return validities[tier] || 168;
    }
}

module.exports = JunkieKeySystem;
