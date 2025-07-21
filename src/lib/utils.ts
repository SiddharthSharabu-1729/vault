import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const iconKeywordMap: { [key: string]: string } = {
  // Social & Communication
  'google': 'Globe',
  'facebook': 'Facebook',
  'twitter': 'Twitter',
  'instagram': 'Instagram',
  'linkedin': 'Linkedin',
  'github': 'Github',
  'gitlab': 'Gitlab',
  'slack': 'Slack',
  'discord': 'MessageSquare',
  'zoom': 'Video',
  'teams': 'Users',
  'messenger': 'MessageCircle',
  'whatsapp': 'Phone',
  'telegram': 'Send',
  // Work & Productivity
  'office': 'Briefcase',
  'work': 'Briefcase',
  'trello': 'Trello',
  'jira': 'CheckSquare',
  'notion': 'Book',
  'drive': 'HardDrive',
  'dropbox': 'Box',
  'aws': 'Cloud',
  'azure': 'Cloud',
  'gcp': 'Cloud',
  'cloudflare': 'Cloudflare',
  'digitalocean': 'Droplet',
  'heroku': 'Box',
  // Finances
  'bank': 'Landmark',
  'finance': 'DollarSign',
  'paypal': 'CreditCard',
  'stripe': 'Stripe',
  'wise': 'Banknote',
  'revolut': 'Banknote',
  // Entertainment & Shopping
  'netflix': 'Clapperboard',
  'youtube': 'Youtube',
  'spotify': 'Music',
  'amazon': 'Amazon',
  'ebay': 'ShoppingBag',
  'apple': 'Apple',
  'gaming': 'Gamepad2',
  'steam': 'Steam',
  'epic': 'Sword',
  // Development
  'code': 'Code',
  'api': 'FileKey',
  'key': 'KeyRound',
  'openai': 'BrainCircuit',
  'firebase': 'Firebase',
  'vercel': 'Vercel',
  'netlify': 'Cloud',
  // Generic
  'personal': 'User',
  'social': 'Users',
  'shopping': 'ShoppingCart',
  'travel': 'Plane',
  'health': 'Heart',
  'education': 'GraduationCap',
  'crypto': 'Bitcoin',
  'server': 'Server',
  'database': 'Database',
  'mail': 'Mail',
  'email': 'Mail',
};

export function getIconForKeyword(keyword: string, defaultIcon: string = 'Globe'): string {
    const lowerKeyword = keyword.toLowerCase();

    for (const key in iconKeywordMap) {
        if (lowerKeyword.includes(key)) {
            return iconKeywordMap[key];
        }
    }

    return defaultIcon;
}
