import React from 'react';
import { VaultProvider } from '@/contexts/vaultContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VaultProvider>{children}</VaultProvider>;
}
