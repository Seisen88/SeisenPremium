// Test PayPal Payment Flow
// This script tests the complete payment flow without actually using PayPal

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

async function testPaymentFlow() {
    console.log('🧪 Testing PayPal Payment Flow\n');
    
    try {
        // Step 1: Create PayPal Order
        console.log('📝 Step 1: Creating PayPal order...');
        const createResponse = await axios.post(`${BACKEND_URL}/api/paypal/create-order`, {
            tier: 'weekly'
        });
        
        console.log('✅ Order created successfully!');
        console.log('   Order ID:', createResponse.data.orderId);
        console.log('   Approval URL:', createResponse.data.approvalUrl);
        console.log('');
        
        // Note: In real flow, user would go to approvalUrl and complete payment
        // For testing, we'll skip to capture (this won't work in production without actual payment)
        
        console.log('⚠️  In production, user would:');
        console.log('   1. Visit the approval URL');
        console.log('   2. Log into PayPal');
        console.log('   3. Complete the payment');
        console.log('   4. Get redirected back with order ID');
        console.log('');
        
        console.log('💡 To test the full flow:');
        console.log('   1. Open premium.html in your browser');
        console.log('   2. Click "Pay with PayPal" for Weekly plan');
        console.log('   3. Complete payment in PayPal Sandbox');
        console.log('   4. See the key generated automatically!');
        console.log('');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test Junkie Webhook directly
async function testJunkieWebhook() {
    console.log('🧪 Testing Junkie Webhook Integration\n');
    
    try {
        const JunkieKeySystem = require('./junkie-integration');
        
        const junkieSystem = new JunkieKeySystem({
            webhookUrl: process.env.JUNKIE_WEBHOOK_URL,
            hmacSecret: process.env.JUNKIE_HMAC_SECRET,
            provider: process.env.JUNKIE_PROVIDER || 'seisenhub',
            defaultService: process.env.JUNKIE_SERVICE || 'Premium Key'
        });
        
        console.log('📝 Calling Junkie webhook to generate key...');
        console.log('   Webhook URL:', process.env.JUNKIE_WEBHOOK_URL);
        console.log('   Provider:', process.env.JUNKIE_PROVIDER);
        console.log('   Service:', process.env.JUNKIE_SERVICE);
        console.log('');
        
        const result = await junkieSystem.generateKey({
            tier: 'weekly',
            validity: 168,
            quantity: 1,
            userInfo: {
                email: 'test@example.com',
                payerId: 'TEST123',
                robloxUsername: 'TestUser'
            },
            paymentInfo: {
                amount: 3,
                currency: 'EUR',
                transactionId: 'TEST-' + Date.now()
            }
        });
        
        if (result.success && result.keys && result.keys.length > 0) {
            console.log('✅ Key generated successfully!');
            console.log('');
            console.log('🔑 Generated Key(s):');
            result.keys.forEach((key, index) => {
                console.log(`   ${index + 1}. ${key}`);
            });
            console.log('');
            console.log('✅ Junkie integration is working correctly!');
        } else {
            console.log('❌ Key generation failed');
            console.log('   Error:', result.error);
            console.log('   Details:', result.details);
        }
        
    } catch (error) {
        console.error('❌ Junkie test failed:', error.message);
        console.error('   Make sure your .env file has:');
        console.error('   - JUNKIE_WEBHOOK_URL');
        console.error('   - JUNKIE_HMAC_SECRET');
        console.error('   - JUNKIE_PROVIDER');
        console.error('   - JUNKIE_SERVICE');
    }
}

// Run tests
async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  PayPal + Junkie Integration Test Suite');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // Test 1: PayPal Order Creation
    await testPaymentFlow();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // Test 2: Junkie Webhook
    await testJunkieWebhook();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Testing complete!');
    console.log('');
}

// Load environment variables
require('dotenv').config();

// Run tests
runAllTests().catch(console.error);
