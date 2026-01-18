import { Handshake, ExternalLink, Users, Zap, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const partnerBenefits = [
  {
    icon: Users,
    title: 'Reach New Users',
    description: 'Access our growing community of script users and gamers',
  },
  {
    icon: Zap,
    title: 'Featured Promotion',
    description: 'Get featured on our platform and social media channels',
  },
  {
    icon: Shield,
    title: 'Trusted Partnership',
    description: 'Join our network of verified and trusted partners',
  },
];

const partners = [
  {
    name: 'Work.ink',
    description: 'Checkpoint system provider for the free key process. Complete step-by-step tasks to unlock your key from Junkie.',
    tags: ['Checkpoints', 'Free Keys'],
    link: 'https://work.ink',
    image: '/images/partners/workink.webp',
  },
  {
    name: 'Lockr.so',
    description: 'Secure checkpoint platform for key verification. Work through checkpoints to receive your Junkie-generated key.',
    tags: ['Security', 'Checkpoints'],
    link: 'https://lockr.so',
    image: '/images/partners/lockr.webp',
  },
  {
    name: 'PayPal',
    description: 'Secure payment processing for premium subscriptions with buyer protection.',
    tags: ['Payments', 'Secure'],
    link: 'https://www.paypal.com',
    image: '/images/partners/paypal.png',
  },
  {
    name: 'Prometheus',
    description: 'Advanced Lua obfuscation engine powering our code protection tools.',
    tags: ['Obfuscation', 'Open Source'],
    link: 'https://github.com/levno-710/Prometheus',
    icon: '🔥', // Special case for Prometheus which had a fire emoji
  },
  {
    name: 'Junkie.Development',
    description: 'Key generation system providing both free and premium access keys. All keys are generated and distributed through Junkie.',
    tags: ['Free Keys', 'Premium Keys'],
    link: 'https://junkie-development.de/',
    image: '/images/partners/junkie.webp',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <section className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Partnerships</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Partner with Seisen to reach thousands of users. We offer various partnership opportunities for creators, developers, and businesses.
          </p>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Partner Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {partnerBenefits.map((benefit) => (
              <Card key={benefit.title} variant="hover" className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Current Partners */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Our Partners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner, idx) => (
              <Card
                key={idx}
                variant="hover"
                className="p-6 text-center h-full flex flex-col items-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                  {/* @ts-ignore */}
                  {partner.placeholder ? (
                    <span className="text-2xl text-gray-600">?</span>
                    /* @ts-ignore */
                  ) : partner.image ? (
                     /* @ts-ignore */
                    <img src={partner.image} alt={partner.name} className="w-full h-full object-contain p-2" />
                     /* @ts-ignore */
                  ) : partner.icon ? (
                     /* @ts-ignore */
                    <span className="text-3xl">{partner.icon}</span>
                  ) : (
                    <Handshake className="w-8 h-8 text-emerald-500" />
                  )}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-1">{partner.description}</p>
                
                {/* @ts-ignore */}
                {!partner.placeholder && (
                   <div className="w-full space-y-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {/* @ts-ignore */}
                        {partner.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* @ts-ignore */}
                      <a href={partner.link} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="secondary" className="w-full h-9 text-sm">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Visit Website
                        </Button>
                      </a>
                   </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Become a Partner CTA */}
        <Card className="p-8 text-center bg-gradient-to-r from-[#141414] to-[#1a1a1a]">
          <h2 className="text-2xl font-bold text-white mb-3">Become a Partner</h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Interested in partnering with Seisen? Join our Discord and open a ticket to discuss partnership opportunities.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://discord.gg/F4sAf6z8Ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                </svg>
                Contact on Discord
              </Button>
            </a>
            <a href="/support">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4" />
                Open Support Ticket
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
