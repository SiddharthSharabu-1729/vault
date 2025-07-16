import type { LucideIcon } from 'lucide-react';
import { Banknote, Briefcase, Globe, LayoutGrid, Users, User, Tv } from 'lucide-react';

export type Category = {
  name: string;
  slug: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  { name: 'All Entries', slug: 'all', icon: LayoutGrid },
  { name: 'Work', slug: 'work', icon: Briefcase },
  { name: 'Personal', slug: 'personal', icon: User },
  { name: 'Banking', slug: 'banking', icon: Banknote },
  { name: 'Social Media', slug: 'social-media', icon: Users },
  { name: 'Streaming', slug: 'streaming', icon: Tv },
];

export type PasswordEntry = {
  id: string;
  serviceName: string;
  username: string;
  url: string;
  category: string;
  icon: LucideIcon;
};

export const passwordEntries: PasswordEntry[] = [
  {
    id: '1',
    serviceName: 'Google',
    username: 'example@gmail.com',
    url: 'google.com',
    category: 'personal',
    icon: Globe,
  },
  {
    id: '2',
    serviceName: 'GitHub',
    username: 'dev_user',
    url: 'github.com',
    category: 'work',
    icon: Globe,
  },
  {
    id: '3',
    serviceName: 'Twitter / X',
    username: '@ fortressuser',
    url: 'x.com',
    category: 'social-media',
    icon: Globe,
  },
  {
    id: '4',
    serviceName: 'Bank of America',
    username: 'secure_banker',
    url: 'bankofamerica.com',
    category: 'banking',
    icon: Globe,
  },
  {
    id: '5',
    serviceName: 'Netflix',
    username: 'watcher@email.com',
    url: 'netflix.com',
    category: 'streaming',
    icon: Globe,
  },
  {
    id: '6',
    serviceName: 'Figma',
    username: 'designer_pro',
    url: 'figma.com',
    category: 'work',
    icon: Globe,
  },
  {
    id: '7',
    serviceName: 'Stripe',
    username: 'payments@work.co',
    url: 'stripe.com',
    category: 'work',
    icon: Globe,
  },
  {
    id: '8',
    serviceName: 'Instagram',
    username: 'insta_user',
    url: 'instagram.com',
    category: 'social-media',
    icon: Globe,
  },
  {
    id: '9',
    serviceName: 'Chase Bank',
    username: 'finance_guru',
    url: 'chase.com',
    category: 'banking',
    icon: Globe,
  },
];
