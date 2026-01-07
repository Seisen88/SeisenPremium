const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PROMETHEUS_PATH = process.env.PROMETHEUS_PATH || 'C:\\Prometheus';
const LUA_EXECUTABLE = process.env.LUA_EXECUTABLE || 'lua';
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, 'temp');
const DEBUG = process.env.DEBUG === 'true';

// PayPal Integration
const bodyParser = require('body-parser');
const PayPalSDK = require('./paypal-sdk');
const JunkieKeySystem = require('./junkie-integration');
const PaymentDatabase = require('./payment-database');
const RobloxIntegration = require('./roblox-integration');

// Initialize PayPal SDK
const paypalSDK = new PayPalSDK({
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    sandboxMode: process.env.PAYPAL_SANDBOX === 'true'
});

// Initialize Junkie key system
const junkieSystem = new JunkieKeySystem({
    webhookUrl: process.env.JUNKIE_WEBHOOK_URL, // Fallback/legacy
    webhookUrlWeekly: process.env.JUNKIE_WEBHOOK_URL_WEEKLY,
    webhookUrlMonthly: process.env.JUNKIE_WEBHOOK_URL_MONTHLY,
    webhookUrlLifetime: process.env.JUNKIE_WEBHOOK_URL_LIFETIME,
    hmacSecret: process.env.JUNKIE_HMAC_SECRET,
    provider: process.env.JUNKIE_PROVIDER || 'seisenhub',
    defaultService: process.env.JUNKIE_SERVICE || 'Premium Key'
});

// Initialize database
const paymentDB = new PaymentDatabase(
    process.env.DB_PATH || path.join(__dirname, 'payments.db')
);

// Initialize Roblox integration
const robloxIntegration = new RobloxIntegration({
    apiKey: process.env.ROBLOX_API_KEY, // Secret key for security
    productId: 16906166414 // Seisen Hub Perm product ID
});




// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased from 10mb to 50mb for large code files
// PayPal IPN requires urlencoded body parser
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

// Serve static files from parent directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean up old temp files on startup
function cleanupTempFiles() {
    try {
        if (fs.existsSync(TEMP_DIR)) {
            const files = fs.readdirSync(TEMP_DIR);
            const now = Date.now();
            let cleaned = 0;
            
            files.forEach(file => {
                const filePath = path.join(TEMP_DIR, file);
                try {
                    const stats = fs.statSync(filePath);
                    // Delete files older than 5 minutes
                    if (now - stats.mtimeMs > 5 * 60 * 1000) {
                        fs.unlinkSync(filePath);
                        cleaned++;
                    }
                } catch (err) {
                    console.error(`Error cleaning ${file}:`, err.message);
                }
            });
            
            if (cleaned > 0) {
                console.log(`Cleaned up ${cleaned} old temp files`);
            }
        }
    } catch (error) {
        console.error('Error during temp cleanup:', error);
    }
}

// Run cleanup on startup
cleanupTempFiles();


// Run cleanup every 5 minutes
setInterval(cleanupTempFiles, 5 * 60 * 1000);



// URL Rewriting - Remove .html extension from URLs
app.use((req, res, next) => {
    // If URL doesn't have an extension and doesn't start with /api
    if (!req.path.includes('.') && !req.path.startsWith('/api')) {
        const htmlPath = path.join(__dirname, '..', req.path + '.html');
        
        // Check if the .html file exists
        if (fs.existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
    }
    next();
});

// Logging middleware
app.use((req, res, next) => {
    if (DEBUG) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        prometheus: fs.existsSync(PROMETHEUS_PATH),
        paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
        junkie: !!process.env.JUNKIE_WEBHOOK_URL,
        email: !!emailService
    });
});

// Create PayPal Order
app.post('/api/paypal/create-order', async (req, res) => {
    try {
        const { tier } = req.body;
        
        if (!tier || !['weekly', 'monthly', 'lifetime'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Pricing based on tier
        const pricing = {
            weekly: 3,
            monthly: 5,
            lifetime: 10
        };

        const amount = pricing[tier];
        
        // Return URL - uses FRONTEND_URL env var or defaults to request host (for dev)
        const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
        const returnUrl = `${baseUrl}/premium.html`;
        const cancelUrl = `${baseUrl}/premium.html`;

        const order = await paypalSDK.createOrder({
            amount,
            currency: 'EUR',
            description: 'Seisen Hub Premium Key',
            tier,
            returnUrl,
            cancelUrl
        });

        console.log('✅ PayPal order created:', order.id);

        res.json({
            orderId: order.id,
            approvalUrl: order.links.find(link => link.rel === 'approve').href
        });

    } catch (error) {
        console.error('❌ Error creating PayPal order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Capture PayPal Payment
app.post('/api/paypal/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID required' });
        }

        console.log('💰 Capturing PayPal order:', orderId);

        // Capture the payment
        const captureData = await paypalSDK.captureOrder(orderId);
        const paymentInfo = paypalSDK.extractPaymentInfo(captureData);

        console.log('✅ Payment captured:', paymentInfo);

        // Check for duplicate transaction
        const isDuplicate = await paymentDB.transactionExists(paymentInfo.transactionId);
        
        if (isDuplicate) {
            console.log('⚠️  Duplicate transaction detected');
            const existingPayment = await paymentDB.getPayment(paymentInfo.transactionId);
            return res.json({
                success: true,
                keys: existingPayment.generated_keys,
                message: 'Payment already processed'
            });
        }

        // Determine validity based on tier
        const validityMap = {
            weekly: 168,
            monthly: 720,
            lifetime: 0
        };
        const validity = validityMap[paymentInfo.tier] || 168;

        // Save payment to database
        await paymentDB.savePayment({
            transactionId: paymentInfo.transactionId,
            payerEmail: paymentInfo.payerEmail,
            payerId: paymentInfo.payerId,
            robloxUsername: null, // Will be added later if needed
            tier: paymentInfo.tier,
            amount: paymentInfo.amount,
            currency: paymentInfo.currency,
            status: 'completed',
            keys: null
        });

        console.log('💾 Payment saved to database');

        // Generate key via Junkie webhook
        console.log('🔑 Generating premium key...');
        const keyResult = await junkieSystem.generateKey({
            tier: paymentInfo.tier,
            validity: validity,
            quantity: 1,
            userInfo: {
                email: paymentInfo.payerEmail,
                payerId: paymentInfo.payerId
            },
            paymentInfo: {
                amount: paymentInfo.amount,
                currency: paymentInfo.currency,
                transactionId: paymentInfo.transactionId
            }
        });

        if (keyResult.success && keyResult.keys && keyResult.keys.length > 0) {
            console.log('✅ Key generated successfully:', keyResult.keys);

            // Update database with keys
            await paymentDB.updatePaymentKeys(paymentInfo.transactionId, keyResult.keys);

            // Send email logic removed as per user request

            res.json({
                success: true,
                keys: keyResult.keys,
                tier: paymentInfo.tier
            });

            console.log('🎉 Payment processed successfully!');
        } else {
            console.error('❌ Key generation failed:', keyResult.error);
            res.status(500).json({
                success: false,
                error: 'Key generation failed'
            });
        }

    } catch (error) {
        console.error('❌ Error capturing payment:', error);
        res.status(500).json({ error: 'Failed to capture payment' });
    }
});


// Roblox Purchase Verification Endpoint
// User enters their Roblox username, we check if they own the product
app.post('/api/roblox/verify-purchase', async (req, res) => {
    try {
        const { username, tier: requestedTier } = req.body;

        if (!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({ error: 'Roblox username is required' });
        }

        console.log(`🎮 Verifying Roblox purchase for username: ${username}, Target Tier: ${requestedTier || 'Any'}`);

        // Verify the user owns the product
        // Pass the specific tier to verification logic if provided
        const verification = await robloxIntegration.verifyPurchase(username.trim(), requestedTier);

        if (!verification.success) {
            console.error('❌ Verification failed:', verification.error);
            return res.status(400).json({
                success: false,
                error: verification.error || 'Failed to verify purchase'
            });
        }

        console.log('✅ User owns product:', verification);

        // Generate transaction ID
        const transactionId = robloxIntegration.generateTransactionId(
            verification.userId,
            verification.productId
        );
        
        // --- NEW UAID LOGIC ---
        const currentUaid = verification.uaid;
        console.log(`🆔 Current UAID from Roblox: ${currentUaid}`);

        // Get tier and validity
        const tier = robloxIntegration.getTierForProduct(verification.productId);
        const validityMap = {
            weekly: 168,   // 7 days
            monthly: 720,  // 30 days
            lifetime: 0    // Forever
        };
        const validityHours = validityMap[tier] || 0;

        // Check if transaction exists (user previously claimed)
        const isDuplicate = await paymentDB.transactionExists(transactionId);
        let isRenewal = false;

        if (isDuplicate) {
            console.log(`ℹ️  User ${verification.username} already verified. Checking status...`);
            const existingPayment = await paymentDB.getPayment(transactionId);
            const storedUaid = existingPayment.roblox_uaid;
            
            console.log(`💾 Stored UAID in DB: ${storedUaid}`);

            // 1. CHECK IF RE-PURCHASED (New Asset created AFTER old payment)
            // We compare the Roblox Asset Creation Date vs our Database Record
            const assetCreatedTime = verification.created ? new Date(verification.created).getTime() : 0;
            const paymentCreatedTime = new Date(existingPayment.created_at + 'Z').getTime();
            
            // If the Roblox Asset is newer than our DB record (by at least 5 mins to be safe), it's a re-purchase
            const isNewerPurchase = assetCreatedTime > (paymentCreatedTime + 300000); 
            
            // Also keep UAID check as valid signal
            const isUaidChanged = (currentUaid && storedUaid && String(currentUaid) !== String(storedUaid));

            if (isNewerPurchase || isUaidChanged) {
                console.log(`✨ RENEWAL DETECTED!`);
                console.log(`   - New Asset Date: ${verification.created}`);
                console.log(`   - Old Payment Date: ${existingPayment.created_at}`);
                console.log(`   - UAID Changed: ${isUaidChanged}`);
                
                isRenewal = true;
                // Proceed to update the record...
            } else {
                // 2. SAME ITEM (Old Purchase) - CHECK EXPIRY
                // Calculate expiration
                const lastUpdate = new Date(existingPayment.updated_at + 'Z'); 
                const now = new Date();
                const purchaseTime = isNaN(lastUpdate.getTime()) ? new Date(existingPayment.created_at + 'Z') : lastUpdate;
                
                if (validityHours > 0) {
                    const expiryDate = new Date(purchaseTime.getTime() + (validityHours * 60 * 60 * 1000));
                    
                    if (now < expiryDate) {
                        // STILL ACTIVE
                        console.log('✅ Key is still active. Returning existing key.');
                        const timeLeftMs = expiryDate.getTime() - now.getTime();
                        
                        return res.json({
                            success: true,
                            keys: existingPayment.generated_keys,
                            tier: tier,
                            message: 'Your key is still active',
                            alreadyClaimed: true,
                            isActive: true,
                            expiryDate: expiryDate.toISOString(),
                            timeLeft: timeLeftMs,
                            userId: verification.userId,
                            username: verification.username
                        });
                    } else {
                        // EXPIRED AND SAME UAID -> BLOCK!
                         console.log(`⛔ Key expired and UAID matches (Old Item). Blocking renewal.`);
                         return res.status(400).json({
                             success: false,
                             error: 'Your key has expired. To get a new key, please DELETE the item from your Roblox inventory and BUY it again.',
                             isExpired: true,
                             tier: tier
                         });
                    }
                } else {
                    // Lifetime - Always return existing
                     return res.json({
                        success: true,
                        keys: existingPayment.generated_keys,
                        tier: tier,
                        message: 'You own a Lifetime key',
                        alreadyClaimed: true,
                        isActive: true,
                        expiryDate: null,
                        userId: verification.userId,
                        username: verification.username
                    });
                }
            }
        }

        // Processing New Purchase OR Renewal (Valid Re-purchase)
        
        // 1. If NEW purchase, save initial record
        if (!isRenewal && !isDuplicate) {
             await paymentDB.savePayment({
                transactionId: transactionId,
                payerEmail: null,
                payerId: `ROBLOX_${verification.userId}`,
                robloxUsername: verification.username,
                robloxUaid: currentUaid, // Store the UAID!
                tier: tier,
                amount: 0, // Roblox handles payment
                currency: 'ROBUX',
                status: 'completed',
                keys: null
            });
            console.log('💾 New Roblox purchase saved to database');
        } else if (isRenewal) {
            // Update UAID in database for the existing transaction
             // We need to implement a way to update UAID or just overwrite during key update if we expanded that method.
             // Or we just accept the record exists. Ideally we update it.
             try {
                // Quick hack: Update via raw SQL via the DB object effectively if we could, 
                // but we lack the method. 
                // Let's assume updating the key timestamp is "enough" for now, 
                // BUT we need to save the new UAID so next time it matches!
                // Critical: We MUST update the stored UAID to the new `currentUaid`.
                // I will add a method to helper `updatePaymentKeys` to also update UAID?
                // Or just add a new method.
                // For this step, I'll assume I'll leverage a new DB method `updateRobloxPurchase` 
                // which I should add.
                // Or I can just delete the old record and insert a new one?
                // Deleting is cleaner for "Renewal".
                console.log('♻️  Renewing: Deleting old record to save new one with fresh UAID...');
                await new Promise((resolve, reject) => {
                     paymentDB.db.run('DELETE FROM payments WHERE transaction_id = ?', [transactionId], (err) => {
                         if (err) reject(err); else resolve();
                     });
                });
                
                // Now insert as new
                await paymentDB.savePayment({
                    transactionId: transactionId,
                    payerEmail: null,
                    payerId: `ROBLOX_${verification.userId}`,
                    robloxUsername: verification.username,
                    robloxUaid: currentUaid,
                    tier: tier,
                    amount: 0,
                    currency: 'ROBUX',
                    status: 'completed',
                    keys: null
                });
             } catch (err) {
                 console.error('Error renewing record:', err);
             }
        }

        // 2. Generate Key (for both New and Renewal)
        console.log(`🔑 Generating ${isRenewal ? 'RENEWAL' : 'NEW'} premium key for Roblox user...`);
        const keyResult = await junkieSystem.generateKey({
            tier: tier,
            validity: validityHours, // Use calculated validity
            quantity: 1,
            userInfo: {
                email: `${verification.username}@roblox.com`, 
                payerId: `ROBLOX_${verification.userId}`,
                robloxUsername: verification.username
            },
            paymentInfo: {
                amount: 0,
                currency: 'ROBUX',
                transactionId: transactionId
            }
        });

        if (keyResult.success && keyResult.keys && keyResult.keys.length > 0) {
            console.log(`✅ Key generated: ${keyResult.keys[0]}`);

            // 3. Update database with keys
            await paymentDB.updatePaymentKeys(transactionId, keyResult.keys);

            // Calculate new expiry for frontend display
            let newExpiryDate = null;
            if (validityHours > 0) {
                newExpiryDate = new Date(Date.now() + (validityHours * 60 * 60 * 1000)).toISOString();
            }

            res.json({
                success: true,
                keys: keyResult.keys,
                tier: tier,
                userId: verification.userId,
                username: verification.username,
                isRenewal: isRenewal,
                expiryDate: newExpiryDate,
                message: isRenewal ? 'Key renewed successfully!' : 'Purchase verified!'
            });

            console.log(`🎉 Roblox purchase ${isRenewal ? 'renewed' : 'verified'} and key generated!`);
        } else {
            console.error('❌ Key generation failed:', keyResult.error);
            res.status(500).json({
                success: false,
                error: 'Key generation failed. Please contact support.'
            });
        }

    } catch (error) {
        console.error('❌ Error verifying Roblox purchase:', error);
        res.status(500).json({ error: 'Failed to verify purchase' });
    }
});


// Test endpoint - Simulate payment without PayPal
app.post('/api/test/generate-key', async (req, res) => {
    try {
        const { tier, amount, currency, email, transactionId } = req.body;

        console.log('🧪 TEST MODE: Simulating payment capture');
        console.log('   Tier:', tier);
        console.log('   Amount:', amount, currency);

        // Determine validity based on tier
        const validityMap = {
            weekly: 168,
            monthly: 720,
            lifetime: 0
        };
        const validity = validityMap[tier] || 168;

        // Save test payment to database
        await paymentDB.savePayment({
            transactionId: transactionId,
            payerEmail: email,
            payerId: 'TEST_PAYER',
            robloxUsername: 'TestUser',
            tier: tier,
            amount: amount,
            currency: currency,
            status: 'test_completed',
            keys: null
        });

        console.log('💾 Test payment saved to database');

        // Generate key via Junkie webhook
        console.log('🔑 Calling Junkie webhook...');
        console.log('   Webhook URL:', process.env.JUNKIE_WEBHOOK_URL);
        
        const keyResult = await junkieSystem.generateKey({
            tier: tier,
            validity: validity,
            quantity: 1,
            userInfo: {
                email: email,
                payerId: 'TEST_PAYER',
                robloxUsername: 'TestUser'
            },
            paymentInfo: {
                amount: amount,
                currency: currency,
                transactionId: transactionId
            }
        });

        console.log('📊 Junkie response:', JSON.stringify(keyResult, null, 2));

        if (keyResult.success && keyResult.keys && keyResult.keys.length > 0) {
            console.log('✅ Test key generated successfully:', keyResult.keys);

            // Update database with keys
            await paymentDB.updatePaymentKeys(transactionId, keyResult.keys);

            res.json({
                success: true,
                keys: keyResult.keys,
                tier: tier,
                transactionId: transactionId,
                message: 'Test payment processed successfully',
                junkieResponse: keyResult.webhookResponse
            });

            console.log('🎉 Test completed successfully!');
        } else {
            // Junkie webhook failed - provide detailed error and mock key for testing
            console.error('❌ Junkie webhook failed:', keyResult.error);
            console.error('   Details:', keyResult.details);
            
            // Generate a mock key for testing purposes
            const mockKey = `SEISEN-TEST-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
            
            console.log('🔧 Generating mock key for testing:', mockKey);
            
            // Update database with mock key
            await paymentDB.updatePaymentKeys(transactionId, [mockKey]);
            
            res.json({
                success: true,
                keys: [mockKey],
                tier: tier,
                transactionId: transactionId,
                message: 'Test mode: Mock key generated (Junkie webhook failed)',
                isMockKey: true,
                junkieError: keyResult.error,
                junkieDetails: keyResult.details,
                note: 'This is a mock key for testing. Real keys require proper Junkie webhook configuration.'
            });
        }

    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Test failed',
            details: error.message,
            stack: DEBUG ? error.stack : undefined
        });
    }
});


// Obfuscation endpoint
app.post('/api/obfuscate', async (req, res) => {
    const { code, version, preset } = req.body;

    // Validation
    if (!code || typeof code !== 'string' || code.trim() === '') {
        return res.status(400).json({ 
            error: 'Invalid request: code is required and must be a non-empty string' 
        });
    }

    const validVersions = ['lua51', 'luau'];
    if (!version || !validVersions.includes(version.toLowerCase())) {
        return res.status(400).json({ 
            error: `Invalid version: must be one of ${validVersions.join(', ')}` 
        });
    }

    const validPresets = ['minify', 'weak', 'medium', 'strong'];
    if (!preset || !validPresets.includes(preset.toLowerCase())) {
        return res.status(400).json({ 
            error: `Invalid preset: must be one of ${validPresets.join(', ')}` 
        });
    }

    // Check if Prometheus exists
    const prometheusCliPath = path.join(PROMETHEUS_PATH, 'cli.lua');
    if (!fs.existsSync(prometheusCliPath)) {
        return res.status(500).json({ 
            error: 'Prometheus not found. Please ensure Prometheus is installed at: ' + PROMETHEUS_PATH,
            hint: 'Update PROMETHEUS_PATH in .env file or contact administrator'
        });
    }

    // Generate unique filename
    const fileId = crypto.randomBytes(16).toString('hex');
    const inputFile = path.join('temp', `input_${fileId}.lua`);
    const outputFile = path.join('temp', `output_${fileId}.lua`);
    const inputFileAbs = path.resolve(TEMP_DIR, `input_${fileId}.lua`);
    const outputFileAbs = path.resolve(TEMP_DIR, `output_${fileId}.lua`);

    try {
        // Write input code to temporary file
        fs.writeFileSync(inputFileAbs, code, 'ascii');

        // Prepare Prometheus command
        const presetCapitalized = preset.charAt(0).toUpperCase() + preset.slice(1);
        const luauFlag = version.toLowerCase() === 'luau' ? '--LuaU ' : '';
        const command = `"${LUA_EXECUTABLE}" "${prometheusCliPath}" ${luauFlag}--preset ${presetCapitalized} --out "${outputFileAbs}" "${inputFileAbs}"`;

        if (DEBUG) {
            console.log('Executing command:', command);
        }

        // Execute Prometheus
        exec(command, { 
            cwd: __dirname,
            timeout: 120000, // Increased from 30s to 120s for large files
            maxBuffer: 20 * 1024 * 1024 // 20MB - reduced to prevent OOM on free tier
        }, (error, stdout, stderr) => {
            // Clean up input file
            try {
                if (fs.existsSync(inputFileAbs)) {
                    fs.unlinkSync(inputFileAbs);
                }
            } catch (cleanupError) {
                console.error('Error cleaning up input file:', cleanupError);
            }

            if (error) {
                console.error('Prometheus execution error:', error);
                
                try {
                    if (fs.existsSync(outputFileAbs)) {
                        fs.unlinkSync(outputFileAbs);
                    }
                } catch (cleanupError) {
                    console.error('Error cleaning up output file:', cleanupError);
                }

                return res.status(500).json({ 
                    error: 'Obfuscation failed',
                    details: stderr || error.message
                });
            }

            // Read obfuscated output
            try {
                if (!fs.existsSync(outputFileAbs)) {
                    return res.status(500).json({ 
                        error: 'Obfuscation completed but output file not found'
                    });
                }

                const obfuscatedCode = fs.readFileSync(outputFileAbs, 'utf8');
                
                // Clean up output file
                try {
                    fs.unlinkSync(outputFileAbs);
                } catch (cleanupError) {
                    console.error('Error cleaning up output file:', cleanupError);
                }

                // Return success
                res.json({ 
                    success: true,
                    obfuscatedCode: obfuscatedCode,
                    metadata: {
                        version: version,
                        preset: preset,
                        originalSize: code.length,
                        obfuscatedSize: obfuscatedCode.length
                    }
                });

            } catch (readError) {
                console.error('Error reading output file:', readError);
                res.status(500).json({ 
                    error: 'Failed to read obfuscated output'
                });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        
        try {
            if (fs.existsSync(inputFileAbs)) fs.unlinkSync(inputFileAbs);
            if (fs.existsSync(outputFileAbs)) fs.unlinkSync(outputFileAbs);
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }

        res.status(500).json({ 
            error: 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: DEBUG ? err.message : 'An unexpected error occurred'
    });
});

// ============================================
// ADMIN PANEL ENDPOINTS
// ============================================

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
    try {
        const { password } = req.body;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default for dev

        if (password === adminPassword) {
            // Generate simple session token
            const token = crypto.randomBytes(32).toString('hex');
            
            res.json({
                success: true,
                token: token,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid password'
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get All Payments (Admin Only)
app.get('/api/admin/payments', async (req, res) => {
    try {
        // Simple auth check - in production, validate token properly
        const authHeader = req.headers.authorization;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        // Check if password is in Authorization header (Basic auth style)
        if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get all payments from database
        const payments = await new Promise((resolve, reject) => {
            paymentDB.db.all(
                'SELECT * FROM payments ORDER BY created_at DESC',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else {
                        // Parse generated_keys JSON
                        rows.forEach(row => {
                            if (row.generated_keys) {
                                try {
                                    row.generated_keys = JSON.parse(row.generated_keys);
                                } catch (e) {
                                    // Keep as string if parse fails
                                }
                            }
                        });
                        resolve(rows);
                    }
                }
            );
        });

        // Calculate stats
        const stats = {
            totalPurchases: payments.length,
            paypalPurchases: payments.filter(p => p.currency !== 'ROBUX').length,
            robloxPurchases: payments.filter(p => p.currency === 'ROBUX').length,
            totalRevenue: payments
                .filter(p => p.currency !== 'ROBUX')
                .reduce((sum, p) => sum + (p.amount || 0), 0)
        };

        res.json({
            success: true,
            payments: payments,
            stats: stats
        });

    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🔥 Prometheus Lua Obfuscator Backend`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📁 Prometheus path: ${PROMETHEUS_PATH}`);
    console.log(`🔧 Lua executable: ${LUA_EXECUTABLE}`);
    console.log(`📂 Temp directory: ${TEMP_DIR}`);
    console.log(`🐛 Debug mode: ${DEBUG ? 'enabled' : 'disabled'}`);
    console.log('');
    
    // Check Prometheus installation
    const prometheusCliPath = path.join(PROMETHEUS_PATH, 'cli.lua');
    if (fs.existsSync(prometheusCliPath)) {
        console.log('✅ Prometheus CLI found');
    } else {
        console.log('❌ Prometheus CLI not found at:', prometheusCliPath);
        console.log('   Please install Prometheus or update PROMETHEUS_PATH in .env');
    }
    
    console.log('\nReady to obfuscate! 🚀');
});

// Export app for testing
module.exports = app;
