import Link from 'next/link';
import {
  Zap,
  Code,
  Key,
  Crown,
  CheckCircle,
  Bell,
  Smartphone,
  Shield,
  Play,
  Briefcase,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fetchScripts } from '@/lib/scripts';
import ScriptCarousel from '@/components/ScriptCarousel';

export default async function HomePage() {
  const scripts = await fetchScripts();

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12 animate-fade-in">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Seisen
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Premium scripts for enhanced gaming experiences and functionality.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/scripts">
              <Button size="lg">
                <Code className="w-5 h-5" />
                Browse Scripts
              </Button>
            </Link>
            <Link href="#access-options">
              <Button variant="outline" size="lg">
                <Key className="w-5 h-5" />
                Get Access Key
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg">
                <Crown className="w-5 h-5" />
                Go Premium
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card variant="hover" className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Premium Scripts</h3>
                <p className="text-gray-500 text-sm">
                  Access high-quality scripts with advanced features and regular updates.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="hover" className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Bell className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Frequent Updates</h3>
                <p className="text-gray-500 text-sm">
                  Get instant notifications when new scripts are released or updated.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="hover" className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Smartphone className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Easy Access</h3>
                <p className="text-gray-500 text-sm">
                  Simple key-based system for quick and secure script access.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Featured Scripts Carousel */}
        <section className="animate-fade-in animation-delay-200">
           <div className="flex items-center justify-between mb-8 px-2">
              <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Featured Scripts</h2>
                  <p className="text-gray-500 text-sm">Most popular scripts available right now</p>
              </div>
              <Link href="/scripts" className="hidden md:flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
           
           <ScriptCarousel scripts={scripts} />
           
           <div className="md:hidden text-center mt-6">
              <Link href="/scripts">
                  <Button variant="outline" className="w-full">View All Scripts</Button>
              </Link>
           </div>
        </section>

        {/* Getting Started Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Getting Started</h2>
            <p className="text-gray-500">Three simple steps to access premium scripts</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: Code,
                title: 'Get Your Key',
                desc: 'Obtain a free or premium access key to unlock scripts',
              },
              {
                step: 2,
                icon: Key,
                title: 'Browse Scripts',
                desc: 'Explore our library of premium scripts and tools',
              },
              {
                step: 3,
                icon: Shield,
                title: 'Copy & Execute',
                desc: 'Copy the script and run it in your game environment',
              },
            ].map((item) => (
              <Card key={item.step} variant="hover" className="p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-center pt-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Status Indicator */}
          <Card variant="default" className="mt-8 p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="font-medium text-white text-sm">Service Status: Online</h4>
                <p className="text-gray-500 text-xs">
                  Join our Discord for maintenance updates and announcements
                </p>
              </div>
            </div>
            <a
              href="https://discord.gg/F4sAf6z8Ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                </svg>
                Open Discord
              </Button>
            </a>
          </Card>
        </section>

        {/* Access Options Section */}
        <section id="access-options">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-500">Select the option that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="hover" className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Key className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">Free Tier</h3>
              <p className="text-gray-500 text-sm mb-6">
                Access to basic scripts with time-based key system
              </p>
              <Link href="/getkey">
                <Button variant="secondary" className="w-full">
                  <Key className="w-4 h-4" />
                  Get Free Key
                </Button>
              </Link>
            </Card>

            <Card variant="featured" className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Premium Plan</h3>
              <p className="text-gray-500 text-sm mb-6">
                Full access to all premium scripts with no limitations
              </p>
              <Link href="/premium">
                <Button className="w-full">
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </Button>
              </Link>
            </Card>

            <Card variant="hover" className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-500 text-sm mb-6">
                Get help, share tips, and connect with other users on Discord
              </p>
              <a
                href="https://discord.gg/F4sAf6z8Ph"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                  </svg>
                  Join Discord
                </Button>
              </a>
            </Card>
          </div>

          {/* Premium CTA */}
          <Card variant="default" className="mt-8 p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#141414] to-[#1a1a1a]">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Ready to unlock all scripts?
              </h3>
              <p className="text-gray-500 text-sm">
                Upgrade to Premium for instant access to our entire script library
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="#access-options">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </Button>
              </Link>
              <Link href="/premium">
                <Button>
                  <Zap className="w-4 h-4" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* Info Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card variant="hover" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Play className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-white">Tutorial Videos</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Watch guides, tutorials, and feature showcases
            </p>
            <a
              href="https://www.youtube.com/@SeisenHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm">
                <Play className="w-4 h-4" />
                Watch Now
              </Button>
            </a>
          </Card>

          <Card variant="hover" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Briefcase className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-white">Partnerships</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Explore integration options and business opportunities
            </p>
            <Link href="/partners">
              <Button variant="secondary" size="sm">
                <Briefcase className="w-4 h-4" />
                Learn More
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
}
