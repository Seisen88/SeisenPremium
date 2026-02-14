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
    "Beating teamers has never been this satisfying. The target selection is flawless.",
    "The silent aim is actually silent. No one suspects a thing in ranked.",
    "Updates are faster than the game devs themselves. Always working when I need it.",
    "I've tried other hubs, but Seisen's smoothness in combat is on another level.",
    "Finally a script that doesn't drop my FPS during intense fights. Optimized perfectly."
  ],
  FARMING: [
    "Leveling up has never been easier. This tool autofarms exactly as promised while I sleep.",
    "From complex raids to simple farming, Seisen handles it all brilliantly. Indispensable tool.",
    "Seisen understands game mechanics better than any other tool. Dramatically improved my grinding efficiency.",
    "The auto-quest features are bug-free and super efficient. Saved me hundreds of hours.",
    "I maxed out my account in days thanks to this. The resource collection is completely automated.",
    "Woke up to max level and millions in currency. This is the definition of efficiency.",
    "The pathfinding is surprisingly smart. It doesn't get stuck like other free scripts.",
    "Grinding events is a breeze now. I finish the battlepass in a day.",
    "Stable enough to run 24/7 on my VPS. Zero crashes in a week.",
    "Best auto-dungeon I've used. Clears rooms faster than a full squad."
  ],
  SIMULATOR: [
    "I hatched 3 huge pets overnight thanks to the auto-hatch. Best simulator script out there.",
    "The auto-clicker speed is insane, I'm topping the leaderboards effortlessly now.",
    "Rebirthing is so tedious usually, but Seisen handles it automatically. Love it.",
    "It collects every single coin and orb. My currency just keeps going up.",
    "Perfect for egg opening events. I can afk all night and wake up to a full inventory.",
    "The auto-upgrade feature is smart, it prioritizes exactly what I need for max efficiency.",
    "Grinding strength has never been faster. It hits every training spot perfectly.",
    "I unlocked all the worlds in one day. The teleport farming is super optimized."
  ],
  TYCOON: [
    "The best automation for building my empire. It manages everything perfectly.",
    "Cash flow maximized instantly. This script handles the complex math and timing for me.",
    "I built the biggest base in the server overnight. The auto-build feature is flawless.",
    "Perfect for AFK management. I come back to millions of cash every time.",
    "It collects drops so fast I can't even see them correctly. Insane speed.",
    "Rebirth grinding is painless now. It does the tedious clicking for me."
  ],
  GENERAL: [
    "The customization options let me tailor the scripts perfectly to my playstyle. Game-changing.",
    "Customer support helped me set everything up in minutes. Works perfectly!",
    "Best investment I've made for this game. Updates are fast and the script is super stable.",
    "Easy to safe, undetectable, and powerful. Exactly what I needed.",
    "The UI is clean and the features just work. No hassle setup.",
    "I appreciate how easy it is to switch between games. One hub for everything.",
    "Security is top notch. Haven't had a single warning on my main account.",
    "Worth the premium price for the peace of mind and constant updates."
  ]
};

// ... keep mask functions and POPULAR_GAMES ...

function getScriptCategory(name: string): keyof typeof REVIEWS_BY_CATEGORY {
  const lower = name.toLowerCase();
  
  // COMBAT Keywords
  if (lower.includes('fruit') || lower.includes('blox') || lower.includes('combat') || lower.includes('war') || lower.includes('blade') || lower.includes('fight') || lower.includes('apex') || lower.includes('counter') || lower.includes('rivals') || lower.includes('shot') || lower.includes('gun') || lower.includes('fps') || lower.includes('blue heater')) {
    return 'COMBAT';
  }
  
  // SIMULATOR Keywords - Prioritize specific simulator terms
  if (lower.includes('sim') || lower.includes('clicker') || lower.includes('tap') || lower.includes('legends') || lower.includes('lifting') || lower.includes('strongman') || lower.includes('punch') || lower.includes('run') || lower.includes('race') || lower.includes('hat') || lower.includes('pet') || lower.includes('anime defenders') || lower.includes('dig') || lower.includes('mining') || lower.includes('magnet')) {
    return 'SIMULATOR';
  }

  // FARMING Keywords - General RPG/Grinding
  if (lower.includes('farm') || lower.includes('build') || lower.includes('fish') || lower.includes('plant') || lower.includes('quest') || lower.includes('adventure') || lower.includes('dungeon') || lower.includes('rpg')) {
    return 'FARMING';
  }
  
  // TYCOON
  if (lower.includes('tycoon') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('pizza') || lower.includes('business')) {
     return 'TYCOON'; 
  }
  
  // Default fallback for simulators if undetected but likely
  if (lower.includes('2') || lower.includes('3') || lower.includes('x') || lower.includes('simulator')) {
      return 'SIMULATOR';
  }
  
  return 'GENERAL';
}

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
    
    // Debug log
    console.log(`Fetched ${payments?.length} payments. Filtering...`);

    if (!payments || payments.length === 0) {
      return [];
    }

    const scripts = await fetchScripts();
    const scriptNames = scripts.map(s => s.name);

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
        
        scriptName = scriptName.replace(/\s*script$/i, '').trim();

        const category = getScriptCategory(scriptName);
        const templates = REVIEWS_BY_CATEGORY[category] || REVIEWS_BY_CATEGORY.GENERAL;
        
        const reviewIndex = (hashCode(seedString) + index + hashCode(payment.created_at || '')) % templates.length;

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
