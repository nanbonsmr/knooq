import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowLeft, Crown, Zap, Brain, BookOpen, Cloud, Highlighter, StickyNote, MessageSquare, FileText, Download, HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DODO_PRODUCTS = {
  monthly: 'pdt_0NUsdiOjfNaWrdRszIF3G',
  yearly: 'pdt_0NUsdwQNbzZqB4N10dNso',
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isPro) {
      toast({
        title: 'Already subscribed',
        description: 'You already have an active Pro subscription.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-dodo-checkout', {
        body: {
          productId: DODO_PRODUCTS[billingCycle],
          userId: user.id,
          userEmail: user.email,
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: 'Unlimited article access', free: true, pro: true },
    { icon: Highlighter, text: 'Highlight & save text', free: false, pro: true },
    { icon: Brain, text: 'AI-powered summaries', free: false, pro: true },
    { icon: Sparkles, text: 'AI chat assistant', free: false, pro: true },
    { icon: Cloud, text: 'Cloud sync across devices', free: false, pro: true },
    { icon: Zap, text: 'Smart note suggestions', free: false, pro: true },
  ];

  const proFeatures = [
    {
      icon: Highlighter,
      title: 'Smart Highlights',
      description: 'Highlight important text while reading and access them anytime from your dashboard.',
    },
    {
      icon: StickyNote,
      title: 'Quick Notes',
      description: 'Add notes directly from selected text with one click. Organize your thoughts effortlessly.',
    },
    {
      icon: BookOpen,
      title: 'Study Mode',
      description: 'Focus on learning with a distraction-free reading experience and split-view workspace.',
    },
    {
      icon: Brain,
      title: 'AI Summaries',
      description: 'Get instant TL;DR summaries of any article powered by advanced AI models.',
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Ask questions about the article and get intelligent answers in real-time.',
    },
    {
      icon: Zap,
      title: 'AI Note Suggestions',
      description: 'Let AI analyze the article and suggest relevant notes and key takeaways.',
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Access your highlights, notes, and bookmarks from any device, anywhere.',
    },
    {
      icon: Download,
      title: 'Export Notes',
      description: 'Export your notes and highlights to PDF or text files for offline use.',
    },
  ];

  const faqs = [
    {
      question: "What happens after I subscribe to Pro?",
      answer: "Once you subscribe, all Pro features are instantly unlocked. You can start highlighting text, using AI features, and syncing your notes across devices immediately.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You will continue to have access to Pro features until the end of your current billing period.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and various local payment methods through our secure payment provider, Dodo Payments.",
    },
    {
      question: "Is there a free trial available?",
      answer: "While we do not offer a free trial, you can explore the free tier to get familiar with the app. If Pro is not right for you, you can cancel within the first 7 days for a full refund.",
    },
    {
      question: "Will my data be saved if I cancel?",
      answer: "Yes, your notes and highlights will be preserved even if you cancel. However, you will not be able to add new highlights or use AI features until you resubscribe.",
    },
    {
      question: "How does the yearly billing work?",
      answer: "With yearly billing, you pay once per year and save 20% compared to monthly billing. The full amount ($95.88) is charged upfront for the entire year.",
    },
  ];

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

      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Upgrade to Pro</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock Your Full
            <span className="block gradient-text">Learning Potential</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to AI features, cloud sync, and smart note-taking tools.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-xl bg-secondary/50">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-accent">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-6">Basic access to explore</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Button variant="outline" className="w-full mb-8" disabled>
              Current Plan
            </Button>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.free ? (
                    <Check className="w-5 h-5 text-accent" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
                  )}
                  <span className={feature.free ? 'text-foreground' : 'text-muted-foreground'}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pro plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 border-2 border-primary/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-xl">
              POPULAR
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Pro
            </h3>
            <p className="text-muted-foreground mb-6">Full access to all features</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${billingCycle === 'monthly' ? '9.99' : '7.99'}
              </span>
              <span className="text-muted-foreground">/month</span>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-accent mt-1">Billed annually ($95.88/year)</p>
              )}
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || isPro}
              className="w-full mb-8 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isPro ? (
                'Already Subscribed'
              ) : (
                'Get Pro'
              )}
            </Button>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent" />
                  <span className="text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Pro Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Get with <span className="gradient-text">Pro</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlock the full potential of your learning experience with these powerful features.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {proFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground mb-6">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We have answers.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-2xl px-6 border-none"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Trust section */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground mt-16"
        >
          Cancel anytime. Secure payment powered by Dodo Payments.
        </motion.p>
      </div>
    </div>
  );
}
