import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, QrCode } from 'lucide-react';

export default function Join() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (code.length < 3) return;
    
    setLoading(true);
    // Simulate API verification
    setTimeout(() => {
      setLoading(false);
      navigate(`/event/${code}/scanner`);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 animate-fade-in">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Join Event</h1>
          <p className="text-muted-foreground text-lg">
            Enter the join code provided by the organizer to find your photos.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6 mt-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="e.g. IO2026"
              className="h-16 text-center text-2xl tracking-[0.2em] font-mono font-bold uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg shadow-lg shadow-primary/25"
            isLoading={loading}
            disabled={code.length < 3}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
