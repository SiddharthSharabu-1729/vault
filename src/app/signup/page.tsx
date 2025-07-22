
'use client';

import { SignupForm } from '@/components/auth/signup-form';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Create Your Vault</h1>
                <p className="text-muted-foreground">Secure your digital life with a new account.</p>
            </div>
            <SignupForm />
        </motion.div>
    </main>
  );
}
