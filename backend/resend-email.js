// Resend Email Integration
const { Resend } = require('resend');

class ResendEmailService {
    constructor(apiKey, fromEmail) {
        if (!apiKey) {
            console.warn('⚠️  Resend API key not configured - emails will not be sent');
            this.resend = null;
            return;
        }
        
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail || 'noreply@yourdomain.com';
        console.log('✅ Resend email service initialized');
    }

    async sendKeyEmail(to, key, tier, transactionId) {
        if (!this.resend) {
            console.log('📧 Email not sent - Resend not configured');
            return { success: false, error: 'Email service not configured' };
        }

        try {
            const tierNames = {
                weekly: 'Weekly (7 Days)',
                monthly: 'Monthly (30 Days)',
                lifetime: 'Lifetime (Unlimited)'
            };

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .key-box {
            background: white;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .key {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            color: #10b981;
            font-weight: bold;
            word-break: break-all;
        }
        .info-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box strong {
            color: #667eea;
        }
        .steps {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps ol {
            padding-left: 20px;
        }
        .steps li {
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
        .button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Your Premium Key is Ready!</h1>
    </div>
    
    <div class="content">
        <p>Thank you for purchasing Seisen Hub Premium!</p>
        
        <div class="key-box">
            <p style="margin: 0 0 10px 0; color: #6c757d;">Your Premium Key:</p>
            <div class="key">${key}</div>
        </div>
        
        <div class="info-box">
            <p><strong>Plan:</strong> ${tierNames[tier] || tier}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="steps">
            <h3>How to Use Your Key:</h3>
            <ol>
                <li>Copy your key from above</li>
                <li>Launch Seisen Hub script in Roblox</li>
                <li>Paste your key when prompted</li>
                <li>Enjoy premium features!</li>
            </ol>
        </div>
        
        <p style="text-align: center;">
            <a href="https://discord.gg/F4sAf6z8Ph" class="button">Join Our Discord</a>
        </p>
        
        <div class="footer">
            <p>Need help? Join our Discord server for support.</p>
            <p>© 2026 Seisen Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `;

            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: `Your Seisen Hub Premium Key - ${tierNames[tier]}`,
                html: emailHtml
            });

            if (error) {
                console.error('❌ Resend email error:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Email sent successfully:', data.id);
            return { success: true, messageId: data.id };

        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = ResendEmailService;
