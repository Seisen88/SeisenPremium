// Database handler for payment tracking
// Uses SQLite to store payment records and generated keys

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class PaymentDatabase {
    constructor(dbPath = './payments.db') {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('✅ Payment database connected');
                this.initializeDatabase();
            }
        });
    }

    /**
     * Initialize database tables
     */
    initializeDatabase() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT UNIQUE NOT NULL,
                payer_email TEXT,
                payer_id TEXT,
                roblox_username TEXT,
                roblox_uaid TEXT,
                tier TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                generated_keys TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error creating payments table:', err);
            } else {
                // Check if roblox_uaid column exists (migration)
                this.db.all("PRAGMA table_info(payments)", (err, rows) => {
                    if (!err && rows) {
                        const hasUaid = rows.some(r => r.name === 'roblox_uaid');
                        if (!hasUaid) {
                            console.log('Migrating database: Adding roblox_uaid column...');
                            this.db.run("ALTER TABLE payments ADD COLUMN roblox_uaid TEXT", (err) => {
                                if (err) console.error('Migration failed:', err);
                                else console.log('✅ Migration successful: roblox_uaid added');
                            });
                        }
                    }
                });
                console.log('✅ Payments table ready');
            }
        });
    }

    /**
     * Check if transaction already exists
     * @param {string} transactionId - PayPal transaction ID
     * @returns {Promise<boolean>}
     */
    transactionExists(transactionId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM payments WHERE transaction_id = ?';
            
            this.db.get(sql, [transactionId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    /**
     * Save payment record
     * @param {Object} paymentData - Payment information
     * @returns {Promise<number>} - Inserted row ID
     */
    savePayment(paymentData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO payments (
                    transaction_id, payer_email, payer_id, roblox_username, roblox_uaid,
                    tier, amount, currency, payment_status, generated_keys
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                paymentData.transactionId,
                paymentData.payerEmail,
                paymentData.payerId || null,
                paymentData.robloxUsername || null,
                paymentData.robloxUaid || null,
                paymentData.tier,
                paymentData.amount,
                paymentData.currency,
                paymentData.status,
                paymentData.keys ? JSON.stringify(paymentData.keys) : null
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Update payment with generated keys
     * @param {string} transactionId - Transaction ID
     * @param {Array} keys - Generated keys
     * @returns {Promise<void>}
     */
    updatePaymentKeys(transactionId, keys) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE payments 
                SET generated_keys = ?, updated_at = CURRENT_TIMESTAMP
                WHERE transaction_id = ?
            `;

            this.db.run(sql, [JSON.stringify(keys), transactionId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get payment by transaction ID
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>}
     */
    getPayment(transactionId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM payments WHERE transaction_id = ?';
            
            this.db.get(sql, [transactionId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row && row.generated_keys) {
                        row.generated_keys = JSON.parse(row.generated_keys);
                    }
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get all payments for a user
     * @param {string} email - User email
     * @returns {Promise<Array>}
     */
    getUserPayments(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM payments WHERE payer_email = ? ORDER BY created_at DESC';
            
            this.db.all(sql, [email], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    rows.forEach(row => {
                        if (row.generated_keys) {
                            row.generated_keys = JSON.parse(row.generated_keys);
                        }
                    });
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = PaymentDatabase;
