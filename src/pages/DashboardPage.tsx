import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Clock,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, isPro, loading: subLoading, refetch } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCancelSubscription = async () => {
    if (!subscription?.paddle_subscription_id) return;

    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'cancel',
          subscriptionId: subscription.paddle_subscription_id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will remain active until the end of your billing period.',
      });

      await refetch();
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast({
        title: 'Failed to cancel',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      case 'past_due':
        return 'text-yellow-500';
      case 'paused':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
      case 'paused':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="container mx-auto px-4 py-24 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Account Dashboard</h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </motion.div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Profile
                  {isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Pro
                    </span>
                  )}
                </h2>
                <p className="text-muted-foreground">Your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">{formatDate(user?.created_at || null)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Subscription</h2>
                <p className="text-muted-foreground">Manage your plan</p>
              </div>
            </div>

            {isPro && subscription ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(subscription.status)}
                      <span className={`font-semibold capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p className="font-semibold capitalize">{subscription.plan_type}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Current Period Ends</p>
                    </div>
                    <p className="font-semibold">{formatDate(subscription.current_period_end)}</p>
                  </div>
                </div>

                {subscription.status === 'active' && (
                  <div className="pt-4 border-t border-border/50">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your Pro features will remain active until the end of your current billing period on {formatDate(subscription.current_period_end)}. After that, you'll lose access to Pro features.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isCancelling ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Yes, Cancel'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {subscription.status === 'cancelled' && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">
                      Your subscription has been cancelled and will end on {formatDate(subscription.current_period_end)}.
                    </p>
                    <Link to="/pricing" className="mt-3 inline-block">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        Resubscribe
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Upgrade to Pro to unlock AI features, cloud sync, and unlimited notes.
                </p>
                <Link to="/pricing">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/notes" className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">My Notes</p>
                  <p className="text-sm text-muted-foreground">View all your notes</p>
                </div>
              </Link>
              <Link to="/bookmarks" className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Bookmarks</p>
                  <p className="text-sm text-muted-foreground">Saved articles</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
