import { supabase } from './server/db';
import { fetchScripts } from './scripts';

export interface TestimonialData {
  content: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  highlight: boolean;
}

const REVIEWS_BY_CATEGORY = {
  COMBAT: [
    "Seisen has completely transformed my PvP. The aim and prediction are undetectable and mind-blowing.",
    "The real-time updates have saved me in ranked matches countless times. Worth every penny.",
    "My K/D ratio has skyrocketed since I started using Seisen. The prediction engine is unmatched.",
    "Best investment I've made. The auto-parry is faster than any human reaction.",
    "I was skeptical at first, but this script is legit. Safe, fast, and features are insane for war.",
  ],
  FARMING: [
    "Leveling up has never been easier. This tool autofarms exactly as promised while I sleep.",
    "From complex raids to simple farming, Seisen handles it all brilliantly. Indispensable tool.",
    "Seisen understands game mechanics better than any other tool. Dramatically improved my grinding efficiency.",
    "The auto-quest features are bug-free and super efficient. Saved me hundreds of hours.",
    "I maxed out my account in days thanks to this. The resource collection is completely automated."
  ],
  TYCOON: [
    "The best automation for building my empire. It manages everything perfectly.",
    "Cash flow maximized instantly. This script handles the complex math and timing for me.",
    "I built the biggest base in the server overnight. The auto-build feature is flawless.",
    "Perfect for AFK management. I come back to millions of cash every time.",
  ],
  GENERAL: [
    "The customization options let me tailor the scripts perfectly to my playstyle. Game-changing.",
    "Customer support helped me set everything up in minutes. Works perfectly!",
    "Best investment I've made for this game. Updates are fast and the script is super stable.",
    "Easy to safe, undetectable, and powerful. Exactly what I needed.",
    "The UI is clean and the features just work. No hassle setup."
  ]
};

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visibleLen = Math.min(3, Math.max(1, Math.floor(name.length / 2)));
  const maskedName = name.substring(0, visibleLen) + '***';
  return `${maskedName}@${domain}`;
}

function maskUsername(username: string): string {
  if (!username || username.length < 3) return username;
  const visibleLen = Math.min(3, Math.max(1, Math.floor(username.length / 2)));
  return username.substring(0, visibleLen) + '***';
}

function getScriptCategory(name: string): keyof typeof REVIEWS_BY_CATEGORY {
  const lower = name.toLowerCase();
  
  if (lower.includes('fruit') || lower.includes('blox') || lower.includes('combat') || lower.includes('war') || lower.includes('blade') || lower.includes('fight') || lower.includes('apex') || lower.includes('counter') || lower.includes('rivals')) {
    return 'COMBAT';
  }
  if (lower.includes('pet') || lower.includes('sim') || lower.includes('farm') || lower.includes('tycoon') || lower.includes('build') || lower.includes('fish') || lower.includes('mining') || lower.includes('anime defenders')) {
    // "Anime Defenders" is often tower defense/farming, but could be combat. Let's classify broadly or specific.
    // Actually separation of Farming vs Tycoon might be good but let's stick to requested "Farming/Raids" context mainly.
    // Let's refine:
    return 'FARMING';
  }
  if (lower.includes('tycoon') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('pizza') || lower.includes('business')) {
     return 'TYCOON'; // Specific check for tycoon after general check if needed, but 'tycoon' keyword covers it.
  }
  
  return 'GENERAL';
}

export async function getRecentTestimonials(): Promise<TestimonialData[]> {
  try {
    // Removed payment_status filter for wider results as requested
    const { data: payments, error } = await supabase
      .from('payments')
      .select('payer_email, tier, created_at, roblox_username')
      .neq('payer_email', 'sb-4328s33649666@personal.example.com') 
      .not('payer_email', 'like', '%@personal.example.com')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
    
    // Debug log
    console.log(`Fetched ${payments?.length} payments. Filtering...`);

    if (!payments || payments.length === 0) {
      return [];
    }

    const scripts = await fetchScripts();
    const scriptNames = scripts.map(s => s.name);

    return payments
      .filter(p => {
        // Must have either a valid email (not EMPTY) or a roblox username
        const hasEmail = p.payer_email && p.payer_email !== 'EMPTY';
        const hasRoblox = !!p.roblox_username;
        return hasEmail || hasRoblox;
      })
      .map((payment, index) => {
        // Deterministic selection
        // Use roblox username for seed/index if email is missing
        const seedString = payment.payer_email === 'EMPTY' || !payment.payer_email 
            ? (payment.roblox_username || 'user') 
            : payment.payer_email;
            
        // Select a script name consistently
        let scriptName = payment.tier;
        // If tier is generic ('lifetime', 'monthly'), pick a random script name if available
        if (scriptNames.length > 0 && (scriptName.toLowerCase().includes('lifetime') || scriptName.toLowerCase().includes('monthly'))) {
           const scriptIndex = (seedString.length + index) % scriptNames.length;
           scriptName = scriptNames[scriptIndex];
        } else if (!scriptName) {
            scriptName = "Premium Script";
        }
        
        // Remove "Script" keyword if present (case insensitive)
        scriptName = scriptName.replace(/\s*script$/i, '').trim();

        // Determine Category and Review
        const category = getScriptCategory(scriptName);
        const templates = REVIEWS_BY_CATEGORY[category] || REVIEWS_BY_CATEGORY.GENERAL;
        const reviewIndex = (seedString.length + index) % templates.length;

        // Determine Author Name
        let authorName = 'Verified User';
        if (payment.roblox_username) {
            authorName = maskUsername(payment.roblox_username);
        } else if (payment.payer_email && payment.payer_email !== 'EMPTY') {
            authorName = maskEmail(payment.payer_email);
        }

        return {
          content: templates[reviewIndex],
          author: authorName,
          role: scriptName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedString}`,
          rating: 5,
          highlight: false // We'll set this after slicing
        };
      })
      .slice(0, 6)
      .map((item, index) => ({
          ...item,
          highlight: index === 0 || index === 5
      }));

  } catch (error) {
    console.error('Unexpected error fetching testimonials:', error);
    return [];
  }
}
