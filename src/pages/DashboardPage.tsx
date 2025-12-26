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
  ExternalLink,
  BookOpen,
  Highlighter,
  Brain,
  MessageSquare,
  Cloud,
  Download,
  Zap,
  StickyNote,
  List,
  Sparkles,
  FileText,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
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

const proFeatures = [
  {
    icon: BookOpen,
    title: 'Study Mode',
    description: 'Distraction-free reading with split-view workspace for notes',
    available: true,
    link: '/',
  },
  {
    icon: List,
    title: 'Table of Contents',
    description: 'Navigate long articles with auto-generated table of contents',
    available: true,
    link: '/',
  },
  {
    icon: Highlighter,
    title: 'Smart Highlights',
    description: 'Highlight important text and access them from your dashboard',
    available: true,
    link: '/notes',
  },
  {
    icon: StickyNote,
    title: 'Quick Notes',
    description: 'Add notes from selected text with drag-and-drop support',
    available: true,
    link: '/notes',
  },
  {
    icon: Brain,
    title: 'AI Summaries',
    description: 'Get instant TL;DR summaries of any article with AI',
    available: true,
    link: '/',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Ask questions about articles and get intelligent answers',
    available: true,
    link: '/',
  },
  {
    icon: Zap,
    title: 'AI Note Suggestions',
    description: 'Let AI analyze articles and suggest key takeaways',
    available: true,
    link: '/',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description: 'Access your notes and highlights from any device',
    available: true,
    link: '/notes',
  },
  {
    icon: Download,
    title: 'Export Notes',
    description: 'Export your notes and highlights to PDF or Markdown',
    available: true,
    link: '/notes',
  },
  {
    icon: FileText,
    title: 'Cloud Storage',
    description: 'Upload and store files securely in the cloud',
    available: true,
    link: '/notes',
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, isPro, loading: subLoading, refetch } = useSubscription();
  const { notes, highlights, recentArticles } = useStore();
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
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            {isPro ? 'Pro Dashboard' : 'Account Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isPro ? 'Access all your Pro features and manage your account' : 'Manage your account and subscription'}
          </p>
        </motion.div>

        {/* Stats Overview - Pro Only */}
        {isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{recentArticles.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Articles Read</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{notes.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Notes</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Highlighter className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{highlights.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Highlights</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline text-green-500" />
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Cloud Synced</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    Profile
                    {isPro && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Pro
                      </span>
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your account information</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Member since</p>
                    <p className="text-sm font-medium">{formatDate(user?.created_at || null)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-secondary flex items-center justify-center">
                  <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Subscription</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage your plan</p>
                </div>
              </div>

              {isPro && subscription ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(subscription.status)}
                        <span className={`text-sm font-semibold capitalize ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Plan</p>
                      <p className="text-sm font-semibold capitalize">{subscription.plan_type}</p>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Renews on</p>
                    </div>
                    <p className="text-sm font-semibold">{formatDate(subscription.current_period_end)}</p>
                  </div>

                  {subscription.status === 'active' && (
                    <div className="pt-3 border-t border-border/50">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs sm:text-sm">
                            Cancel Subscription
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-border max-w-md mx-4">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Your Pro features will remain active until {formatDate(subscription.current_period_end)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              disabled={isCancelling}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {subscription.status === 'cancelled' && (
                    <div className="p-3 rounded-lg sm:rounded-xl bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive mb-2">
                        Subscription ends on {formatDate(subscription.current_period_end)}.
                      </p>
                      <Link to="/pricing">
                        <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xs">
                          Resubscribe
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">No Active Subscription</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Upgrade to unlock all Pro features
                  </p>
                  <Link to="/pricing">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Pro Features */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Pro Features</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isPro ? 'All features unlocked' : 'Upgrade to unlock these features'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {proFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.03 }}
                  >
                    {isPro ? (
                      <Link
                        to={feature.link}
                        className="flex items-start gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                          <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm sm:text-base">{feature.title}</p>
                            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/20 opacity-60">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 relative">
                          <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          <Lock className="w-3 h-3 text-muted-foreground absolute -bottom-1 -right-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base text-muted-foreground">{feature.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/60 line-clamp-2">{feature.description}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {!isPro && (
                <div className="mt-4 sm:mt-6 pt-4 border-t border-border/50 text-center">
                  <Link to="/pricing">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock All Features
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Link to="/" className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/30 transition-colors">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">Explore</p>
                </Link>
                <Link to="/notes" className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/30 transition-colors">
                    <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">My Notes</p>
                </Link>
                <Link to="/bookmarks" className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-500/30 transition-colors">
                    <Highlighter className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">Bookmarks</p>
                </Link>
                <Link to="/pricing" className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-center group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-green-500/30 transition-colors">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">Pricing</p>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
