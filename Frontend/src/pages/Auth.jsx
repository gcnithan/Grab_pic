import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('USER'); // 'USER' or 'ORGANIZER'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      navigate(role === 'ORGANIZER' ? '/dashboard' : '/join');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <Card glass className="w-full max-w-md animate-fade-in relative z-10 border-white/20 dark:border-white/10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Sign up to start organizing or finding photos'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            {/* Role Switcher */}
            {!isLogin && (
              <div className="flex p-1 bg-muted/50 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'USER' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Participant
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ORGANIZER')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'ORGANIZER' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Organizer
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Full Name" 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
