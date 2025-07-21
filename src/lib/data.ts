
import type { LucideIcon } from 'lucide-react';
import { Banknote, Briefcase, Globe, LayoutGrid, Users, User, Tv, Folder, FolderPlus, KeyRound, StickyNote, Facebook, Twitter, Instagram, Linkedin, Github, Gitlab, Slack, MessageSquare, Video, MessageCircle, Phone, Send, Trello, CheckSquare, Book, HardDrive, Box, Cloud, Droplet, Landmark, DollarSign, CreditCard, Clapperboard, Youtube, Music, ShoppingCart, ShoppingBag, Plane, Heart, GraduationCap, Bitcoin, Server, Database, Mail, Gamepad2, Sword, BrainCircuit, Apple, FileKey, Triangle, CopyCheck } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

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
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Gitlab,
  Slack,
  MessageSquare,
  Video,
  MessageCircle,
  Phone,
  Send,
  Trello,
  CheckSquare,
  Book,
  HardDrive,
  Box,
  Cloud,
  Droplet,
  Landmark,
  DollarSign,
  CreditCard,
  Clapperboard,
  Youtube,
  Music,
  ShoppingCart,
  ShoppingBag,
  Plane,
  Heart,
  GraduationCap,
  Bitcoin,
  Server,
  Database,
  Mail,
  Gamepad2,
  Sword,
  BrainCircuit,
  Apple,
  FileKey,
  Triangle,
  CopyCheck,
  // Add more icons as needed for the keyword matcher
  Stripe: DollarSign, // Using DollarSign as a stand-in as there's no official Stripe icon
  Amazon: ShoppingCart, // Using ShoppingCart as a stand-in for Amazon
  Firebase: Cloud, // Using Cloud for Firebase
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

export type ActivityLog = {
    id: string;
    action: string;
    details: string;
    timestamp: Timestamp;
};

export type ProgressStep = 
  | 'idle'
  | 'verifying'
  | 'fetching'
  | 'decrypting'
  | 'encrypting'
  | 'updating'
  | 'finalizing'
  | 'complete'
  | 'error';


export const passwordEntries: VaultEntry[] = [];
