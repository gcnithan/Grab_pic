import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Image as ImageIcon, Users, Copy, Check } from 'lucide-react';

export default function OrganizerDashboard() {
  const [copiedCode, setCopiedCode] = useState(null);

  // Mock Data
  const events = [
    { id: 1, name: 'Google I/O 2026', code: 'IO2026', date: 'Oct 15, 2026', photos: 1250 },
    { id: 2, name: 'Sarah\'s Wedding', code: 'sarah25', date: 'Sep 02, 2026', photos: 432 },
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and photo uploads</p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} glass className="group hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex justify-between items-center text-xl">
                {event.name}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">{event.date}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Join Code</div>
                  <div className="font-mono text-lg font-bold tracking-widest">{event.code}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(event.code)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {copiedCode === event.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center text-muted-foreground text-sm mb-1">
                    <ImageIcon className="h-4 w-4 mr-1.5" />
                    Photos
                  </div>
                  <span className="text-xl font-semibold">{event.photos.toLocaleString()}</span>
                </div>
                <Button variant="outline" className="h-full bg-background/50 border-border/50 hover:border-primary">
                  Upload ZIP
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
