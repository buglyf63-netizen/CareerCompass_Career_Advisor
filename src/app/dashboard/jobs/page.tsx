
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="flex items-center justify-center h-[60vh] text-center">
      <Card className="max-w-lg glass-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <HardHat className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Feature in Progress</CardTitle>
          <CardDescription>
            Our team is hard at work building this feature. Please check back soon for updates on curated job listings!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">We're developing an advanced job matching engine to connect you with the best opportunities.</p>
        </CardContent>
      </Card>
    </div>
  );
}
