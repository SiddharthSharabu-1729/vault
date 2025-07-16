import type { LucideIcon } from 'lucide-react';
import { Banknote, Briefcase, Globe, LayoutGrid, Users, User, Tv, type Icon } from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export const defaultCategories: Omit<Category, 'id'>[] = [
    { name: 'Work', slug: 'work', icon: 'Briefcase' },
    { name: 'Personal', slug: 'personal', icon: 'User' },
    { name: 'Banking', slug: 'banking', icon: 'Banknote' },
    { name: 'Social Media', slug: 'social-media', icon: 'Users' },
    { name: 'Streaming', slug: 'streaming', icon: 'Tv' },
];

export const iconMap: { [key: string]: LucideIcon | Icon } = {
  Banknote,
  Briefcase,
  Globe,
  LayoutGrid,
  Users,
  User,
  Tv,
};


export type PasswordEntry = {
  id: string;
  serviceName: string;
  username: string;
  url: string;
  category: string;
  icon: string;
  password: string;
};

export const passwordEntries: PasswordEntry[] = [];
