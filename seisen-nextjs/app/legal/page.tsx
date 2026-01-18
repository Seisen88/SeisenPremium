'use client';

import { useEffect } from 'react';
import { Scale, Shield, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const sections = [
  {
    id: 'terms',
    icon: Scale,
    title: 'Terms of Service',
    content: `
      <h4>1. Acceptance of Terms</h4>
      <p>By accessing and using Seisen ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
      
      <h4>2. Description of Service</h4>
      <p>Seisen provides scripts and tools for gaming enhancement purposes. The Service includes both free and premium tiers with varying levels of access.</p>
      
      <h4>3. User Responsibilities</h4>
      <p>You are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of your access keys</li>
        <li>All activities that occur under your account</li>
        <li>Ensuring your use complies with applicable laws</li>
        <li>Not sharing, reselling, or distributing our scripts</li>
      </ul>
      
      <h4>4. Prohibited Uses</h4>
      <p>You may not:</p>
      <ul>
        <li>Redistribute, sell, or share premium content</li>
        <li>Attempt to reverse engineer or decompile scripts</li>
        <li>Use the Service for illegal activities</li>
        <li>Abuse, harass, or harm other users</li>
      </ul>
      
      <h4>5. Termination</h4>
      <p>We reserve the right to terminate access to the Service at any time, for any reason, without notice.</p>
    `,
  },
  {
    id: 'privacy',
    icon: Shield,
    title: 'Privacy Policy',
    content: `
      <h4>1. Information We Collect</h4>
      <p>We may collect:</p>
      <ul>
        <li>Email addresses (for premium purchases and support)</li>
        <li>Payment information (processed securely through PayPal)</li>
        <li>Usage data and analytics</li>
        <li>IP addresses for security purposes</li>
      </ul>
      
      <h4>2. How We Use Information</h4>
      <p>Your information is used to:</p>
      <ul>
        <li>Process payments and deliver premium access</li>
        <li>Provide customer support</li>
        <li>Improve our services</li>
        <li>Communicate important updates</li>
      </ul>
      
      <h4>3. Data Security</h4>
      <p>We implement appropriate security measures to protect your personal information. Payment processing is handled securely through PayPal.</p>
      
      <h4>4. Third Parties</h4>
      <p>We do not sell or share your personal information with third parties except as necessary to provide our services (e.g., payment processing).</p>
      
      <h4>5. Cookies</h4>
      <p>We use cookies to improve your experience and remember your preferences.</p>
    `,
  },
  {
    id: 'refund',
    icon: CreditCard,
    title: 'Refund Policy',
    content: `
      <h4>No Refund Policy</h4>
      <p class="warning">All sales are final. We do not offer refunds under any circumstances.</p>
      
      <h4>Why No Refunds?</h4>
      <p>Due to the digital nature of our products:</p>
      <ul>
        <li>Premium access is granted instantly upon payment</li>
        <li>Scripts cannot be "returned" after access is granted</li>
        <li>We cannot verify if content has been used or downloaded</li>
      </ul>
      
      <h4>Before Purchasing</h4>
      <p>Please ensure you:</p>
      <ul>
        <li>Understand what Premium access includes</li>
        <li>Have tested our free content to ensure compatibility</li>
        <li>Are certain you want to make the purchase</li>
      </ul>
      
      <h4>Disputes</h4>
      <p>Any payment disputes or chargebacks will result in immediate termination of access and potential banning from the Service.</p>
      
      <h4>Contact</h4>
      <p>If you have questions before purchasing, please contact us through Discord or our support ticket system.</p>
    `,
  },
];

export default function LegalPage() {
  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/30">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Legal</h1>
          <p className="text-gray-500">
            Terms of Service, Privacy Policy, and Refund Policy
          </p>
        </section>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 justify-center">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors text-sm"
            >
              {section.title}
            </a>
          ))}
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <Card key={section.id} id={section.id} className="p-6 scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <section.icon className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3
                prose-p:text-gray-400 prose-p:mb-3
                prose-ul:text-gray-400 prose-ul:ml-4
                prose-li:mb-1
                [&_.warning]:bg-red-500/10 [&_.warning]:border [&_.warning]:border-red-500/30 [&_.warning]:p-4 [&_.warning]:rounded-lg [&_.warning]:text-red-400"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </Card>
        ))}

        {/* Last Updated */}
        <p className="text-center text-gray-600 text-sm">
          Last updated: January 2026
        </p>
      </div>
    </div>
  );
}
