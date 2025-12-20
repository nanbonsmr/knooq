import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

interface ProGateProps {
  children?: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

export function ProGate({ children, fallback, featureName = 'this feature' }: ProGateProps) {
  const { isPro, loading } = useSubscription();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isPro && children) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Upgrade to Pro to unlock {featureName} and take your learning to the next level.
      </p>
      <Link to="/pricing">
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </Link>
      {!user && (
        <p className="text-sm text-muted-foreground mt-4">
          Already have Pro?{' '}
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium ${className}`}>
      <Crown className="w-3 h-3" />
      Pro
    </span>
  );
}
