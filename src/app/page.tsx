import { LoginForm } from '@/components/auth/login-form';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Fortress Vault</h1>
          <p className="text-muted-foreground">Securely manage your digital life.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
