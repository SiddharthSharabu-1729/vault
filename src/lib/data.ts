import type { LucideIcon } from 'lucide-react';
import { Banknote, Briefcase, Globe, LayoutGrid, Users, User, Tv, Folder, FolderPlus, KeyRound, StickyNote } from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export const defaultCategories: Omit<Category, 'id'>[] = [
    { name: 'Work', slug: 'work', icon: 'Briefcase' },
    { name: 'Personal', slug: 'personal', icon: 'User' },
    { name: 'Social', slug: 'social', icon: 'Users' },
];

export const iconMap: { [key: string]: LucideIcon } = {
  Banknote,
  Briefcase,
  Globe,
  LayoutGrid,
  Users,
  User,
  Tv,
  Folder,
  FolderPlus,
  KeyRound,
  StickyNote,
};


export type EntryType = 'password' | 'note' | 'apiKey';

export type VaultEntry = {
  id: string;
  type: EntryType;
  title: string;
  category: string;
  icon: string;
  
  // Password fields
  username?: string;
  url?: string;
  password?: string; // encrypted

  // Note field
  notes?: string;
  
  // API Key field
  apiKey?: string; // encrypted
};

export const passwordEntries: VaultEntry[] = [];
