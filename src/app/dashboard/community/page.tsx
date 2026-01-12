
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="flex items-center justify-center h-[60vh] text-center">
      <Card className="max-w-lg glass-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Community Feature in Progress</CardTitle>
          <CardDescription>
            Our team is building a space for you to connect, learn, and grow with others. Please check back soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">We're creating forums, mentorship programs, and networking events.</p>
        </CardContent>
      </Card>
    </div>
  );
}
