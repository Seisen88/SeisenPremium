'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Clock, User, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/utils';

interface Reply {
  id: string;
  author_type: string;
  author_name: string;
  message: string;
  created_at: string;
}

interface TicketDetails {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

function TicketDetailContent() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/tickets/${ticketId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        setReplies(data.replies || []);
      } else {
        alert('Ticket not found');
        router.push('/support');
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      alert('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (response.ok) {
        setReplyMessage('');
        await fetchTicketDetails(); // Refresh to show new reply
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => router.push('/support')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Button>
        </div>

        {/* Ticket Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{ticket.subject}</h1>
              <p className="text-gray-500 text-sm">Ticket #{ticket.ticket_number}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm ${
              ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-500' :
              ticket.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-gray-500/20 text-gray-500'
            }`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="text-white ml-2 capitalize">{ticket.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="text-white ml-2">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <p className="text-gray-400 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
          
          {replies.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No replies yet</p>
            </Card>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    reply.author_type === 'admin' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                  }`}>
                    {reply.author_type === 'admin' ? (
                      <Shield className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <User className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{reply.author_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-400 whitespace-pre-wrap">{reply.message}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Reply</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                required
              />
              <Button type="submit" disabled={sending || !replyMessage.trim()}>
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Reply'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <TicketDetailContent />
    </Suspense>
  );
}
