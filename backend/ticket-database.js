// Ticket Database Handler
// Manages support tickets and replies

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TicketDatabase {
    constructor(dbPath = './tickets.db') {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Ticket database connection error:', err);
            } else {
                console.log('✅ Ticket database connected');
                this.initializeDatabase();
            }
        });
    }

    initializeDatabase() {
        // Tickets table
        const createTicketsTable = `
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_number TEXT UNIQUE NOT NULL,
                user_name TEXT NOT NULL,
                user_email TEXT NOT NULL,
                category TEXT NOT NULL,
                subject TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                discord_message_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Ticket replies table
        const createRepliesTable = `
            CREATE TABLE IF NOT EXISTS ticket_replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                author_type TEXT NOT NULL,
                author_name TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id)
            )
        `;

        this.db.run(createTicketsTable, (err) => {
            if (err) console.error('Error creating tickets table:', err);
            else console.log('✅ Tickets table ready');
        });

        this.db.run(createRepliesTable, (err) => {
            if (err) console.error('Error creating replies table:', err);
            else console.log('✅ Ticket replies table ready');
        });
    }

    // Generate unique ticket number
    generateTicketNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6);
        return `TKT-${timestamp}-${random}`.toUpperCase();
    }

    // Create new ticket
    createTicket(ticketData) {
        return new Promise((resolve, reject) => {
            const ticketNumber = this.generateTicketNumber();
            const sql = `
                INSERT INTO tickets (
                    ticket_number, user_name, user_email, category, subject, description
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const params = [
                ticketNumber,
                ticketData.userName,
                ticketData.userEmail,
                ticketData.category,
                ticketData.subject,
                ticketData.description
            ];

            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ticketNumber });
            });
        });
    }

    // Get ticket by number
    getTicket(ticketNumber) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM tickets WHERE ticket_number = ?';
            this.db.get(sql, [ticketNumber], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get all tickets
    getAllTickets() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM tickets ORDER BY created_at DESC';
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get tickets by email (for user lookup)
    getTicketsByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM tickets WHERE user_email = ? ORDER BY created_at DESC';
            this.db.all(sql, [email], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Add reply to ticket
    addReply(ticketId, replyData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO ticket_replies (ticket_id, author_type, author_name, message)
                VALUES (?, ?, ?, ?)
            `;

            const params = [
                ticketId,
                replyData.authorType, // 'user' or 'admin'
                replyData.authorName,
                replyData.message
            ];

            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else {
                    // Update ticket's updated_at
                    const updateSql = 'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
                    this.run(updateSql, [ticketId]);
                    resolve(this.lastID);
                }
            }.bind(this.db));
        });
    }

    // Get all replies for a ticket
    getReplies(ticketId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC';
            this.db.all(sql, [ticketId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Update ticket status
    updateStatus(ticketId, status) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            this.db.run(sql, [status, ticketId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Close database
    close() {
        this.db.close((err) => {
            if (err) console.error('Error closing ticket database:', err);
            else console.log('Ticket database closed');
        });
    }
}

module.exports = TicketDatabase;
