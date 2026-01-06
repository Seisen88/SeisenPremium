// Roblox Purchase Integration for Website
// Checks if a user owns a Roblox product and generates Junkie keys

const axios = require('axios');
const crypto = require('crypto');

class RobloxIntegration {
    constructor(config) {
        this.products = {
            lifetime: 16906166414, // Perm
            monthly: 16902308978,  // Monthly
            weekly: 16902313522    // Weekly
        };
        this.robloxApiUrl = 'https://inventory.roblox.com/v1/users';
        console.log('✅ Roblox Integration initialized with products:', this.products);
    }

    /**
     * Get Roblox User ID from username
     * @param {string} username - Roblox username
     * @returns {Promise<number>} - User ID
     */
    async getUserIdFromUsername(username) {
        try {
            const response = await axios.post(
                'https://users.roblox.com/v1/usernames/users',
                {
                    usernames: [username],
                    excludeBannedUsers: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.data && response.data.data.length > 0) {
                return response.data.data[0].id;
            }

            throw new Error('User not found');
        } catch (error) {
            console.error('Error getting user ID:', error.response?.data || error.message);
            throw new Error('Failed to find Roblox user');
        }
    }

    /**
     * Check if user owns the product (checks Asset and GamePass)
     * @param {number} userId - Roblox user ID
     * @param {number} productId - Product ID to check
     * @returns {Promise<boolean>} - Whether user owns the product
     */
    async userOwnsProduct(userId, productId) {
        try {
            console.log(`🔍 Checking ownership for User: ${userId}, Product: ${productId}`);

            // 1. Try checking as an ASSET (Catalog item)
            // We use the inventory endpoint to get the UserAssetId (UAID) which is unique per purchase
            try {
                const assetResponse = await axios.get(
                    `${this.robloxApiUrl}/${userId}/items/Asset/${productId}`,
                    { headers: { 'Accept': 'application/json' } }
                );
                
                if (assetResponse.data && assetResponse.data.data && assetResponse.data.data.length > 0) {
                    const item = assetResponse.data.data[0];
                    console.log(`✅ Found ownership via Asset endpoint for product ${productId}. UAID: ${item.instanceId}`);
                    return { owned: true, uaid: item.instanceId, created: item.created };
                }
            } catch (err) {
                // Ignore errors, try next method
                // console.log('Asset check failed:', err.message);
            }

            // 2. Try checking as a GAMEPASS
            try {
                const gamePassResponse = await axios.get(
                    `${this.robloxApiUrl}/${userId}/items/GamePass/${productId}`,
                    { headers: { 'Accept': 'application/json' } }
                );
                
                if (gamePassResponse.data && gamePassResponse.data.data && gamePassResponse.data.data.length > 0) {
                     const item = gamePassResponse.data.data[0];
                    console.log(`✅ Found ownership via GamePass endpoint for product ${productId}. UAID: ${item.instanceId}`);
                    // GamePasses might typically reuse IDs or behave differently, but for deletion/rebuy flow, 
                    // the instanceId should strictly change or ideally we rely on Asset flow for this logic.
                    // Note: GamePass instances might not change ID as reliably as Assets on re-purchase without deletion.
                    // But deleting a GamePass is harder. Assuming Asset workflow primarily.
                    return { owned: true, uaid: item.instanceId, created: item.created };
                }
            } catch (err) {
                // console.log('GamePass check failed:', err.message);
            }

            return { owned: false, uaid: null };

        } catch (error) {
            // console.error('Error checking ownership:', error.response?.data || error.message);
            if (error.response?.status === 403) {
                throw new Error('Your inventory is private. Please make it public to verify.');
            }
            return { owned: false, uaid: null };
        }
    }

    /**
     * Verify purchase and get user info
     * Checks tiers in priority: Lifetime -> Monthly -> Weekly
     * @param {string} username - Roblox username
     * @param {string} targetTier - Optional: Specific tier to verify (strict mode)
     * @returns {Promise<Object>} - Purchase verification result
     */
    async verifyPurchase(username, targetTier = null) {
        try {
            // Get user ID from username
            const userId = await this.getUserIdFromUsername(username);
            console.log(`👤 Verifying purchase for ${username} (${userId}). Target: ${targetTier || 'Any'}`);

            // If a specific tier is requested, check ONLY that one (Strict Mode)
            if (targetTier && this.products[targetTier]) {
                const productId = this.products[targetTier];
                console.log(`🔒 STRICT MODE: Checking only ${targetTier} tier (ID: ${productId})...`);
                
                const result = await this.userOwnsProduct(userId, productId);
                
                if (result.owned) {
                    console.log(`🎉 User owns ${targetTier} tier! UAID: ${result.uaid}`);
                    return {
                        success: true,
                        userId,
                        username,
                        productId: productId,
                        tier: targetTier,
                        uaid: result.uaid
                    };
                } else {
                    console.log(`❌ User does not own ${targetTier} tier.`);
                    return {
                        success: false,
                        error: `User does not own the ${targetTier} product`,
                        userId,
                        username
                    };
                }
            }

            // Fallback: Check tiers in order of priority (Best Tier Mode)
            const tiers = ['lifetime', 'monthly', 'weekly'];
            
            for (const tier of tiers) {
                const productId = this.products[tier];
                console.log(`Checking ${tier} tier (ID: ${productId})...`);
                
                const result = await this.userOwnsProduct(userId, productId);
                
                if (result.owned) {
                    console.log(`🎉 User owns ${tier} tier! UAID: ${result.uaid}`);
                    return {
                        success: true,
                        userId,
                        username,
                        productId: productId,
                        tier: tier,
                        uaid: result.uaid
                    };
                }
            }

            console.log('❌ User does not own any product');
            return {
                success: false,
                error: 'User does not own any product',
                userId,
                username
            };
        } catch (error) {
            console.error('❌ Detailed Verification Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            return {
                success: false,
                error: `Verification failed: ${error.message}`
            };
        }
    }

    /**
     * Generate transaction ID for Roblox purchase
     * @param {number} userId - Roblox user ID
     * @param {number} productId - Product ID
     * @returns {string} - Unique transaction ID
     */
    generateTransactionId(userId, productId) {
        const timestamp = Date.now();
        const hash = crypto
            .createHash('sha256')
            .update(`${userId}-${productId}-${timestamp}`)
            .digest('hex')
            .substring(0, 16);
        
        return `ROBLOX-${userId}-${productId}`; // Simplified ID to detect same product ownership easier
    }

    /**
     * Get tier based on product ID
     * @param {number} productId - Product ID
     * @returns {string} - Tier (weekly, monthly, lifetime)
     */
    getTierForProduct(productId) {
        // Reverse lookup
        for (const [key, value] of Object.entries(this.products)) {
            if (value === parseInt(productId)) {
                return key;
            }
        }
        return 'lifetime'; // Fallback
    }
}

module.exports = RobloxIntegration;
