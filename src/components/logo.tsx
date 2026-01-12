import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Compass className="h-7 w-7 text-primary" />
      <span className="font-headline text-xl font-bold">CareerCompass.ai</span>
    </div>
  );
}
