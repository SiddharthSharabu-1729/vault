import type { LucideIcon } from 'lucide-react';
import { Banknote, Briefcase, Globe, LayoutGrid, Users, User, Tv, Folder, FolderPlus } from 'lucide-react';

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
