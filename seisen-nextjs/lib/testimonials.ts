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
  COMBAT: [], // Will fallback to GENERAL
  FARMING: [], // Will fallback to GENERAL
  SIMULATOR: [], // Will fallback to GENERAL
  TYCOON: [], // Will fallback to GENERAL
  GENERAL: [
    "This script hub is amazing! Works perfectly on every game I play.",
    "Best investment I've made. The features are super stable.",
    "Updates are always fast and the support is helpful.",
    "I've tried many hubs, but Seisen is by far the smoothest.",
    "Works exactly as described. 10/10 would recommend.",
    "Clean UI and very easy to use. No errors at all.",
    "Security is top notch. I feel safe using this on my main.",
    "Great community and even better scripts. Worth the premium.",
    "Finally a hub that actually delivers what it promises.",
    "The execution is instant and the scripts are very optimized."
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

const POPULAR_GAMES = [
    "Blox Fruits", "Pet Simulator 99", "Da Hood", "Blade Ball", 
    "The Strongest Battlegrounds", "BedWars", "Anime Defenders", 
    "Rivals", "Arsenal", "Murder Mystery 2"
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getScriptCategory(name: string): keyof typeof REVIEWS_BY_CATEGORY {
  const lower = name.toLowerCase();
  
  if (lower.includes('fruit') || lower.includes('blox') || lower.includes('combat') || lower.includes('war') || lower.includes('blade') || lower.includes('fight') || lower.includes('apex') || lower.includes('counter') || lower.includes('rivals') || lower.includes('shot') || lower.includes('gun') || lower.includes('fps') || lower.includes('blue heater')) {
    return 'COMBAT';
  }
  
  if (lower.includes('sim') || lower.includes('clicker') || lower.includes('tap') || lower.includes('legends') || lower.includes('lifting') || lower.includes('strongman') || lower.includes('punch') || lower.includes('run') || lower.includes('race') || lower.includes('hat') || lower.includes('pet') || lower.includes('anime defenders') || lower.includes('dig') || lower.includes('mining') || lower.includes('magnet')) {
    return 'SIMULATOR';
  }

  if (lower.includes('farm') || lower.includes('build') || lower.includes('fish') || lower.includes('plant') || lower.includes('quest') || lower.includes('adventure') || lower.includes('dungeon') || lower.includes('rpg')) {
    return 'FARMING';
  }
  
  if (lower.includes('tycoon') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('pizza') || lower.includes('business')) {
     return 'TYCOON'; 
  }
  
  if (lower.includes('2') || lower.includes('3') || lower.includes('x') || lower.includes('simulator')) {
      return 'SIMULATOR';
  }
  
  return 'GENERAL';
}

const FEATURE_TEMPLATES = [
  "The {feature} is incredibly smooth and reliable.",
  "I love the {feature}, it makes the game so much easier.",
  "Best {feature} I've used. Totally undetectable.",
  "The {feature} works perfectly, exactly what I needed.",
  "Finally a working {feature} that doesn't crash.",
  "Super fast {feature}. I'm progressing way quicker now.",
  "The {feature} is a game changer for me.",
  "Highly recommend for the {feature} alone."
];

const GENERIC_REVIEWS = [
    "This script hub is amazing! Works perfectly on every game I play.",
    "Best investment I've made. The features are super stable.",
    "Updates are always fast and the support is helpful.",
    "I've tried many hubs, but Seisen is by far the smoothest.",
    "Works exactly as described. 10/10 would recommend.",
    "Clean UI and very easy to use. No errors at all.",
    "Security is top notch. I feel safe using this on my main.",
    "Great community and even better scripts. Worth the premium.",
    "Finally a hub that actually delivers what it promises.",
    "The execution is instant and the scripts are very optimized."
];

export async function getRecentTestimonials(): Promise<TestimonialData[]> {
  try {
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

    if (!payments || payments.length === 0) {
      return [];
    }

    const scripts = await fetchScripts();
    const scriptNames = scripts.map(s => s.name);
    // Map script name to its features
    const scriptFeaturesMap = new Map<string, string[]>();
    scripts.forEach(s => {
        if (s.features && s.features.length > 0) {
            scriptFeaturesMap.set(s.name, s.features);
        }
    });

    return payments
      .filter(p => {
        const hasEmail = p.payer_email && p.payer_email !== 'EMPTY';
        const hasRoblox = !!p.roblox_username;
        return hasEmail || hasRoblox;
      })
      .map((payment, index) => {
        const seedString = payment.payer_email === 'EMPTY' || !payment.payer_email 
            ? (payment.roblox_username || 'user') 
            : payment.payer_email;
            
        let scriptName = payment.tier;
        
        // Resolve generic names to actual script names
        const lowerTier = scriptName.toLowerCase();
        if (lowerTier.includes('weekly') || lowerTier.includes('monthly') || lowerTier.includes('lifetime') || lowerTier === 'premium') {
             if (scriptNames.length > 0) {
                 const scriptIndex = (hashCode(seedString) + index + hashCode(payment.created_at)) % scriptNames.length;
                 scriptName = scriptNames[scriptIndex];
             } else {
                 const gameIndex = (hashCode(seedString) + index + hashCode(payment.created_at)) % POPULAR_GAMES.length;
                 scriptName = POPULAR_GAMES[gameIndex];
             }
        } else if (!scriptName) {
            if (scriptNames.length > 0) {
                 scriptName = scriptNames[0];
            } else {
                 scriptName = "Blox Fruits"; 
            }
        }
        
        // Clean up script name
        scriptName = scriptName.replace(/\s*script$/i, '').trim();

        // Determine Content
        let content = "";
        const features = scriptFeaturesMap.get(scriptName);
        
        // 70% chance to use a feature-based review if features exist
        const useFeature = features && features.length > 0 && (hashCode(seedString + index) % 10) < 7;
        
        if (useFeature && features) {
            // Pick a random feature
            const featureIndex = (hashCode(seedString) + index) % features.length;
            const feature = features[featureIndex];
            
            // Pick a random template
            const templateIndex = (hashCode(seedString) + index + 1) % FEATURE_TEMPLATES.length;
            content = FEATURE_TEMPLATES[templateIndex].replace('{feature}', feature);
        } else {
            // Fallback to generic
            const genericIndex = (hashCode(seedString) + index) % GENERIC_REVIEWS.length;
            content = GENERIC_REVIEWS[genericIndex];
        }

        let authorName = 'Verified User';
        if (payment.roblox_username) {
            authorName = maskUsername(payment.roblox_username);
        } else if (payment.payer_email && payment.payer_email !== 'EMPTY') {
            authorName = maskEmail(payment.payer_email);
        }

        return {
          content: content,
          author: authorName,
          role: scriptName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedString}`,
          rating: 5,
          highlight: false 
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
