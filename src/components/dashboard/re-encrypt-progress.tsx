
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoaderCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';


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

const stepDetails: Record<ProgressStep, { text: string; Icon: React.ElementType }> = {
    idle: { text: "Starting process...", Icon: LoaderCircle },
    verifying: { text: "Verifying current master password...", Icon: LoaderCircle },
    fetching: { text: "Fetching encrypted vault data...", Icon: LoaderCircle },
    decrypting: { text: "Decrypting vault with old key...", Icon: LoaderCircle },
    encrypting: { text: "Applying new cryptographic key...", Icon: LoaderCircle },
    updating: { text: "Committing new vault data...", Icon: LoaderCircle },
    finalizing: { text: "Finalizing key rotation...", Icon: LoaderCircle },
    complete: { text: "Security upgrade complete!", Icon: CheckCircle },
    error: { text: "An error occurred.", Icon: ShieldAlert },
}


interface ReEncryptProgressProps {
  open: boolean;
  progress: ProgressStep;
  error?: string | null;
  onOpenChange?: (open: boolean) => void;
}

export function ReEncryptProgress({ open, progress, error, onOpenChange }: ReEncryptProgressProps) {

  const getStepStatus = (step: ProgressStep, currentProgress: ProgressStep) => {
    const order: ProgressStep[] = ['verifying', 'fetching', 'decrypting', 'encrypting', 'updating', 'finalizing', 'complete'];
    const currentIndex = order.indexOf(currentProgress);
    const stepIndex = order.indexOf(step);

    if (currentProgress === 'error') {
      return 'pending';
    }
    if (stepIndex < currentIndex) {
      return 'complete';
    }
    if (stepIndex === currentIndex) {
      return 'in_progress';
    }
    return 'pending';
  };

  const isCompleteOrError = progress === 'complete' || progress === 'error';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideCloseButton={!isCompleteOrError}>
        <DialogHeader>
          <DialogTitle>Updating Vault Security</DialogTitle>
          <DialogDescription>
            Your master password is being updated. This requires re-encrypting your entire vault. Please do not close this window.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 font-mono text-sm py-4">
            {Object.keys(stepDetails).filter(s => s !== 'idle' && s !== 'error' && s !== 'complete').map(key => {
                const step = key as ProgressStep;
                const status = getStepStatus(step, progress);
                const { text } = stepDetails[step];

                return (
                    <div key={step} className="flex items-center gap-3">
                        {status === 'complete' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : status === 'in_progress' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <LoaderCircle className="h-4 w-4 text-muted-foreground/30" />
                        )}
                        <span className={cn('transition-colors', {
                            'text-green-500': status === 'complete',
                            'text-primary font-medium': status === 'in_progress',
                            'text-muted-foreground': status === 'pending'
                        })}>
                           {text}
                        </span>
                    </div>
                );
            })}
        </div>
        {progress === 'complete' && (
             <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-500">Vault update complete. You can now close this dialog.</p>
             </div>
        )}
        {progress === 'error' && (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{error || 'An unexpected error occurred. Please try again.'}</p>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange?.(false)}>Close</Button>
                </DialogFooter>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
