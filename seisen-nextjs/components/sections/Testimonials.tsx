import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getDiscordMemberCount } from '@/lib/discord';
import { getRecentTestimonials } from '@/lib/testimonials';

export default async function Testimonials() {
  const [discordStats, testimonials] = await Promise.all([
    getDiscordMemberCount(),
    getRecentTestimonials()
  ]);

  const memberCount = discordStats?.total ? discordStats.total.toLocaleString() : '15,000+';
  
  if (!testimonials || testimonials.length === 0) {
     return null; // Or return fallback content
  }

  return (
    <section className="py-20 animate-fade-in animation-delay-200">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Loved by gamers <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-purple-500">worldwide</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Join <span className="text-white font-medium">{memberCount} users</span> who trust Seisen to accelerate their daily workflow
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card 
            key={index} 
            variant="default" // Using default first, custom styling applied below
            className={`p-6 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 ${
              testimonial.highlight 
                ? 'bg-[#1a1a1a] border border-[var(--accent)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]' 
                : 'bg-[#0f0f0f] border border-white/5 hover:border-white/10'
            }`}
          >
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">{testimonial.author}</h4>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
