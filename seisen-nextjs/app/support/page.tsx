'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Headset, Send, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/utils';

interface Ticket {
  id: string;
  ticket_number?: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: string;
  lastMessage?: string;
}

function SupportContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    email: '',
    category: 'general',
    message: '',
  });

  // Pre-fill from URL params (for premium redirects)
  useEffect(() => {
    const reason = searchParams.get('reason');
    const plan = searchParams.get('plan');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    if (reason === 'premium' && plan) {
      setShowNewTicket(true);
      setFormData((prev) => ({
        ...prev,
        category: 'payment',
        subject: `Premium Purchase - ${plan} (${amount} ${currency})`,
        message: `I would like to purchase the ${plan} plan for ${amount} ${currency}.\n\nPlease provide payment instructions.`,
      }));
    }
  }, [searchParams]);

  // Fetch tickets on page load
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Try to get email from localStorage in this order:
        // 1. Saved support email (from previous tickets)
        // 2. Email from previous purchases
        let userEmail = localStorage.getItem('seisen_support_email') || '';
        
        if (!userEmail) {
          const savedKeys = localStorage.getItem('seisen_premium_keys');
          if (savedKeys) {
            try {
              const keys = JSON.parse(savedKeys);
              if (keys.length > 0 && keys[0].email) {
                userEmail = keys[0].email;
              }
            } catch (e) {
              console.error('Error parsing saved keys:', e);
            }
          }
        }

        // Update form with saved email
        if (userEmail) {
          setFormData(prev => ({ ...prev, email: userEmail }));

          // Fetch tickets for this email
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/api/tickets?email=${encodeURIComponent(userEmail)}`);
          if (response.ok) {
            const data = await response.json();
            setTickets(data.tickets || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };

    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Save email to localStorage for future visits
        localStorage.setItem('seisen_support_email', formData.email);
        
        setShowNewTicket(false);
        
        // Refresh tickets list
        const ticketsResponse = await fetch(`${apiUrl}/api/tickets?email=${encodeURIComponent(formData.email)}`);
        if (ticketsResponse.ok) {
          const data = await ticketsResponse.json();
          setTickets(data.tickets || []);
        }
        
        setFormData({ subject: '', email: formData.email, category: 'general', message: '' });
        // Show success message
        alert(`Ticket created successfully! Ticket #${result.ticket?.ticket_number || 'N/A'}`);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30">
            <Headset className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-gray-500">
            Need help? Open a ticket or check your existing tickets
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setShowNewTicket(true)}>
            <MessageSquare className="w-4 h-4" />
            New Ticket
          </Button>
          <a
            href="https://discord.gg/F4sAf6z8Ph"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
              </svg>
              Discord Support
            </Button>
          </a>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create New Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="general">General Support</option>
                  <option value="payment">Payment Issue</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Submit Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewTicket(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Tickets */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Your Tickets</h2>
          {tickets.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">No tickets yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Create a new ticket if you need help
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  variant="hover" 
                  className="p-4 cursor-pointer transition-all hover:border-emerald-500/50"
                  onClick={() => window.location.href = `/support/ticket/${ticket.ticket_number || ticket.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{ticket.subject}</h3>
                      <p className="text-gray-500 text-sm">#{ticket.ticket_number || ticket.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.status === 'open' && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded text-xs">
                          Open
                        </span>
                      )}
                      {ticket.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs">
                          Pending
                        </span>
                      )}
                      {ticket.status === 'closed' && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded text-xs">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SupportContent />
    </Suspense>
  );
}
